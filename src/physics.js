import { drawCanvasHexagon, drawCanvasDiamond, drawCanvasRoundedSquare, drawCanvasCircle } from './utils.js';

export function seedInitialPositions(nodes, edges, baseRadius = 350) {
  if (!nodes || !nodes.length) return;
  const R = baseRadius;

  const nodeMap = new Map();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // 1. Identify primary parent-child relationships from active links
  const parentByChild = new Map();
  const childrenByParent = new Map();

  edges.forEach(e => {
    const srcId = typeof e.source === 'object' ? e.source.id : e.source;
    const tgtId = typeof e.target === 'object' ? e.target.id : e.target;
    const srcNode = nodeMap.get(srcId);
    const tgtNode = nodeMap.get(tgtId);
    if (!srcNode || !tgtNode) return;

    if (srcNode.shape === 'circle' && tgtNode.shape !== 'circle') {
      srcNode._parent = tgtNode;
      parentByChild.set(srcId, tgtNode);
      if (!childrenByParent.has(tgtId)) childrenByParent.set(tgtId, []);
      childrenByParent.get(tgtId).push(srcNode);
    } else if (tgtNode.shape === 'circle' && srcNode.shape !== 'circle') {
      tgtNode._parent = srcNode;
      parentByChild.set(tgtId, srcNode);
      if (!childrenByParent.has(srcId)) childrenByParent.set(srcId, []);
      childrenByParent.get(srcId).push(tgtNode);
    }
  });

  // 2. Discover all unique areas dynamically from live devices
  const areaSet = new Set();
  nodes.forEach(n => {
    areaSet.add(n.areaName || 'Unassigned');
  });
  const uniqueAreas = Array.from(areaSet).sort();
  const numAreas = Math.max(uniqueAreas.length, 1);
  const sectorSpan = (2 * Math.PI) / numAreas;

  const areaAngleMap = new Map();
  uniqueAreas.forEach((areaName, idx) => {
    // Distribute room sectors evenly across 360 degrees starting from -90 deg (North)
    const centerAngle = -Math.PI * 0.5 + (idx + 0.5) * sectorSpan;
    const startAngle = -Math.PI * 0.5 + idx * sectorSpan;
    const endAngle = startAngle + sectorSpan;
    areaAngleMap.set(areaName, { start: startAngle, end: endAngle, center: centerAngle });
  });

  // 3. Position Routers & TBRs in inner ring (38% R)
  const routersByArea = new Map();
  nodes.filter(n => n.shape !== 'circle').forEach(rNode => {
    const aName = rNode.areaName || 'Unassigned';
    if (!routersByArea.has(aName)) routersByArea.set(aName, []);
    routersByArea.get(aName).push(rNode);
  });

  routersByArea.forEach((rList, aName) => {
    const sector = areaAngleMap.get(aName) || { start: 0, end: Math.PI, center: Math.PI / 2 };
    const span = sector.end - sector.start;
    const rTotal = rList.length;
    const rStep = rTotal > 1 ? (span * 0.85) / (rTotal - 1) : 0;
    const rStart = sector.center - (rTotal > 1 ? (span * 0.85) / 2 : 0);

    rList.forEach((rNode, idx) => {
      if (rNode.is_preferred_tbr) {
        rNode.x = 0;
        rNode.y = 0;
        return;
      }
      const angle = rTotal === 1 ? sector.center : rStart + idx * rStep;
      const dist = rNode.is_border_router ? (0.28 * R) : (0.38 * R + (idx % 2 === 1 ? 0.08 * R : 0));
      rNode.x = dist * Math.cos(angle);
      rNode.y = dist * Math.sin(angle);
    });
  });

  // 4. Position Leaf End Devices with Wide Parent-Relative Outward Fan-Out (58% - 72% R)
  const leaves = nodes.filter(n => n.shape === 'circle');
  const leavesByParent = new Map();
  const orphanLeaves = [];

  leaves.forEach(lNode => {
    if (lNode._parent) {
      const pId = lNode._parent.id;
      if (!leavesByParent.has(pId)) leavesByParent.set(pId, []);
      leavesByParent.get(pId).push(lNode);
    } else {
      orphanLeaves.push(lNode);
    }
  });

  leavesByParent.forEach((childList, pId) => {
    const parent = nodeMap.get(pId);
    if (!parent) return;

    const parentAngle = Math.atan2(parent.y || 0, parent.x || 0.001);
    const total = childList.length;
    const spread = Math.min(0.65 * total, Math.PI * 0.85);
    const start = parentAngle - spread / 2;
    const step = total > 1 ? spread / (total - 1) : 0;

    childList.sort((a, b) => (a.shortName || a.id).localeCompare(b.shortName || b.id));

    childList.forEach((cNode, idx) => {
      const angle = total === 1 ? parentAngle : start + idx * step;
      const dist = 0.58 * R + (idx % 3 === 1 ? 0.14 * R : (idx % 3 === 2 ? 0.07 * R : 0));
      cNode.x = (parent.x || 0) + dist * Math.cos(angle);
      cNode.y = (parent.y || 0) + dist * Math.sin(angle);
      cNode._siblingIdx = idx;
      cNode._siblingTotal = total;
    });
  });

  // 5. Position Orphan leaves along outer perimeter
  orphanLeaves.forEach((oNode, idx) => {
    const aName = oNode.areaName || 'Unassigned';
    const sector = areaAngleMap.get(aName) || { center: 0 };
    const dist = 0.85 * R + (idx % 2 === 0 ? 0 : 0.08 * R);
    oNode.x = dist * Math.cos(sector.center);
    oNode.y = dist * Math.sin(sector.center);
  });

  // 6. Restore Custom User Drag Positions from LocalStorage (if any)
  try {
    const rawLayout = localStorage.getItem('thread_mesh_user_layout');
    if (rawLayout) {
      const saved = JSON.parse(rawLayout);
      if (saved && typeof saved === 'object') {
        nodes.forEach(n => {
          if (saved[n.id] && typeof saved[n.id].x === 'number' && typeof saved[n.id].y === 'number') {
            n.x = saved[n.id].x;
            n.y = saved[n.id].y;
            n.fx = saved[n.id].x;
            n.fy = saved[n.id].y;
          }
        });
      }
    }
  } catch (e) {}

  // Leader always strictly at center
  const leader = nodes.find(n => n.is_preferred_tbr);
  if (leader && leader.fx === undefined) {
    leader.x = 0;
    leader.y = 0;
  }
}

export function calculateNodeLabelBounds(node, scale, ctx) {
  const s = scale || 1.0;
  const fontSize1 = 11 / s;
  const fontSize2 = 9 / s;
  const fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  const sz = node.size || 8;
  const isLowBatt = (node.battery !== null && node.battery !== undefined && node.battery <= 15);
  const battIcon = isLowBatt ? '🪫 ' : '🔋';
  const line1 = node.shortName || node.friendlyName || `Node ${node.id}`;
  const line2 = `📍 ${node.areaName || 'Unassigned'}` + (node.battery !== null && node.battery !== undefined ? ` • ${battIcon}${node.battery}%` : '');

  let textWidth1, textWidth2;
  if (ctx) {
    ctx.font = `600 ${fontSize1}px ${fontFamily}`;
    textWidth1 = ctx.measureText(line1).width;
    ctx.font = `500 ${fontSize2}px ${fontFamily}`;
    textWidth2 = ctx.measureText(line2).width;
  } else {
    textWidth1 = line1.length * fontSize1 * 0.55;
    textWidth2 = line2.length * fontSize2 * 0.50;
  }

  const gap = 5 / s;
  const boxWidth = Math.max(textWidth1, textWidth2) + (14 / s);
  const boxHeight = fontSize1 + fontSize2 + (10 / s);

  let angle;
  if (node.shape === 'circle') {
    if (node._parent && typeof node._parent.x === 'number' && typeof node._parent.y === 'number') {
      const dx = (node.x || 0) - node._parent.x;
      const dy = (node.y || 0) - node._parent.y;
      angle = (Math.hypot(dx, dy) > 1) ? Math.atan2(dy, dx) : Math.atan2(node.y || 0, node.x || 0.001);
    } else {
      angle = Math.atan2(node.y || 0, node.x || 0.001);
    }
  } else {
    if (node.is_preferred_tbr || (Math.abs(node.x || 0) < 10 && Math.abs(node.y || 0) < 10)) {
      angle = Math.PI / 2;
    } else {
      angle = Math.atan2(node.y || 0, node.x || 0.001);
    }
  }

  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const absCos = Math.abs(cosA);
  const absSin = Math.abs(sinA);

  // Exact distance from center of box to its boundary along ray (cosA, sinA)
  const boxExtent = (absCos * boxHeight < absSin * boxWidth)
    ? (boxHeight / 2) / (absSin || 0.001)
    : (boxWidth / 2) / (absCos || 0.001);

  const dist = sz + (3.5 / s) + boxExtent;
  let boxCenterX = (node.x || 0) + dist * cosA;
  let boxCenterY = (node.y || 0) + dist * sinA;

  // Add subtle sibling vertical stagger if multiple leaves share a parent
  if (node.shape === 'circle' && node._siblingTotal > 1) {
    if (node._siblingIdx === 0) {
      boxCenterY -= (3 / s);
    } else if (node._siblingIdx === node._siblingTotal - 1) {
      boxCenterY += (3 / s);
    }
  }

  const boxX = boxCenterX - boxWidth / 2;
  const boxY = boxCenterY - boxHeight / 2;

  return { boxX, boxY, boxWidth, boxHeight, fontSize1, fontSize2, line1, line2, fontFamily };
}

export function drawNodeWithDynamicLabel(node, ctx, scale, state) {
  const isSelected = state.selectedNodeId === node.id;
  const isHovered = !state.isModalOpen && !state.selectedNodeId && state.hoveredNodeId === node.id;

  // Dimming is ONLY applied when an active route path is selected by click!
  const isDimmed = Boolean(state.activePathNodes && state.activePathNodes.length > 0 && !state.activePathNodes.includes(node.id));

  ctx.save();
  ctx.globalAlpha = isDimmed ? 0.15 : 1.0;

  const r = (node.size || 8) * (isHovered ? 1.12 : 1.0);
  const x = node.x || 0;
  const y = node.y || 0;

  // 1. Render Node Shape
  ctx.fillStyle = node.roleColor || '#38bdf8';
  ctx.strokeStyle = isSelected ? '#ffffff' : (isHovered ? '#38bdf8' : 'rgba(15, 23, 42, 0.85)');
  ctx.lineWidth = (isSelected || isHovered ? 2.5 : 1.2) / scale;

  if (node.shape === 'hexagon') {
    drawCanvasHexagon(ctx, x, y, r);
    ctx.fill();
    ctx.stroke();
  } else if (node.shape === 'diamond') {
    drawCanvasDiamond(ctx, x, y, r);
    ctx.fill();
    ctx.stroke();
  } else if (node.shape === 'square') {
    drawCanvasRoundedSquare(ctx, x, y, (node.size || 10) * (isHovered ? 1.25 : 1.15), 3 / scale);
    ctx.fill();
    ctx.stroke();
  } else {
    drawCanvasCircle(ctx, x, y, r);
    ctx.fill();
    ctx.stroke();
  }

  // 2. 100% Scale-Relative Compass Label
  const bounds = calculateNodeLabelBounds(node, scale, ctx);
  node._hitBox = { x: bounds.boxX, y: bounds.boxY, w: bounds.boxWidth, h: bounds.boxHeight };

  // 3. Draw Label Pill
  ctx.fillStyle = (isSelected || isHovered) ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.75)';
  ctx.strokeStyle = isSelected ? '#ffffff' : (isHovered ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)');
  ctx.lineWidth = (isSelected || isHovered ? 1.5 : 1) / scale;

  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(bounds.boxX, bounds.boxY, bounds.boxWidth, bounds.boxHeight, 5 / scale);
  } else {
    ctx.rect(bounds.boxX, bounds.boxY, bounds.boxWidth, bounds.boxHeight);
  }
  ctx.fill();
  ctx.stroke();

  // 4. Draw Text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  ctx.font = `600 ${bounds.fontSize1}px ${bounds.fontFamily}`;
  ctx.fillStyle = (isSelected || isHovered) ? '#38bdf8' : '#f8fafc';
  ctx.fillText(bounds.line1, bounds.boxX + bounds.boxWidth / 2, bounds.boxY + (3 / scale));

  ctx.font = `500 ${bounds.fontSize2}px ${bounds.fontFamily}`;
  ctx.fillStyle = node.areaColor?.text || '#94a3b8';
  ctx.fillText(bounds.line2, bounds.boxX + bounds.boxWidth / 2, bounds.boxY + bounds.fontSize1 + (4.5 / scale));

  ctx.restore();
}

export function setupPhysicsEngine(graph, R, nodes, edges) {
  if (!graph) return;

  const d3 = window.d3;

  // Charge repulsion: -1.80 * R
  if (graph.d3Force('charge')) {
    graph.d3Force('charge').strength(node => {
      if (node.is_preferred_tbr) return -2.5 * R;
      if (node.is_border_router) return -2.0 * R;
      return -1.80 * R;
    }).distanceMax(3.0 * R);
  }

  // Link distance: 0.40 * R
  if (graph.d3Force('link')) {
    graph.d3Force('link')
      .distance(link => (link.is_backbone ? 0.32 * R : 0.40 * R))
      .strength(link => (link.is_backbone ? 0.45 : 0.25));
  }

  // Collision clearance (if d3 is available globally)
  if (d3 && typeof d3.forceCollide === 'function') {
    graph.d3Force('collision', d3.forceCollide(node => {
      if (node.is_preferred_tbr) return 0.40 * R;
      if (node.is_border_router || node.role === 'router') return 0.36 * R;
      return 0.26 * R;
    }).strength(0.85));
  }

  // Center hub gravity
  if (d3 && typeof d3.forceRadial === 'function') {
    const leader = nodes.find(n => n.is_preferred_tbr || n.role === 'leader');
    if (leader) {
      graph.d3Force('radial', d3.forceRadial(0, 0, 0).strength(node => (node.id === leader.id ? 0.15 : 0.02)));
    }
  }
}
