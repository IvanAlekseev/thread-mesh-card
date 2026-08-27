import { SVG_ICONS } from './constants.js';

export function updateInspectorHud(cardInstance, node) {
  const root = cardInstance.shadowRoot;
  const hud = root.getElementById('inspectorHud');
  if (!hud) return;

  if (!node) {
    hud.style.display = 'none';
    return;
  }

  hud.style.display = 'flex';

  const isExpanded = Boolean(cardInstance._isDrawerExpanded);
  const drawer = root.getElementById('hudDrawer');
  if (drawer) drawer.style.display = isExpanded ? 'block' : 'none';
  const toggleIcon = root.getElementById('hudToggleIcon');
  if (toggleIcon) toggleIcon.innerHTML = isExpanded ? SVG_ICONS.chevronDown : SVG_ICONS.chevronUp;
  const toggleBtn = root.getElementById('hudToggleDetailsBtn');
  if (toggleBtn) toggleBtn.title = isExpanded ? 'Collapse Diagnostics' : 'Expand Diagnostics';

  const iconEl = root.getElementById('hudIcon');
  const titleEl = root.getElementById('hudTitle');
  const areaEl = root.getElementById('hudArea');
  const powerPill = root.getElementById('hudPowerPill');
  const routePill = root.getElementById('hudRoutePill');

  const roleEl = root.getElementById('hudRole');
  const routeEl = root.getElementById('hudRoute');
  const mfgEl = root.getElementById('hudMfg');
  const modelEl = root.getElementById('hudModel');
  const openHaBtn = root.getElementById('hudOpenHaBtn');

  if (iconEl) {
    iconEl.textContent = node.is_preferred_tbr ? '👑' : (node.is_border_router ? '🟣' : (node.role === 'router' ? '🔌' : '📡'));
  }
  if (titleEl) titleEl.textContent = node.shortName || node.friendlyName;
  if (areaEl) {
    areaEl.textContent = node.areaName || 'Unassigned';
    areaEl.style.backgroundColor = 'rgba(255,255,255,0.08)';
    areaEl.style.color = '#cbd5e1';
    areaEl.style.border = '1px solid rgba(255,255,255,0.12)';
  }

  // Calculate hops and route summary
  const hops = cardInstance._activeRoute?.hopCount || 0;
  const pathNodes = (cardInstance._activeRoute?.pathNodes || []).map(id => cardInstance._enrichedNodes.find(n => n.id === id)).filter(Boolean);

  const connectedEdge = cardInstance._enrichedEdges.find(e => {
    const u = typeof e.source === 'object' ? e.source.id : e.source;
    const v = typeof e.target === 'object' ? e.target.id : e.target;
    return u === node.id || v === node.id;
  });

  const isBatteryDevice = (node.battery !== null && node.battery !== undefined) || 
                          node.role === 'end_device' || 
                          node.role === 'battery_leaf' || 
                          (node.roleLabel && node.roleLabel.toLowerCase().includes('battery')) ||
                          (node.roleLabel && node.roleLabel.toLowerCase().includes('sleepy'));

  // Quick Bar Pills
  if (powerPill) {
    if (node.battery !== null && node.battery !== undefined) {
      const battIcon = (node.battery <= 20) ? '🪫' : '🔋';
      powerPill.textContent = `${battIcon} ${node.battery}%`;
      powerPill.style.display = 'inline-block';
    } else if (isBatteryDevice) {
      powerPill.textContent = '🔋 Battery';
      powerPill.style.display = 'inline-block';
    } else {
      powerPill.textContent = '⚡️ Mains';
      powerPill.style.display = 'inline-block';
    }
  }

  if (routePill) {
    const rssiStr = connectedEdge ? ` • ${connectedEdge.rssi || -60} dBm` : '';
    const hopText = node.is_preferred_tbr ? 'Leader' : (hops === 1 ? '1 hop' : (hops > 1 ? `${hops} hops` : 'Direct'));
    routePill.textContent = `${hopText}${rssiStr}`;
  }

  // Drawer Expanded Fields (6 Deep Telemetry Tiles)
  if (roleEl) roleEl.textContent = node.roleLabel || node.role;
  if (routeEl) {
    let routeSummary = 'Direct to Leader Hub';
    if (node.is_preferred_tbr || (hops === 0 && node.role === 'leader')) {
      routeSummary = 'Thread Network Coordinator';
    } else if (hops === 1) {
      routeSummary = 'Direct (1 hop to Leader)';
    } else if (hops > 1) {
      const lastHopNode = pathNodes[pathNodes.length - 2];
      const viaText = lastHopNode ? ` via ${lastHopNode.shortName}` : '';
      const lqiText = connectedEdge ? ` (LQI: ${connectedEdge.lqi || 3})` : '';
      routeSummary = `${hops} hops (${viaText.trim()})${lqiText}`;
    } else if (node._isOrphan) {
      routeSummary = 'Standby (No active routes)';
    }
    routeEl.textContent = routeSummary;
  }
  if (mfgEl) mfgEl.textContent = node.manufacturer || 'Matter Device';
  if (modelEl) {
    const numId = Number(node.node_id);
    const hexId = (!isNaN(numId) && numId > 0) ? ` (ID: 0x${numId.toString(16).toUpperCase()})` : '';
    modelEl.textContent = `${node.model || 'Matter Device'}${hexId}`;
  }

  const extAddrEl = root.getElementById('hudExtAddr');
  const densityEl = root.getElementById('hudMeshDensity');

  if (extAddrEl) {
    extAddrEl.textContent = node.ext_address || (node.node_id ? `Node ${node.node_id}` : 'Available in Matter');
  }

  // Count neighbors for this node
  const neighborCount = cardInstance._enrichedEdges.filter(e => {
    const u = typeof e.source === 'object' ? e.source.id : e.source;
    const v = typeof e.target === 'object' ? e.target.id : e.target;
    return u === node.id || v === node.id;
  }).length;

  if (densityEl) {
    densityEl.textContent = `Thread (NEST-PAN-7BF9) • ${neighborCount} neighbor${neighborCount === 1 ? '' : 's'}`;
  }

  if (openHaBtn) {
    if (node.ha_device_id || node.is_border_router) {
      openHaBtn.style.display = 'inline-flex';
      openHaBtn.title = node.ha_device_id ? `Manage ${node.shortName} in Home Assistant` : 'Manage in Home Assistant';
      openHaBtn.onclick = (e) => {
        e.stopPropagation();
        if (node.ha_device_id) {
          const path = `/config/devices/device/${node.ha_device_id}`;
          window.history.pushState(null, '', path);
          window.dispatchEvent(new CustomEvent('location-changed'));
        } else {
          const path = '/config/integrations/integration/thread';
          window.history.pushState(null, '', path);
          window.dispatchEvent(new CustomEvent('location-changed'));
        }
      };
    } else {
      openHaBtn.style.display = 'none';
    }
  }
}
