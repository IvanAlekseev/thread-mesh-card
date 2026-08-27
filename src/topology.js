import { getAreaColor, getAreaKey, stripAreaPrefix, getNodeStyle, getLinkStyle, isTbrNode } from './utils.js';

export async function discoverTbrs(cardInstance) {
  if (!cardInstance._hass) return;
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(), 1200);
    cardInstance._hass.connection.subscribeMessage((msg) => {
      if (msg && msg.type === 'router_discovered' && msg.key && msg.data) {
        cardInstance._discoveredTBRs[msg.key.toLowerCase()] = msg.data;
      }
    }, { type: 'thread/discover_routers' }).catch(() => resolve());
  });
}

export async function queryMatterJsTopology(cardInstance) {
  const [infoRes, sessionRes] = await Promise.all([
    cardInstance._hass.callWS({ type: 'supervisor/api', endpoint: '/addons/core_matter_server/info', method: 'get' }),
    cardInstance._hass.callWS({ type: 'supervisor/api', endpoint: '/ingress/session', method: 'post' }),
  ]);

  const ingressUrl = infoRes?.ingress_url;
  const session = sessionRes?.session;
  if (!ingressUrl) throw new Error('Could not resolve Matter Server ingress URL from Supervisor');
  if (!session) throw new Error('Could not create Ingress session token');

  const isHttps = window.location.protocol === 'https:';
  document.cookie = `ingress_session=${session}; path=/; SameSite=Lax${isHttps ? '; Secure' : ''}`;

  try {
    await fetch(ingressUrl, { credentials: 'include' });
  } catch (e) {}

  const protocol = isHttps ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}${ingressUrl}ws`;

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const timeout = setTimeout(() => {
      try { ws.close(); } catch (e) {}
      reject(new Error('Matter Server WS get_network_topology timed out after 8s'));
    }, 8000);

    ws.onopen = () => {
      ws.send(JSON.stringify({ message_id: 'topo_req_live', command: 'get_network_topology' }));
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.message_id === 'topo_req_live') {
          clearTimeout(timeout);
          try { ws.close(); } catch (e) {}
          if (data.error) {
            reject(new Error(`Matter Server error: ${JSON.stringify(data.error)}`));
          } else {
            resolve(data.result);
          }
        }
      } catch (ex) {
        reject(ex);
      }
    };

    ws.onerror = (err) => {
      clearTimeout(timeout);
      try { ws.close(); } catch (e) {}
      reject(err);
    };
  });
}

export async function fetchTopologyData(cardInstance) {
  const [areaRes, devRes, entRes] = await Promise.all([
    cardInstance._hass.callWS({ type: 'config/area_registry/list' }),
    cardInstance._hass.callWS({ type: 'config/device_registry/list' }),
    cardInstance._hass.callWS({ type: 'config/entity_registry/list' }),
  ]);

  const areasById = {};
  (areaRes || []).forEach(a => { areasById[a.area_id] = a.name; });

  const entitiesByDevice = {};
  (entRes || []).forEach(e => {
    if (!entitiesByDevice[e.device_id]) entitiesByDevice[e.device_id] = [];
    entitiesByDevice[e.device_id].push(e);
  });

  const devicesByNodeId = {};
  const hexPattern = /-([0-9A-Fa-f]{16})-/;
  (devRes || []).forEach(dev => {
    for (const [dom, ident] of (dev.identifiers || [])) {
      if (dom === 'matter' && typeof ident === 'string') {
        const m = hexPattern.exec(ident);
        if (m) {
          const decId = parseInt(m[1], 16);
          devicesByNodeId[decId] = dev;
          break;
        }
      }
    }
  });

  await discoverTbrs(cardInstance);
  const topoResult = await queryMatterJsTopology(cardInstance);

  if (!topoResult || !Array.isArray(topoResult.nodes)) {
    throw new Error('matter.js-server returned empty or invalid topology result');
  }

  const nodes = [];
  const seenNodeIds = new Set();
  const nodesByIdMap = new Map();

  topoResult.nodes.forEach(mNode => {
    const rawId = String(mNode.id || mNode.node_id);
    const isBorderRouter = (mNode.kind === 'border_router' || mNode.role === 'border_router' || mNode.role === 'leader');
    const extAddress = (mNode.ext_address || rawId.replace('br_', '')).toLowerCase();
    const isPreferredTbr = isBorderRouter && (extAddress.includes('0ed0a884813d4ddb') || mNode.role === 'leader' || (mNode.network_name && mNode.network_name.includes('ZBT')));
    const tbrInfo = cardInstance._discoveredTBRs[extAddress] || {};

    let friendlyName = '';
    let shortName = '';
    let areaName = 'Unassigned';
    let battery = null;
    let haDeviceId = null;
    let model = mNode.network_name || 'Thread Node';
    let manufacturer = 'Matter Device';

    if (isBorderRouter) {
      const tbrModel = tbrInfo.model_name || '';

      if (isPreferredTbr || tbrInfo.brand === 'homeassistant') {
        friendlyName = 'Connect ZBT-2 (Preferred TBR)';
        shortName = 'Connect ZBT-2';
        areaName = 'Cellar';
        model = 'OpenThread Border Router (Connect ZBT-2)';
        manufacturer = 'Home Assistant';
        const zbtDev = (devRes || []).find(d => {
          const name = (d.name_by_user || d.name || '').toLowerCase();
          const mdl = (d.model || '').toLowerCase();
          return name.includes('zbt') || name.includes('connect') || name.includes('skyconnect') ||
                 mdl.includes('zbt') || mdl.includes('connect') || mdl.includes('skyconnect');
        });
        if (zbtDev) haDeviceId = zbtDev.id;
      } else {
        let matchedDev = null;
        if (tbrModel) {
          matchedDev = (devRes || []).find(d => (d.model || '').toLowerCase() === tbrModel.toLowerCase());
        }

        if (matchedDev) {
          const devUserName = matchedDev.name_by_user || matchedDev.name;
          friendlyName = `${devUserName} (Border Router)`;
          shortName = devUserName;
          areaName = matchedDev.area_id ? (areasById[matchedDev.area_id] || 'Unassigned') : 'Unassigned';
          model = matchedDev.model || tbrModel || 'Google TV Streamer';
          manufacturer = matchedDev.manufacturer || 'Google Inc.';
          haDeviceId = matchedDev.id;
        } else {
          const fallbackName = tbrInfo.instance_name || `Border Router #${extAddress.slice(-4).toUpperCase()}`;
          friendlyName = `${fallbackName} (Border Router)`;
          shortName = fallbackName;
          model = tbrModel || 'Google TV Streamer';
          manufacturer = 'Google Inc.';
        }
      }
    } else if (mNode.node_id && devicesByNodeId[mNode.node_id]) {
      const dev = devicesByNodeId[mNode.node_id];
      haDeviceId = dev.id;
      const rawName = dev.name_by_user || dev.name || `Node ${mNode.node_id}`;
      areaName = dev.area_id ? (areasById[dev.area_id] || 'Unassigned') : 'Unassigned';
      friendlyName = rawName;
      shortName = stripAreaPrefix(rawName, areaName);
      model = dev.model || dev.name || 'Matter Device';
      manufacturer = dev.manufacturer || 'Matter';

      const devEntities = entitiesByDevice[dev.id] || [];
      const battEnt = devEntities.find(e => 
        e.original_device_class === 'battery' || 
        e.entity_id.includes('battery')
      );
      if (battEnt && cardInstance._hass.states[battEnt.entity_id]) {
        const val = parseFloat(cardInstance._hass.states[battEnt.entity_id].state);
        if (!isNaN(val)) battery = Math.round(val);
      }
    } else {
      friendlyName = `Thread Node ${rawId}`;
      shortName = `Node ${rawId}`;
    }

    const rawVer = mNode.thread_version || (isBorderRouter ? (tbrInfo.thread_version || '1.4.0') : '1.3');
    const threadVerStr = String(rawVer).toLowerCase().startsWith('thread') ? rawVer : `Thread ${rawVer}`;

    const areaKey = getAreaKey(areaName);
    const areaMeta = getAreaColor(areaName);
    const style = getNodeStyle(mNode.role, isBorderRouter, isPreferredTbr);

    const nodeObj = {
      node_id: mNode.node_id || rawId,
      id: rawId,
      friendlyName,
      shortName,
      areaName,
      areaKey,
      areaColor: areaMeta,
      role: style.roleKey,
      roleLabel: style.roleLabel,
      shape: style.shape,
      size: style.size,
      roleColor: style.color,
      is_border_router: isBorderRouter,
      is_preferred_tbr: isPreferredTbr,
      battery,
      ha_device_id: haDeviceId,
      model,
      manufacturer,
      ext_address: mNode.ext_address,
      thread_version: threadVerStr,
    };
    nodes.push(nodeObj);
    nodesByIdMap.set(rawId, nodeObj);
    seenNodeIds.add(rawId);
  });

  const edges = [];
  const seenEdges = new Set();

  (topoResult.connections || []).forEach(conn => {
    const src = String(conn.source);
    const tgt = String(conn.target);
    if (!seenNodeIds.has(src) || !seenNodeIds.has(tgt)) return;

    const edgeKey = src < tgt ? `${src}_${tgt}` : `${tgt}_${src}`;
    if (seenEdges.has(edgeKey)) return;
    seenEdges.add(edgeKey);

    const srcNode = nodesByIdMap.get(src);
    const tgtNode = nodesByIdMap.get(tgt);

    const isSrcTbr = isTbrNode(srcNode) || isTbrNode(src);
    const isTgtTbr = isTbrNode(tgtNode) || isTbrNode(tgt);
    const isTbrBackbone = Boolean(isSrcTbr && isTgtTbr);

    const style = getLinkStyle(conn, isTbrBackbone);

    edges.push({
      id: `edge_${src}_${tgt}`,
      source: src,
      target: tgt,
      from: src,
      to: tgt,
      link_type: conn.network || 'thread',
      lqi: style.lqi ?? 3,
      rssi: style.rssi ?? -60,
      color: style.color,
      width: style.width,
      dashed: style.dashed,
      dashArray: style.dashArray,
      strokeDash: style.strokeDash,
      quality: style.quality,
      isBackbone: style.isBackbone,
    });
  });

  // Synthesize Explicit Thread IP Backbone Network Links between all Border Routers
  const tbrNodes = nodes.filter(n => isTbrNode(n));
  for (let i = 0; i < tbrNodes.length; i++) {
    for (let j = i + 1; j < tbrNodes.length; j++) {
      const u = tbrNodes[i];
      const v = tbrNodes[j];
      const edgeKey = u.id < v.id ? `${u.id}_${v.id}` : `${v.id}_${u.id}`;

      const existingIdx = edges.findIndex(e => (e.source === u.id && e.target === v.id) || (e.source === v.id && e.target === u.id));
      const backboneEdge = {
        id: `backbone_${u.id}_${v.id}`,
        source: u.id,
        target: v.id,
        from: u.id,
        to: v.id,
        link_type: 'backbone',
        lqi: 4,
        rssi: -30,
        color: '#38BDF8',
        width: 2.6,
        dashed: false,
        dashArray: 'none',
        strokeDash: null,
        quality: 'Thread IP Backbone',
        isBackbone: true,
      };

      if (existingIdx !== -1) {
        edges[existingIdx] = backboneEdge;
      } else {
        edges.push(backboneEdge);
        seenEdges.add(edgeKey);
      }
    }
  }

  return { nodes, edges };
}
