export const CARD_STYLES = `
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
  .stat-pill.tbr .stat-num { color: #F59E0B; }
  .stat-pill.router .stat-num { color: #60A5FA; }
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
