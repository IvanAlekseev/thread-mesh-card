/**
 * Thread Mesh Topology Card for Home Assistant v0.3.1
 * (c) 2026 Ivan Alekseev (MIT License)
 */
(function () {
  'use strict';


  // ===========================================================================
  // Module: constants.js
  // ===========================================================================

  const CARD_VERSION = '0.3.1';
  const SCRIPT_URL = '/local/libs/force-graph.min.js';
  const AREA_PALETTE = [
    { bg: 'rgba(239, 68, 68, 0.12)', border: '#EF4444', text: '#F87171' },   // Coral / Red
    { bg: 'rgba(245, 158, 11, 0.12)', border: '#F59E0B', text: '#FBBF24' },  // Amber / Gold
    { bg: 'rgba(168, 85, 247, 0.12)', border: '#A855F7', text: '#C084FC' },  // Purple
    { bg: 'rgba(236, 72, 153, 0.12)', border: '#EC4899', text: '#F472B6' },  // Pink
    { bg: 'rgba(59, 130, 246, 0.12)', border: '#3B82F6', text: '#60A5FA' },   // Blue
    { bg: 'rgba(20, 184, 166, 0.12)', border: '#14B8A6', text: '#2DD4BF' },  // Teal
    { bg: 'rgba(99, 102, 241, 0.12)', border: '#6366F1', text: '#818CF8' },  // Indigo
    { bg: 'rgba(16, 185, 129, 0.12)', border: '#10B981', text: '#34D399' },  // Emerald
    { bg: 'rgba(14, 165, 233, 0.12)', border: '#0EA5E9', text: '#38BDF8' },  // Sky
    { bg: 'rgba(234, 179, 8, 0.12)', border: '#EAB308', text: '#FDE047' },   // Yellow
  ];
  const SVG_ICONS = {
    target: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>`,
    refresh: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>`,
    rotateCcw: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
    info: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    helpCircle: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    chevronUp: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><polyline points="18 15 12 9 6 15"></polyline></svg>`,
    chevronDown: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
    close: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    gear: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
  };

  // ===========================================================================
  // Module: styles.js
  // ===========================================================================

  const CARD_STYLES = `
    :host {
      display: block;
      width: 100%;
      height: 100%;
      min-height: min(28rem, calc(100dvh - var(--header-height, 3.5rem)));
      max-height: calc(100dvh - var(--header-height, 3.5rem));
      box-sizing: border-box;
      font-family: var(--ha-card-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif);
      --card-primary-color: #38bdf8;
      --card-bg-glass: rgba(15, 23, 42, 0.85);
      --card-border-subtle: rgba(255, 255, 255, 0.12);
    }

    ha-card {
      position: relative;
      width: 100%;
      height: 100%;
      max-height: calc(100dvh - var(--header-height, 3.5rem));
      overflow: hidden;
      background-color: var(--ha-card-background, #0b0f19);
      border-radius: var(--ha-card-border-radius, 1rem);
      border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, rgba(255, 255, 255, 0.08));
      display: flex;
      flex-direction: column;
      padding: 0;
      box-sizing: border-box;
    }

    .viewport-container {
      position: relative;
      width: 100%;
      height: 100%;
      flex: 1 1 auto;
      overflow: hidden;
    }

    .canvas-holder {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: grab;
    }
    .canvas-holder:active {
      cursor: grabbing;
    }

    /* force-graph Hover Tooltip Scoped for Shadow DOM */
    .graph-tooltip {
      position: absolute;
      transform: translate(-50%, -120%);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12px;
      padding: 0;
      border-radius: 8px;
      color: #f8fafc;
      background: transparent;
      pointer-events: none;
      z-index: 999;
      text-shadow: none;
    }

    /* Floating Mini Glass Action Dock (Top Left) */
    .floating-dock {
      position: absolute;
      top: max(0.85rem, env(safe-area-inset-top, 0.85rem));
      left: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(0.85rem);
      -webkit-backdrop-filter: blur(0.85rem);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 9999px;
      padding: 0.28rem 0.38rem;
      box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.5);
      z-index: 25;
    }
    .dock-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      width: 2.1rem;
      height: 2.1rem;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.18s ease;
      padding: 0;
    }
    .dock-btn svg {
      width: 1.05rem;
      height: 1.05rem;
      stroke: currentColor;
      transition: stroke 0.15s ease;
    }
    .dock-btn:hover {
      background: rgba(56, 189, 248, 0.22);
      border-color: rgba(56, 189, 248, 0.55);
      color: #38bdf8;
      transform: scale(1.08);
    }
    .dock-btn:active {
      transform: scale(0.95);
    }

    .status-badge {
      position: absolute;
      bottom: max(0.85rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem));
      right: 0.75rem;
      background: rgba(0,0,0,0.65);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 0.4rem;
      padding: 0.2rem 0.5rem;
      font-size: 0.7rem;
      color: var(--secondary-text-color, #aaa);
      z-index: 20;
    }

    /* Ultra-Compact Bottom Action Bar */
    .bottom-action-bar {
      position: absolute;
      bottom: max(1rem, env(safe-area-inset-bottom, 1rem));
      left: 50%;
      transform: translateX(-50%);
      width: min(42rem, calc(100% - 1.5rem));
      background: rgba(18, 18, 24, 0.94);
      backdrop-filter: blur(1rem);
      -webkit-backdrop-filter: blur(1rem);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 1rem;
      box-shadow: 0 1rem 2.25rem rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05);
      z-index: 40;
      color: #f1f5f9;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideUpBottom 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      transition: all 0.25s ease;
    }

    @media (max-width: 48rem) {
      .bottom-action-bar {
        bottom: max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.85rem));
        width: calc(100% - 1rem);
      }
    }

    @keyframes slideUpBottom {
      from { opacity: 0; transform: translate(-50%, 1rem); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }

    .bar-main-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.6rem 0.9rem;
      gap: 0.75rem;
      min-height: 2.75rem;
      box-sizing: border-box;
    }

    .bar-identity {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      min-width: 0;
      flex: 1 1 auto;
    }

    .bar-icon {
      font-size: 1.15rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .bar-name-wrap {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      min-width: 0;
      flex-wrap: nowrap;
    }

    .bar-name {
      font-size: 0.92rem;
      font-weight: 700;
      color: #f8fafc;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .bar-area-badge {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.15rem 0.45rem;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      white-space: nowrap;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    .bar-metrics-strip {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-shrink: 0;
    }

    .bar-pill {
      font-size: 0.76rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 0.45rem;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
      white-space: nowrap;
    }

    .bar-actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      flex-shrink: 0;
    }

    .bar-icon-btn {
      background: transparent;
      border: none;
      outline: none;
      color: #94a3b8;
      width: 1.85rem;
      height: 1.85rem;
      border-radius: 0.45rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
      padding: 0.35rem;
      box-sizing: border-box;
    }

    .bar-icon-btn:hover {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.1);
    }

    /* 6-Tile Deep Telemetry Drawer */
    .bar-drawer {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(10, 15, 29, 0.6);
      padding: 0.75rem 0.9rem;
    }

    .drawer-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }

    .drawer-metric {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 0.5rem;
      padding: 0.45rem 0.6rem;
      min-width: 0;
    }

    .drawer-label {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #64748b;
    }

    .drawer-val {
      font-size: 0.82rem;
      font-weight: 600;
      color: #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Shared Modal Backdrops */
    .guide-modal, .overview-modal, .confirm-modal {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(0.85rem);
      -webkit-backdrop-filter: blur(0.85rem);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 50;
      padding: 1.25rem;
      box-sizing: border-box;
    }

    .guide-card, .overview-card, .confirm-card {
      background: rgba(15, 23, 42, 0.96);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 1.25rem;
      max-width: 36rem;
      width: 100%;
      box-shadow: 0 1.5rem 3.5rem rgba(0, 0, 0, 0.75);
      display: flex;
      flex-direction: column;
      gap: 1rem;
      color: #f1f5f9;
      padding: 1.25rem;
      box-sizing: border-box;
      max-height: 90vh;
      overflow-y: auto;
    }

    .guide-header, .overview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 0.65rem;
    }
    .guide-title, .overview-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #38BDF8;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .modal-section-title {
      font-size: 0.74rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      margin-bottom: 0.5rem;
    }

    /* Overview Modal Specifics */
    .network-stats-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
    }
    .stat-pill {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 0.6rem;
      padding: 0.6rem 0.4rem;
      text-align: center;
    }
    .stat-num {
      font-size: 1.15rem;
      font-weight: 700;
      color: #f1f5f9;
      display: block;
      line-height: 1.1;
    }
    .stat-lbl {
      font-size: 0.62rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-top: 0.25rem;
      display: block;
    }
    .stat-pill.tbr .stat-num { color: #A855F7; }
    .stat-pill.router .stat-num { color: #38BDF8; }
    .stat-pill.battery .stat-num { color: #34D399; }

    .area-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr));
      gap: 0.45rem;
    }
    .area-chip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.45rem 0.6rem;
      border-radius: 0.5rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 0.78rem;
      font-weight: 600;
    }
    .area-chip-name {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      color: #f1f5f9;
    }
    .area-chip-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
    }
    .area-chip-count {
      color: #94a3b8;
      font-size: 0.72rem;
    }

    .tbr-list {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }
    .tbr-card-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 0.6rem;
      padding: 0.55rem 0.75rem;
      font-size: 0.8rem;
    }
    .tbr-card-title {
      font-weight: 600;
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .tbr-card-meta {
      font-size: 0.72rem;
      color: #94a3b8;
    }

    /* Legend Grid in Guide Modal */
    .legend-modal-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.6rem;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 0.6rem;
      padding: 0.75rem;
    }
    .legend-modal-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .legend-modal-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
    }
    .legend-modal-line {
      width: 1.15rem;
      height: 2px;
      border-radius: 2px;
    }
    .legend-modal-line.dotted {
      height: 0px;
      border-top: 2px dashed #F87171;
      width: 1.15rem;
      display: inline-block;
    }

    .guide-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      font-size: 0.82rem;
      line-height: 1.4;
    }
    .guide-item {
      display: flex;
      gap: 0.6rem;
      align-items: flex-start;
    }
    .guide-icon {
      font-size: 1.05rem;
      line-height: 1;
      padding-top: 0.1rem;
    }
    .guide-text strong {
      color: #ffffff;
    }
    .guide-text span {
      color: #94a3b8;
      display: block;
      font-size: 0.74rem;
      margin-top: 0.1rem;
    }
    .modal-close-btn {
      width: 100%;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      color: #fff;
      padding: 0.55rem 1rem;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: background 0.15s ease;
      margin-top: 0.25rem;
    }
    .modal-close-btn:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .hud-close-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.35rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hud-close-btn:hover {
      color: #fff;
      background: rgba(255,255,255,0.1);
    }

    /* Reset Confirmation Modal */
    .confirm-card {
      max-width: 24rem;
      text-align: center;
      padding: 1.5rem;
      border-radius: 1rem;
      gap: 0.75rem;
    }
    .confirm-icon {
      font-size: 2rem;
      color: #f59e0b;
      margin-bottom: -0.25rem;
    }
    .confirm-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #fff;
    }
    .confirm-desc {
      font-size: 0.8rem;
      color: #94a3b8;
      line-height: 1.4;
    }
    .confirm-actions {
      display: flex;
      gap: 0.6rem;
      margin-top: 0.5rem;
    }
    .confirm-cancel-btn, .confirm-reset-btn {
      flex: 1;
      padding: 0.55rem;
      border-radius: 0.5rem;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .confirm-cancel-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #e2e8f0;
    }
    .confirm-cancel-btn:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    .confirm-reset-btn {
      background: #ef4444;
      border: 1px solid #dc2626;
      color: #fff;
    }
    .confirm-reset-btn:hover {
      background: #dc2626;
    }

    @media (max-width: 36rem) {
      .floating-dock {
        top: 0.5rem;
        left: 0.5rem;
        padding: 0.2rem 0.3rem;
      }
      .dock-btn {
        width: 1.85rem;
        height: 1.85rem;
      }
      .legend-modal-grid {
        grid-template-columns: 1fr;
      }
      .network-stats-strip {
        grid-template-columns: 1fr 1fr;
      }
    }
  `;

  // ===========================================================================
  // Module: utils.js
  // ===========================================================================

  function getAreaColor(areaName = '') {
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
  function getAreaKey(areaName = '') {
    if (!areaName) return 'unassigned';
    return areaName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }
  function isTbrNode(n) {
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
  function getNodeStyle(role, isBorderRouter, isPreferredTbr) {
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
  function formatTime(isoStr) {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }
  function getLinkStyle(conn, isTbrBackbone) {
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
  function stripAreaPrefix(friendlyName = '', areaName = '') {
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
  function drawCanvasHexagon(ctx, x, y, r) {
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
  function drawCanvasDiamond(ctx, x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r, y);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x - r, y);
    ctx.closePath();
  }
  function drawCanvasRoundedSquare(ctx, x, y, size, radius = 3) {
    const half = size / 2;
    ctx.beginPath();
    ctx.roundRect(x - half, y - half, size, size, radius);
    ctx.closePath();
  }
  function drawCanvasCircle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    ctx.closePath();
  }
  function computeShortestPathToTbr(sourceId, nodes, edges) {
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

  // ===========================================================================
  // Module: topology.js
  // ===========================================================================

  async function discoverTbrs(cardInstance) {
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
  async function queryMatterJsTopology(cardInstance) {
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
  async function fetchTopologyData(cardInstance) {
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

        // Priority 1: Entity with unit '%' and device_class 'battery' (or non-voltage battery sensor)
        let battEnt = devEntities.find(e => {
          const st = cardInstance._hass?.states?.[e.entity_id];
          const unit = st?.attributes?.unit_of_measurement;
          const devClass = st?.attributes?.device_class || e.original_device_class;
          const id = e.entity_id.toLowerCase();

          if (id.endsWith('_voltage') || id.endsWith('_type') || id.endsWith('_state') || id.endsWith('_runtime')) return false;
          return (devClass === 'battery' && unit === '%') || (unit === '%' && id.includes('battery'));
        });

        // Priority 2: Fallback to any entity with device_class battery (excluding voltage)
        if (!battEnt) {
          battEnt = devEntities.find(e => {
            const id = e.entity_id.toLowerCase();
            return !id.endsWith('_voltage') && !id.endsWith('_type') && (e.original_device_class === 'battery' || id.endsWith('_battery') || id.endsWith('_battery_level'));
          });
        }

        if (battEnt && cardInstance._hass?.states?.[battEnt.entity_id]) {
          const st = cardInstance._hass.states[battEnt.entity_id];
          const val = parseFloat(st.state);
          if (!isNaN(val) && val >= 0 && val <= 100) {
            battery = Math.round(val);
          }
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

  // ===========================================================================
  // Module: physics.js
  // ===========================================================================

  function seedInitialPositions(nodes, edges, baseRadius = 350) {
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

      if (srcNode.role === 'end_device' && tgtNode.role !== 'end_device') {
        srcNode._parent = tgtNode;
        parentByChild.set(srcId, tgtNode);
        if (!childrenByParent.has(tgtId)) childrenByParent.set(tgtId, []);
        childrenByParent.get(tgtId).push(srcNode);
      } else if (tgtNode.role === 'end_device' && srcNode.role !== 'end_device') {
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
    nodes.filter(n => n.role !== 'end_device').forEach(rNode => {
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
    const leaves = nodes.filter(n => n.role === 'end_device');
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
  function calculateNodeLabelBounds(node, scale, ctx) {
    const s = scale || 1.0;
    const fontSize1 = 11 / s;
    const fontSize2 = 9 / s;
    const fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    const sz = node.size || 8;
    const isLowBatt = (node.battery !== null && node.battery !== undefined && node.battery <= 15);
    const battIcon = isLowBatt ? '🪫 ' : '🔋';
    const line1 = node.shortName || node.friendlyName || `Node ${node.id}`;
    const line2 = (node.areaName || 'Unassigned') + (node.battery !== null && node.battery !== undefined ? ` • ${battIcon}${node.battery}%` : '');

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
    if (node.role === 'end_device') {
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
    if (node.role === 'end_device' && node._siblingTotal > 1) {
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
  function drawNodeWithDynamicLabel(node, ctx, scale, state) {
    const isSelected = state.selectedNodeId === node.id;
    const isHovered = !state.isModalOpen && !state.selectedNodeId && state.hoveredNodeId === node.id;
    const isHoveredNeighbor = !state.isModalOpen && !state.selectedNodeId && state.hoveredNeighbors && state.hoveredNeighbors.includes(node.id);

    // Dimming is applied for active route click selection OR hovered node neighbor focus
    let isDimmed = false;
    if (state.activePathNodes && state.activePathNodes.length > 0) {
      isDimmed = !state.activePathNodes.includes(node.id);
    } else if (state.hoveredNodeId) {
      isDimmed = !isHovered && !isHoveredNeighbor;
    }

    ctx.save();
    ctx.globalAlpha = isDimmed ? 0.25 : 1.0;

    const r = (node.size || 8) * (isHovered ? 1.12 : 1.0);
    const x = node.x || 0;
    const y = node.y || 0;

    // 1. Render Node Shape
    ctx.fillStyle = node.roleColor || '#A855F7';
    if (isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5 / scale;
    } else if (isHovered) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5 / scale;
    } else if (node.is_preferred_tbr) {
      ctx.strokeStyle = '#F59E0B'; // Leader Gold Accent Border
      ctx.lineWidth = 2.2 / scale;
    } else {
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.lineWidth = 1.2 / scale;
    }

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
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(bounds.line2, bounds.boxX + bounds.boxWidth / 2, bounds.boxY + bounds.fontSize1 + (4.5 / scale));

    ctx.restore();
  }
  function setupPhysicsEngine(graph, R, nodes, edges) {
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

  // ===========================================================================
  // Module: hud.js
  // ===========================================================================

  function updateInspectorHud(cardInstance, node) {
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

  // ===========================================================================
  // Module: controls.js
  // ===========================================================================

  function setupUIListeners(cardInstance) {
    const root = cardInstance.shadowRoot;

    // Dock Buttons
    root.getElementById('btnFit')?.addEventListener('click', () => cardInstance._fitGraph());

    // Reset Confirmation Modal
    const resetModal = root.getElementById('resetConfirmModal');
    root.getElementById('btnReset')?.addEventListener('click', () => {
      if (resetModal) {
        resetModal.style.display = 'flex';
        cardInstance._isModalOpen = true;
        cardInstance._hoveredNode = null;
        cardInstance._hoveredLink = null;
      }
    });
    root.getElementById('confirmCancelBtn')?.addEventListener('click', () => {
      if (resetModal) resetModal.style.display = 'none';
      cardInstance._isModalOpen = false;
    });
    resetModal?.addEventListener('click', (e) => {
      if (e.target.id === 'resetConfirmModal') {
        resetModal.style.display = 'none';
        cardInstance._isModalOpen = false;
      }
    });
    root.getElementById('confirmResetBtn')?.addEventListener('click', () => {
      if (resetModal) resetModal.style.display = 'none';
      cardInstance._isModalOpen = false;
      try {
        localStorage.removeItem('thread_mesh_user_layout');
      } catch (e) {}
      cardInstance._cleanupGraph();
      cardInstance._renderGraph();
    });

    // Overview Modal (i)
    root.getElementById('btnInfo')?.addEventListener('click', () => toggleOverviewModal(cardInstance, true));
    root.getElementById('overviewModalCloseX')?.addEventListener('click', () => toggleOverviewModal(cardInstance, false));
    root.getElementById('overviewModalCloseBtn')?.addEventListener('click', () => toggleOverviewModal(cardInstance, false));
    root.getElementById('overviewModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'overviewModal') toggleOverviewModal(cardInstance, false);
    });

    // Guide & Legend Modal (?)
    root.getElementById('btnGuide')?.addEventListener('click', () => toggleGuideModal(cardInstance, true));
    root.getElementById('guideModalCloseX')?.addEventListener('click', () => toggleGuideModal(cardInstance, false));
    root.getElementById('guideModalCloseBtn')?.addEventListener('click', () => toggleGuideModal(cardInstance, false));
    root.getElementById('guideModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'guideModal') toggleGuideModal(cardInstance, false);
    });

    // Bottom HUD
    root.getElementById('hudCloseBtn')?.addEventListener('click', () => cardInstance._clearSelection());

    const drawer = root.getElementById('hudDrawer');
    const toggleBtn = root.getElementById('hudToggleDetailsBtn');
    const toggleIcon = root.getElementById('hudToggleIcon');
    if (toggleBtn && drawer) {
      toggleBtn.onclick = () => {
        cardInstance._isDrawerExpanded = !cardInstance._isDrawerExpanded;
        drawer.style.display = cardInstance._isDrawerExpanded ? 'block' : 'none';
        if (toggleIcon) toggleIcon.innerHTML = cardInstance._isDrawerExpanded ? SVG_ICONS.chevronDown : SVG_ICONS.chevronUp;
        toggleBtn.title = cardInstance._isDrawerExpanded ? 'Collapse Diagnostics' : 'Expand Diagnostics';
      };
    }

    // Handle ESC key to dismiss all open modals or active node selection
    if (cardInstance._escListener) {
      window.removeEventListener('keydown', cardInstance._escListener);
    }
    cardInstance._escListener = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        let closedModal = false;

        // 1. Close Overview Modal
        const ovModal = root.getElementById('overviewModal');
        if (ovModal && (ovModal.classList.contains('active') || ovModal.style.display === 'flex')) {
          toggleOverviewModal(cardInstance, false);
          closedModal = true;
        }

        // 2. Close Guide Modal
        const gModal = root.getElementById('guideModal');
        if (gModal && (gModal.classList.contains('active') || gModal.style.display === 'flex')) {
          toggleGuideModal(cardInstance, false);
          closedModal = true;
        }

        // 3. Close Reset Modal
        const rModal = root.getElementById('resetConfirmModal');
        if (rModal && rModal.style.display !== 'none') {
          rModal.style.display = 'none';
          cardInstance._isModalOpen = false;
          closedModal = true;
        }

        // 4. If no modal was open, deselect active node
        if (!closedModal && cardInstance._selectedNodeId) {
          cardInstance._clearSelection();
        }
      }
    };
    window.addEventListener('keydown', cardInstance._escListener);
  }
  function toggleOverviewModal(cardInstance, show) {
    const root = cardInstance.shadowRoot;
    const modal = root.getElementById('overviewModal');
    if (!modal) return;
    modal.style.display = show ? 'flex' : 'none';
    cardInstance._isModalOpen = show;
    if (show) {
      cardInstance._hoveredNode = null;
      cardInstance._hoveredLink = null;
      populateOverviewModal(cardInstance);
    }
  }
  function populateOverviewModal(cardInstance) {
    const root = cardInstance.shadowRoot;
    const nodes = cardInstance._enrichedNodes || [];

    const total = nodes.length;
    const tbrs = nodes.filter(n => n.is_border_router).length;
    const routers = nodes.filter(n => n.shape === 'square').length;
    const leaves = nodes.filter(n => n.shape === 'circle').length;

    const elTotal = root.getElementById('ovStatTotal');
    const elTbrs = root.getElementById('ovStatTbrs');
    const elRouters = root.getElementById('ovStatRouters');
    const elLeaves = root.getElementById('ovStatLeaves');

    if (elTotal) elTotal.textContent = total;
    if (elTbrs) elTbrs.textContent = tbrs;
    if (elRouters) elRouters.textContent = routers;
    if (elLeaves) elLeaves.textContent = leaves;

    // Areas breakdown
    const areaCounts = {};
    const areaColors = {};
    nodes.forEach(n => {
      const a = n.areaName || 'Unassigned';
      areaCounts[a] = (areaCounts[a] || 0) + 1;
      if (!areaColors[a]) areaColors[a] = n.areaColor?.border || '#38BDF8';
    });

    const areaContainer = root.getElementById('ovAreaGrid');
    if (areaContainer) {
      areaContainer.innerHTML = Object.entries(areaCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => `
          <div class="area-chip">
            <div class="area-chip-name">
              <span class="area-chip-dot" style="background: ${areaColors[name] || '#38BDF8'};"></span>
              <span>${name}</span>
            </div>
            <span class="area-chip-count">${count} device${count === 1 ? '' : 's'}</span>
          </div>
        `).join('');
    }

    // Border Routers list
    const tbrContainer = root.getElementById('ovTbrList');
    if (tbrContainer) {
      const tbrNodes = nodes.filter(n => n.is_border_router);
      tbrContainer.innerHTML = tbrNodes.map(t => `
        <div class="tbr-card-item">
          <div class="tbr-card-title">
            <span>${t.is_preferred_tbr ? '👑' : '🔷'}</span>
            <span>${t.shortName || t.friendlyName}</span>
          </div>
          <div class="tbr-card-meta">${t.areaName || 'Cellar'} • ${t.model || 'OpenThread Border Router'}</div>
        </div>
      `).join('');
    }
  }
  function toggleGuideModal(cardInstance, show) {
    const modal = cardInstance.shadowRoot.getElementById('guideModal');
    if (modal) {
      modal.style.display = show ? 'flex' : 'none';
      cardInstance._isModalOpen = show;
      if (show) {
        cardInstance._hoveredNode = null;
        cardInstance._hoveredLink = null;
      }
    }
  }

  // ===========================================================================
  // Module: thread-mesh-card.js
  // ===========================================================================


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

          // 2. Hovering over a node -> Highlight all connections attached to hovered node!
          if (!this._isModalOpen && !this._selectedNodeId && this._hoveredNode) {
            const isConnectedToHovered = (srcId === this._hoveredNode.id || tgtId === this._hoveredNode.id);
            if (isConnectedToHovered) {
              return getAuthenticColor(d, true);
            }
            return 'rgba(255, 255, 255, 0.12)';
          }

          // 3. Hovering directly over this link (when modals and inspector are closed) -> full brightness
          if (!this._isModalOpen && !this._selectedNodeId && this._hoveredLink && (this._hoveredLink.id === edgeId || this._hoveredLink === d)) {
            return getAuthenticColor(d, true);
          }

          // 4. Normal permanent state (Full brightness, zero casual dimming)
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

          if (!this._isModalOpen && !this._selectedNodeId && this._hoveredNode) {
            const isConnectedToHovered = (srcId === this._hoveredNode.id || tgtId === this._hoveredNode.id);
            if (isConnectedToHovered) {
              return (d.isBackbone || (isTbrNode(src) && isTbrNode(tgt))) ? 3.8 : 3.2;
            }
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
          const dist = Math.hypot((node.x || 0) - node.__startX, (node.y || 0) - node.__startY);
          if (dist > 5) {
            this._customPositions.set(node.id, { x: node.x, y: node.y });
            this._saveCustomPositions();
          }
          delete node.__startX;
          delete node.__startY;
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
        .nodeCanvasObject((node, ctx, globalScale) => {
          const isHoverActive = !this._isModalOpen && !this._selectedNodeId && Boolean(this._hoveredNode);
          const hoveredNeighbors = isHoverActive ? this._getNeighborNodeIds(this._hoveredNode.id) : [];
          const state = {
            selectedNodeId: this._selectedNodeId,
            hoveredNodeId: isHoverActive ? this._hoveredNode.id : null,
            hoveredNeighbors: hoveredNeighbors,
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

})();
