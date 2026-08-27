import { SVG_ICONS } from './constants.js';

export function setupUIListeners(cardInstance) {
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

export function toggleOverviewModal(cardInstance, show) {
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

export function populateOverviewModal(cardInstance) {
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

export function toggleGuideModal(cardInstance, show) {
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
