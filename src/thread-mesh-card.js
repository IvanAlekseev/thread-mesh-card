import { CARD_VERSION, SCRIPT_URL, SVG_ICONS } from './constants.js';
import { CARD_STYLES } from './styles.js';
import { isTbrNode, computeShortestPathToTbr, drawCanvasHexagon, drawCanvasDiamond, drawCanvasRoundedSquare, drawCanvasCircle } from './utils.js';
import { fetchTopologyData } from './topology.js';
import { seedInitialPositions, drawNodeWithDynamicLabel, setupPhysicsEngine } from './physics.js';
import { updateInspectorHud } from './hud.js';
import { setupUIListeners, toggleGuideModal } from './controls.js';

let scriptPromise = null;
function loadForceGraph() {
  if (window.ForceGraph) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error(`Failed to load script: ${SCRIPT_URL}`));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

class ThreadMeshCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._discoveredTBRs = {};
    this._enrichedNodes = [];
    this._enrichedEdges = [];
    this._instance = null;
    this._selectedNodeId = null;
    this._activeRoute = null;
    this._hoveredNode = null;
    this._hasRendered = false;
    this._resizeObserver = null;
  }

  setConfig(config) {
    this._config = config || {};
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    if (!oldHass && hass) {
      this._renderCardShell();
      this._loadTopologyAndRegistries();
    }
  }

  connectedCallback() {
    if (this._hass && !this.shadowRoot.innerHTML) {
      this._renderCardShell();
      this._loadTopologyAndRegistries();
    }
  }

  disconnectedCallback() {
    if (this._escListener) {
      window.removeEventListener('keydown', this._escListener);
      this._escListener = null;
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    this._cleanupGraph();
  }

  _setupResizeObserver() {
    if (this._resizeObserver) this._resizeObserver.disconnect();
    const holder = this.shadowRoot.getElementById('canvasHolder');
    if (!holder) return;

    let resizeTimer;
    this._resizeObserver = new ResizeObserver(entries => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 50 && height > 50 && this._instance) {
            this._instance.width(width);
            this._instance.height(height);
            this._fitGraph(0);
          }
        }
      }, 100);
    });
    this._resizeObserver.observe(holder);
  }

  _setLoadingState(isLoading, message = '') {
    const badge = this.shadowRoot.getElementById('statusBadge');
    if (badge) {
      badge.textContent = message || (isLoading ? 'Syncing...' : 'Live');
    }
  }

  async _loadTopologyAndRegistries() {
    if (!this._hass) return;
    this._setLoadingState(true);
    try {
      const { nodes, edges } = await fetchTopologyData(this);
      this._enrichedNodes = nodes;
      this._enrichedEdges = edges;
      this._setLoadingState(false);
      await this._renderGraph();
    } catch (err) {
      console.warn('[ThreadMeshCard] Topology load error:', err);
      this._setLoadingState(false, 'Error');
    }
  }

  _saveUserLayout() {
    try {
      const layout = {};
      if (this._instance) {
        const gData = this._instance.graphData();
        if (gData && Array.isArray(gData.nodes)) {
          gData.nodes.forEach(n => {
            if (typeof n.x === 'number' && typeof n.y === 'number') {
              layout[n.id] = { x: Math.round(n.x), y: Math.round(n.y) };
            }
          });
          localStorage.setItem('thread_mesh_user_layout', JSON.stringify(layout));
        }
      }
    } catch (e) {}
  }

  _cleanupGraph() {
    if (this._instance) {
      try {
        if (typeof this._instance._destructor === 'function') this._instance._destructor();
      } catch (e) {}
      this._instance = null;
    }
    this._hasRendered = false;
    const holder = this.shadowRoot.getElementById('canvasHolder');
    if (holder) holder.innerHTML = '';
  }

  _selectNode(node) {
    if (!node) {
      this._clearSelection();
      return;
    }

    this._selectedNodeId = node.id;
    this._activeRoute = computeShortestPathToTbr(node.id, this._enrichedNodes, this._enrichedEdges);
    updateInspectorHud(this, node);
  }

  _clearSelection() {
    this._selectedNodeId = null;
    this._activeRoute = null;
    updateInspectorHud(this, null);
  }

  _renderCardShell() {
    const root = this.shadowRoot;
    root.innerHTML = `
      <style>
        ${CARD_STYLES}
      </style>

      <ha-card>
        <!-- 100% Full-Bleed Main Viewport -->
        <div class="viewport-container" id="viewport">
          <div class="canvas-holder" id="canvasHolder"></div>
          <div class="status-badge" id="statusBadge">Live</div>

          <!-- Floating Mini Glass Action Dock (Top Left) -->
          <div class="floating-dock">
            <button class="dock-btn" id="btnFit" title="Center Network View">${SVG_ICONS.target}</button>
            <button class="dock-btn" id="btnReset" title="Reset Layout to Defaults">${SVG_ICONS.rotateCcw}</button>
            <button class="dock-btn" id="btnInfo" title="Thread Mesh Overview & Health">${SVG_ICONS.info}</button>
            <button class="dock-btn" id="btnGuide" title="Guide & Legend">${SVG_ICONS.helpCircle}</button>
          </div>

          <!-- Ultra-Compact Bottom Action Bar (Docked Bottom Center) -->
          <div class="bottom-action-bar" id="inspectorHud" style="display: none;">
            <!-- Compact Main Row (Default View) -->
            <div class="bar-main-row" id="hudMainRow">
              <div class="bar-identity">
                <span class="bar-icon" id="hudIcon">💡</span>
                <div class="bar-name-wrap">
                  <span class="bar-name" id="hudTitle">Device Name</span>
                  <span class="bar-area-badge" id="hudArea">Area</span>
                </div>
              </div>

              <div class="bar-metrics-strip">
                <span class="bar-pill" id="hudPowerPill">🔋 100%</span>
                <span class="bar-pill" id="hudRoutePill">4 hops • -77 dBm</span>
              </div>

              <div class="bar-actions">
                <button class="bar-icon-btn" id="hudOpenHaBtn" title="Manage Device in Home Assistant">
                  ${SVG_ICONS.gear}
                </button>
                <button class="bar-icon-btn" id="hudToggleDetailsBtn" title="Toggle Diagnostics">
                  <span id="hudToggleIcon">${SVG_ICONS.chevronUp}</span>
                </button>
                <button class="bar-icon-btn" id="hudCloseBtn" title="Deselect Node">
                  ${SVG_ICONS.close}
                </button>
              </div>
            </div>

            <!-- Expandable Diagnostics Drawer (Hidden by default) -->
            <div class="bar-drawer" id="hudDrawer" style="display: none;">
              <div class="drawer-grid">
                <div class="drawer-metric">
                  <span class="drawer-label">Thread Role</span>
                  <span class="drawer-val" id="hudRole">Sleepy End Device</span>
                </div>
                <div class="drawer-metric">
                  <span class="drawer-label">Mesh Relay Path</span>
                  <span class="drawer-val" id="hudRoute">Direct to Leader Hub</span>
                </div>
                <div class="drawer-metric">
                  <span class="drawer-label">Hardware Model</span>
                  <span class="drawer-val" id="hudModel">BILRESA scroll wheel</span>
                </div>
                <div class="drawer-metric">
                  <span class="drawer-label">Manufacturer</span>
                  <span class="drawer-val" id="hudMfg">IKEA of Sweden</span>
                </div>
                <div class="drawer-metric">
                  <span class="drawer-label">Extended Address (EUI-64)</span>
                  <span class="drawer-val" id="hudExtAddr">--</span>
                </div>
                <div class="drawer-metric">
                  <span class="drawer-label">Protocol & Density</span>
                  <span class="drawer-val" id="hudMeshDensity">Thread 1.3 • 1 neighbor</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Dedicated Mesh Overview & Telemetry Modal -->
          <div class="overview-modal" id="overviewModal">
            <div class="overview-card">
              <div class="overview-header">
                <div class="overview-title">
                  <span>📊 Thread Mesh Overview & Health</span>
                </div>
                <button class="hud-close-btn" id="overviewModalCloseX">${SVG_ICONS.close}</button>
              </div>

              <!-- Live Network Breakdown -->
              <div>
                <div class="modal-section-title">Network Device Breakdown</div>
                <div class="network-stats-strip">
                  <div class="stat-pill">
                    <span class="stat-num" id="ovStatTotal">--</span>
                    <span class="stat-lbl">Total Nodes</span>
                  </div>
                  <div class="stat-pill tbr">
                    <span class="stat-num" id="ovStatTbrs">--</span>
                    <span class="stat-lbl">Border Routers</span>
                  </div>
                  <div class="stat-pill router">
                    <span class="stat-num" id="ovStatRouters">--</span>
                    <span class="stat-lbl">Mains Routers</span>
                  </div>
                  <div class="stat-pill battery">
                    <span class="stat-num" id="ovStatLeaves">--</span>
                    <span class="stat-lbl">Battery Nodes</span>
                  </div>
                </div>
              </div>

              <!-- Border Routers Telemetry -->
              <div>
                <div class="modal-section-title">Border Routers & Coordinator</div>
                <div class="tbr-list" id="ovTbrList"></div>
              </div>

              <!-- Area / Room Distribution -->
              <div>
                <div class="modal-section-title">Room & Area Distribution</div>
                <div class="area-grid" id="ovAreaGrid"></div>
              </div>

              <button class="modal-close-btn" id="overviewModalCloseBtn">Close Overview</button>
            </div>
          </div>

          <!-- Pure Guide & Legend Modal -->
          <div class="guide-modal" id="guideModal">
            <div class="guide-card">
              <div class="guide-header">
                <div class="guide-title">
                  <span>💡 Thread Mesh Guide & Legend</span>
                </div>
                <button class="hud-close-btn" id="guideModalCloseX">${SVG_ICONS.close}</button>
              </div>

              <!-- Visual Node & Signal Legend -->
              <div>
                <div class="modal-section-title">Hardware Roles & Shapes</div>
                <div class="legend-modal-grid">
                  <div class="legend-modal-item">
                    <span class="legend-modal-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24">
                        <polygon points="12,2 21,7.2 21,17.8 12,23 3,17.8 3,7.2" fill="#A855F7" stroke="#F59E0B" stroke-width="2.5"/>
                      </svg>
                    </span>
                    <span>Preferred TBR (Leader)</span>
                  </div>

                  <div class="legend-modal-item">
                    <span class="legend-modal-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="4" fill="#A855F7" stroke="#ffffff" stroke-width="2"/>
                      </svg>
                    </span>
                    <span>Border Router (TBR)</span>
                  </div>

                  <div class="legend-modal-item">
                    <span class="legend-modal-icon">
                      <svg width="13" height="13" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" fill="#06B6D4" stroke="#ffffff" stroke-width="2"/>
                      </svg>
                    </span>
                    <span>Router (Mains Plug/Switch)</span>
                  </div>

                  <div class="legend-modal-item">
                    <span class="legend-modal-icon">
                      <svg width="12" height="12" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="8" fill="#10B981" stroke="#ffffff" stroke-width="2"/>
                      </svg>
                    </span>
                    <span>Sleepy End Device (Battery)</span>
                  </div>
                </div>
              </div>

              <div>
                <div class="modal-section-title">Signal Quality & Wire Links</div>
                <div class="legend-modal-grid">
                  <div class="legend-modal-item">
                    <span class="legend-modal-line" style="background:#cbd5e1; height: 2px;"></span>
                    <span>Strong (≥ -75 dBm, LQI 3)</span>
                  </div>
                  <div class="legend-modal-item">
                    <span class="legend-modal-line" style="background:#f59e0b; height: 2px;"></span>
                    <span>Medium (-75 to -82 dBm)</span>
                  </div>
                  <div class="legend-modal-item">
                    <span class="legend-modal-line dotted"></span>
                    <span>Weak (&lt; -82 dBm)</span>
                  </div>
                  <div class="legend-modal-item">
                    <span class="legend-modal-line" style="background:#38BDF8; height: 2.6px;"></span>
                    <span>Thread IP Backbone (LAN)</span>
                  </div>
                </div>
              </div>

              <!-- Interaction Shortcuts -->
              <div>
                <div class="modal-section-title">Interactions</div>
                <div class="guide-list">
                  <div class="guide-item">
                    <div class="guide-icon">🛰</div>
                    <div class="guide-text">
                      <strong>Trace Transmission Route</strong>
                      <span>Click any device icon or text label to trace its real-time multi-hop path to Connect ZBT-2.</span>
                    </div>
                  </div>
                  <div class="guide-item">
                    <div class="guide-icon">✋</div>
                    <div class="guide-text">
                      <strong>Drag & Pin Nodes</strong>
                      <span>Drag any icon or label to custom arrange devices across canvas space.</span>
                    </div>
                  </div>
                  <div class="guide-item">
                    <div class="guide-icon">🔎</div>
                    <div class="guide-text">
                      <strong>Hover Neighbor Focus</strong>
                      <span>Hover over any device to instantly isolate its direct connections in Sky Blue.</span>
                    </div>
                  </div>
                </div>
              </div>

              <button class="modal-close-btn" id="guideModalCloseBtn">Got it</button>
              <div style="text-align: center; font-size: 0.72rem; color: #64748b; margin-top: 0.6rem;">Thread Mesh Topology Card v${CARD_VERSION} • by Ivan Alekseev</div>
            </div>
          </div>

          <!-- Dashboard Native Reset Confirmation Modal -->
          <div class="confirm-modal" id="resetConfirmModal" style="display: none;">
            <div class="confirm-card">
              <div class="confirm-icon">↺</div>
              <div class="confirm-title">Reset Device Layout?</div>
              <div class="confirm-desc">
                Are you sure you want to reset all custom device positions to the dynamic default arrangement? This will clear your saved layout.
              </div>
              <div class="confirm-actions">
                <button class="confirm-cancel-btn" id="confirmCancelBtn">Cancel</button>
                <button class="confirm-reset-btn" id="confirmResetBtn">Reset Layout</button>
              </div>
            </div>
          </div>

        </div>
      </ha-card>
    `;

    setupUIListeners(this);
    this._setupResizeObserver();
  }

  async _renderGraph() {
    if (!this._enrichedNodes || !this._enrichedNodes.length) return;

    await loadForceGraph();
    const ForceGraph = window.ForceGraph;

    const holder = this.shadowRoot.getElementById('canvasHolder');
    if (!holder) return;

    const width = holder.clientWidth || 800;
    const height = holder.clientHeight || 600;
    const R = Math.min(width, height) / 2;

    const gNodes = this._enrichedNodes.map(n => ({ ...n }));
    const gLinks = this._enrichedEdges.map(e => ({ ...e }));
    seedInitialPositions(gNodes, gLinks, R);
    const gData = { nodes: gNodes, links: gLinks };

    if (this._instance && this._hasRendered) {
      this._instance.graphData(gData);
      this._instance.d3ReheatSimulation();
      if (this._selectedNodeId) {
        const updatedNode = this._enrichedNodes.find(n => n.id === this._selectedNodeId);
        if (updatedNode) this._selectNode(updatedNode);
      }
      return;
    }

    this._cleanupGraph();

    const subHolder = document.createElement('div');
    subHolder.style.width = '100%';
    subHolder.style.height = '100%';
    subHolder.style.position = 'relative';
    holder.appendChild(subHolder);

    const elem = ForceGraph()(subHolder)
      .width(width)
      .height(height)
      .graphData(gData)
      .nodeId('id')
      .backgroundColor('rgba(0,0,0,0)')
      .autoPauseRedraw(false)
      .d3AlphaDecay(0.06)
      .d3VelocityDecay(0.6)
      .warmupTicks(60)
      .cooldownTicks(50)
      .onEngineStop(() => {
        if (this._instance) {
          const gData = this._instance.graphData();
          if (gData && Array.isArray(gData.nodes)) {
            gData.nodes.forEach(n => {
              n.fx = n.x;
              n.fy = n.y;
            });
          }
        }
        this._fitGraph(400);
      })
      .linkDirectionalParticles(0)
      .linkCurvature(0)
      .linkHoverPrecision(8)
      .linkLabel(link => {
        if (this._isModalOpen || this._selectedNodeId || !link) return null;
        const src = link.source;
        const tgt = link.target;
        const srcName = src?.shortName || src?.friendlyName || src?.id || 'Device';
        const tgtName = tgt?.shortName || tgt?.friendlyName || tgt?.id || 'Device';
        const srcArea = src?.areaName && src.areaName !== 'Unassigned' ? ` (${src.areaName})` : '';
        const tgtArea = tgt?.areaName && tgt.areaName !== 'Unassigned' ? ` (${tgt.areaName})` : '';

        if (link.isBackbone) {
          return `<div style="background: rgba(15, 23, 42, 0.96); border: 1px solid #38bdf8; border-radius: 8px; padding: 7px 11px; font-family: system-ui, -apple-system, sans-serif; font-size: 11.5px; color: #f8fafc; box-shadow: 0 8px 24px rgba(0,0,0,0.6); pointer-events: none; text-align: left; line-height: 1.35;">
            <div style="font-weight: 700; color: #38bdf8; font-size: 11.5px; margin-bottom: 2px; display: flex; align-items: center; gap: 4px;">
              <span>⚡</span> Thread IP Backbone (LAN)
            </div>
            <div style="color: #cbd5e1; font-weight: 500; font-size: 11px;">${srcName}${srcArea} ↔ ${tgtName}${tgtArea}</div>
            <div style="color: #64748b; font-size: 10px; margin-top: 3px;">Direct Ethernet / Wi-Fi mesh between Border Routers</div>
          </div>`;
        }

        const isGood = link.quality === 'Strong' || (link.rssi !== undefined && link.rssi >= -75);
        const isMed = link.quality === 'Medium' || (link.rssi !== undefined && link.rssi >= -82 && link.rssi < -75);
        const qualityColor = link.color || (isGood ? '#4ade80' : (isMed ? '#f59e0b' : '#f87171'));
        const qualityText = isGood ? 'Strong' : (isMed ? 'Medium' : 'Weak');
        const lqiVal = link.lqi !== undefined && link.lqi <= 3 ? link.lqi : 3;
        const rssiText = link.rssi !== undefined ? ` • ${link.rssi} dBm` : '';

        return `<div style="background: rgba(15, 23, 42, 0.96); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 8px 12px; font-family: system-ui, -apple-system, sans-serif; font-size: 11.5px; color: #f8fafc; box-shadow: 0 8px 24px rgba(0,0,0,0.6); pointer-events: none; text-align: left; line-height: 1.4;">
          <div style="font-weight: 700; color: #f8fafc; font-size: 12px; margin-bottom: 2px;">
            ${srcName}${srcArea} ↔ ${tgtName}${tgtArea}
          </div>
          <div style="color: #94a3b8; font-size: 10.5px; margin-bottom: 5px;">
            Network: <strong style="color: #cbd5e1;">Thread (NEST-PAN-7BF9)</strong>
          </div>
          <div style="display: flex; flex-direction: column; gap: 3px; font-size: 11px; color: #cbd5e1; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 5px;">
            <div>${srcName} → ${tgtName}: <strong style="color: ${qualityColor};">${qualityText} (LQI ${lqiVal}${rssiText})</strong></div>
            <div>${tgtName} → ${srcName}: <strong style="color: ${qualityColor};">${qualityText} (LQI ${lqiVal}${rssiText})</strong></div>
          </div>
        </div>`;
      })
      .onLinkHover((link) => {
        if (this._isModalOpen || this._selectedNodeId) {
          this._hoveredLink = null;
          subHolder.style.cursor = 'default';
          return;
        }
        this._hoveredLink = link || null;
        subHolder.style.cursor = link ? 'pointer' : 'default';
      })
      // High-Clarity Permanent Links with Authentic Hover & Route Tracing
      .linkColor(d => {
        const src = d.source;
        const tgt = d.target;
        const srcId = src?.id || src;
        const tgtId = tgt?.id || tgt;
        const edgeId = d.id;

        const getAuthenticColor = (edge, full = true) => {
          if (edge.isBackbone || (isTbrNode(src) && isTbrNode(tgt))) return '#38BDF8';
          if (edge.quality === 'Strong' || (edge.rssi !== undefined && edge.rssi >= -75)) {
            return full ? '#F1F5F9' : 'rgba(203, 213, 225, 0.60)';
          }
          if (edge.quality === 'Medium' || (edge.rssi !== undefined && edge.rssi >= -82)) {
            return full ? '#F59E0B' : 'rgba(245, 158, 11, 0.60)';
          }
          return full ? '#F87171' : 'rgba(248, 113, 113, 0.60)';
        };

        // 1. If an active route path is selected by click -> Bold authentic link colors
        if (this._activeRoute && this._activeRoute.pathEdges.length > 0) {
          const isPathEdge = this._activeRoute.pathEdges.some(pe => pe.id === edgeId || (pe.source === srcId && pe.target === tgtId) || (pe.source === tgtId && pe.target === srcId));
          if (isPathEdge) {
            return getAuthenticColor(d, true);
          }
          return 'rgba(255, 255, 255, 0.05)';
        }

        // 2. Hovering directly over this link (when modals and inspector are closed) -> full brightness
        if (!this._isModalOpen && !this._selectedNodeId && this._hoveredLink && (this._hoveredLink.id === edgeId || this._hoveredLink === d)) {
          return getAuthenticColor(d, true);
        }

        // 3. Normal permanent state (Full brightness, zero casual dimming)
        if (d.isBackbone || (isTbrNode(src) && isTbrNode(tgt))) {
          return '#38BDF8';
        }

        return d.color || getAuthenticColor(d, false);
      })
      .linkWidth(d => {
        const src = d.source;
        const tgt = d.target;
        const srcId = src?.id || src;
        const tgtId = tgt?.id || tgt;
        const edgeId = d.id;

        if (this._activeRoute && this._activeRoute.pathEdges.length > 0) {
          const isPathEdge = this._activeRoute.pathEdges.some(pe => pe.id === edgeId || (pe.source === srcId && pe.target === tgtId) || (pe.source === tgtId && pe.target === srcId));
          if (isPathEdge) return (d.isBackbone || (isTbrNode(src) && isTbrNode(tgt))) ? 3.8 : 3.2;
          return 0.8;
        }

        if (!this._isModalOpen && !this._selectedNodeId && this._hoveredLink && (this._hoveredLink.id === edgeId || this._hoveredLink === d)) {
          return (d.isBackbone || (isTbrNode(src) && isTbrNode(tgt))) ? 3.8 : 3.4;
        }

        if (d.isBackbone || (isTbrNode(src) && isTbrNode(tgt))) {
          return 2.6;
        }

        return d.width || 1.4;
      })
      .linkLineDash(d => d.strokeDash)
      .enableNodeDrag(true)
      .onNodeDrag((node) => {
        if (node.__startX === undefined) {
          node.__startX = node.x;
          node.__startY = node.y;
        }
        node.fx = node.x;
        node.fy = node.y;
      })
      .onNodeDragEnd((node) => {
        node.fx = node.x;
        node.fy = node.y;
        this._saveUserLayout();
        if (node.__startX !== undefined) {
          const dx = (node.x || 0) - node.__startX;
          const dy = (node.y || 0) - node.__startY;
          node.__startX = undefined;
          node.__startY = undefined;
          if (Math.hypot(dx, dy) < 6) {
            this._selectNode(node);
          }
        }
      })
      .onNodeClick((node) => {
        this._selectNode(node);
      })
      .onBackgroundClick(() => {
        this._clearSelection();
      })
      // 100% Scale-Relative Hit-Testing
      .nodePointerAreaPaint((node, color, ctx, globalScale) => {
        const sz = node.size || 8;
        ctx.fillStyle = color;

        if (node.shape === 'hexagon') {
          drawCanvasHexagon(ctx, node.x, node.y, sz + 3);
          ctx.fill();
        } else if (node.shape === 'diamond') {
          drawCanvasDiamond(ctx, node.x, node.y, sz + 3);
          ctx.fill();
        } else if (node.shape === 'square') {
          drawCanvasRoundedSquare(ctx, node.x, node.y, (node.size || 10) * 1.15 + (4 / globalScale), 4);
          ctx.fill();
        } else {
          drawCanvasCircle(ctx, node.x, node.y, sz + 3);
          ctx.fill();
        }

        if (node._hitBox) {
          ctx.beginPath();
          ctx.rect(node._hitBox.x, node._hitBox.y, node._hitBox.w, node._hitBox.h);
          ctx.fill();
        }
      })
      // 100% Scale-Relative Zero-Pixel Canvas Drawing
      .nodeCanvasObject((node, ctx, globalScale) => {
        const isHoverActive = !this._isModalOpen && !this._selectedNodeId;
        const state = {
          selectedNodeId: this._selectedNodeId,
          hoveredNodeId: isHoverActive ? this._hoveredNode?.id : null,
          activePathNodes: this._activeRoute?.pathNodes || [],
          isModalOpen: this._isModalOpen,
        };
        drawNodeWithDynamicLabel(node, ctx, globalScale, state);
      })
      .onNodeHover((node) => {
        if (this._isModalOpen || this._selectedNodeId) {
          this._hoveredNode = null;
          subHolder.style.cursor = 'default';
          return;
        }
        this._hoveredNode = node || null;
        subHolder.style.cursor = node ? 'pointer' : 'default';
      });

    // 100% Normalized R Forces
    setupPhysicsEngine(elem, R, gNodes, gLinks);

    this._instance = elem;
    this._hasRendered = true;

    setTimeout(() => {
      this._fitGraph(400);
    }, 80);
  }

  _getNeighborNodeIds(nodeId) {
    if (!nodeId || !Array.isArray(this._enrichedEdges)) return [];
    const neighbors = new Set();
    for (const edge of this._enrichedEdges) {
      const srcId = edge.source?.id || edge.source;
      const tgtId = edge.target?.id || edge.target;
      if (srcId === nodeId) neighbors.add(tgtId);
      else if (tgtId === nodeId) neighbors.add(srcId);
    }
    return Array.from(neighbors);
  }

  _getAdaptivePadding() {
    const w = this._instance ? this._instance.width() : (this.clientWidth || window.innerWidth || 800);
    const h = this._instance ? this._instance.height() : (this.clientHeight || window.innerHeight || 600);
    return Math.max(40, Math.round(Math.min(w, h) * 0.075));
  }

  _fitGraph(duration = 400) {
    if (this._instance && typeof this._instance.zoomToFit === 'function') {
      const pad = this._getAdaptivePadding();
      this._instance.zoomToFit(duration, pad);
    }
  }
}

console.info(
  `%c  THREAD-MESH-CARD  %c  v${CARD_VERSION}  `,
  'color: #38bdf8; font-weight: bold; background: #0f172a; padding: 2px 4px; border-radius: 3px 0 0 3px;',
  'color: #f1f5f9; font-weight: 500; background: #1e293b; padding: 2px 4px; border-radius: 0 3px 3px 0;'
);

customElements.define('thread-mesh-card', ThreadMeshCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'thread-mesh-card',
  name: 'Thread Mesh Topology Card',
  preview: true,
  description: 'Interactive Thread mesh topology visualizer with real-time collision physics, Thread 1.4 telemetry, and hop routing.'
});
