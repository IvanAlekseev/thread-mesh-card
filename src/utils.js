import { AREA_PALETTE } from './constants.js';

export function getAreaColor(areaName = '') {
  if (!areaName || areaName === 'Unassigned') {
    return { bg: 'rgba(107, 114, 128, 0.12)', border: '#6B7280', text: '#9CA3AF', name: 'Unassigned' };
  }
  let hash = 0;
  for (let i = 0; i < areaName.length; i++) {
    hash = (hash << 5) - hash + areaName.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % AREA_PALETTE.length;
  return { ...AREA_PALETTE[idx], name: areaName };
}

export function getAreaKey(areaName = '') {
  if (!areaName) return 'unassigned';
  return areaName.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

export function isTbrNode(n) {
  if (!n) return false;
  if (typeof n === 'string') {
    return n.startsWith('br_') || n.includes('ZBT') || n.includes('0ed0a884813d4ddb');
  }
  return Boolean(
    n.is_border_router || 
    n.is_preferred_tbr || 
    n.shape === 'hexagon' || 
    n.shape === 'diamond' || 
    n.role === 'preferred_tbr' || 
    n.role === 'border_router' ||
    (n.id && String(n.id).startsWith('br_'))
  );
}

export function getNodeStyle(role, isBorderRouter, isPreferredTbr) {
  if (isPreferredTbr || role === 'leader') {
    return {
      roleKey: 'preferred_tbr',
      roleLabel: 'Preferred TBR (Leader)',
      shape: 'hexagon',
      color: '#A855F7',
      size: 14,
    };
  }
  if (isBorderRouter) {
    return {
      roleKey: 'border_router',
      roleLabel: 'Border Router',
      shape: 'square',
      color: '#A855F7',
      size: 13,
    };
  }
  if (role === 'router' || role === 'full_router' || role === 'reed') {
    return {
      roleKey: 'router',
      roleLabel: 'Mesh Router (Mains)',
      shape: 'circle',
      color: '#06B6D4',
      size: 11.5,
    };
  }
  return {
    roleKey: 'end_device',
    roleLabel: 'Sleepy End Device (Battery)',
    shape: 'circle',
    color: '#10B981',
    size: 8.5,
  };
}

export function formatTime(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
}

export function getLinkStyle(conn, isTbrBackbone) {
  if (isTbrBackbone) {
    return {
      color: '#38BDF8',
      width: 2.6,
      dashed: false,
      dashArray: 'none',
      strokeDash: null,
      quality: 'Thread IP Backbone',
      isBackbone: true,
    };
  }

  const metrics = conn.source_to_target || conn.target_to_source || {};
  const rssi = metrics.rssi ?? -60;
  const lqi = metrics.lqi ?? 3;
  const strength = conn.strength || (rssi >= -75 ? 'strong' : (rssi >= -82 ? 'medium' : 'weak'));

  if (strength === 'strong' || (lqi >= 3 && rssi >= -75)) {
    return {
      color: 'rgba(203, 213, 225, 0.60)',
      width: 1.4,
      dashed: false,
      dashArray: 'none',
      strokeDash: null,
      quality: 'Strong',
      rssi,
      lqi,
      isBackbone: false,
    };
  } else if (strength === 'medium' || (lqi === 2 || rssi >= -82)) {
    return {
      color: 'rgba(245, 158, 11, 0.65)',
      width: 1.2,
      dashed: false,
      dashArray: 'none',
      strokeDash: null,
      quality: 'Medium',
      rssi,
      lqi,
      isBackbone: false,
    };
  } else {
    return {
      color: 'rgba(248, 113, 113, 0.70)',
      width: 1.3,
      dashed: true,
      dashArray: '3,3',
      strokeDash: [3, 3],
      quality: 'Weak',
      rssi,
      lqi,
      isBackbone: false,
    };
  }
}

export function stripAreaPrefix(friendlyName = '', areaName = '') {
  let name = friendlyName || '';
  const areaTokens = [
    'Master Bedroom', 'MBR',
    'Kids Room', "Children's Room", 'Children’s Room', 'Childrens Room', 'Kids',
    'Reception', 'Living Room',
    'Kitchen',
    'Cellar',
    'Bathroom',
    'Upstairs',
    'Outdoor Kitchen', 'Outdoor'
  ];

  areaTokens.forEach(tok => {
    const reg = new RegExp(`^${tok}\\s*[-–—:]*\\s*`, 'i');
    name = name.replace(reg, '');
  });

  name = name
    .replace(/Ceiling Lights Switch/i, 'Ceiling Switch')
    .replace(/Ceiling Lights/i, 'Ceiling Switch')
    .replace(/Air Quality Monitor/i, 'Air Monitor')
    .replace(/Night Light Remote/i, 'Light Remote')
    .replace(/Lights Wheel/i, 'Lights Wheel')
    .trim();

  if (name.toLowerCase() === 'center') return 'Center Climate';
  if (name.toLowerCase() === 'street wall') return 'Street Wall Climate';
  if (name.toLowerCase() === 'side wall') return 'Side Wall Climate';
  if (name.toLowerCase() === 'hatch') return 'Hatch Sensor';
  if (name.toLowerCase() === 'plug' && friendlyName.toLowerCase().includes('outdoor')) return 'Outdoor Plug';

  return name || friendlyName;
}

export function drawCanvasHexagon(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function drawCanvasDiamond(ctx, x, y, r) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r, y);
  ctx.closePath();
}

export function drawCanvasRoundedSquare(ctx, x, y, size, radius = 3) {
  const half = size / 2;
  ctx.beginPath();
  ctx.roundRect(x - half, y - half, size, size, radius);
  ctx.closePath();
}

export function drawCanvasCircle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI, false);
  ctx.closePath();
}

export function computeShortestPathToTbr(sourceId, nodes, edges) {
  const preferredTbr = nodes.find(n => n.is_preferred_tbr) || nodes.find(n => n.is_border_router);
  if (!preferredTbr || sourceId === preferredTbr.id) {
    return { pathNodes: [sourceId], pathEdges: [], totalCost: 0, hopCount: 0 };
  }

  const targetId = preferredTbr.id;
  const adj = new Map();
  nodes.forEach(n => adj.set(n.id, []));

  edges.forEach(e => {
    const u = typeof e.source === 'object' ? e.source.id : e.source;
    const v = typeof e.target === 'object' ? e.target.id : e.target;
    const cost = e.isBackbone ? 1 : (e.lqi ? (4 - e.lqi) * 10 + Math.abs(e.rssi || -70) * 0.1 : 10);
    if (adj.has(u)) adj.get(u).push({ neighbor: v, edge: e, cost });
    if (adj.has(v)) adj.get(v).push({ neighbor: u, edge: e, cost });
  });

  const dist = new Map();
  const prev = new Map();
  const prevEdge = new Map();
  const pq = [{ id: sourceId, dist: 0 }];

  nodes.forEach(n => dist.set(n.id, Infinity));
  dist.set(sourceId, 0);

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    const { id: u, dist: d } = pq.shift();

    if (u === targetId) break;
    if (d > dist.get(u)) continue;

    for (const { neighbor: v, edge, cost } of (adj.get(u) || [])) {
      const newDist = d + cost;
      if (newDist < dist.get(v)) {
        dist.set(v, newDist);
        prev.set(v, u);
        prevEdge.set(v, edge);
        pq.push({ id: v, dist: newDist });
      }
    }
  }

  const pathNodes = [];
  const pathEdges = [];
  let curr = targetId;

  if (!prev.has(curr) && curr !== sourceId) {
    return { pathNodes: [sourceId], pathEdges: [], totalCost: 0, hopCount: 0 };
  }

  while (curr !== undefined) {
    pathNodes.unshift(curr);
    if (curr === sourceId) break;
    const pEdge = prevEdge.get(curr);
    if (pEdge) pathEdges.unshift(pEdge);
    curr = prev.get(curr);
  }

  return { pathNodes, pathEdges, totalCost: dist.get(targetId), hopCount: pathEdges.length };
}
