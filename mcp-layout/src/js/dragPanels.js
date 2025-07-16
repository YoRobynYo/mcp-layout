if (typeof PanelDragger === 'undefined') {
  class PanelDragger {
    constructor() {
      this.draggedPanel = null;
      this.offset = { x: 0, y: 0 };

      this.allowedPositions = [
        { id: 'screen-1', top: 40, left: 40 },
        { id: 'screen-2', top: 400, left: 40 },
        { id: 'screen-3', top: 40, left: 800 },
        { id: 'screen-4', top: 400, left: 800 },
        { id: 'screen-4a', top: 600, left: 800 },
        { id: 'screen-5', top: 600, left: 400 },
        { id: 'center-panel', top: 200, left: 400 },
      ];

      this.initializeDragging();
    }

    initializeDragging() {
      const panels = document.querySelectorAll('.panel');
      panels.forEach(panel => {
        panel.style.position = 'absolute';

        const savedPos = localStorage.getItem(panel.id);
        if (savedPos) {
          try {
            const pos = JSON.parse(savedPos);
            panel.style.left = pos.left;
            panel.style.top = pos.top;
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
            panel.style.transform = 'none';
          } catch {
            console.warn('Failed to parse saved position for', panel.id);
          }
        }

        panel.addEventListener('mousedown', this.startDrag.bind(this));
        panel.addEventListener('touchstart', this.startDrag.bind(this));
      });

      document.addEventListener('mousemove', this.drag.bind(this));
      document.addEventListener('touchmove', this.drag.bind(this));
      document.addEventListener('mouseup', this.stopDrag.bind(this));
      document.addEventListener('touchend', this.stopDrag.bind(this));
    }

    startDrag(e) {
      e.preventDefault();
      this.draggedPanel = e.target.closest('.panel');
      if (!this.draggedPanel) return;

      this.draggedPanel.classList.add('dragging');
      const rect = this.draggedPanel.getBoundingClientRect();
      const clientX = e.clientX || e.touches[0].clientX;
      const clientY = e.clientY || e.touches[0].clientY;
      this.offset.x = clientX - rect.left;
      this.offset.y = clientY - rect.top;
    }

    drag(e) {
      if (!this.draggedPanel) return;
      e.preventDefault();
      const clientX = e.clientX || e.touches[0].clientX;
      const clientY = e.clientY || e.touches[0].clientY;

      const newX = clientX - this.offset.x;
      const newY = clientY - this.offset.y;

      const maxX = window.innerWidth - this.draggedPanel.offsetWidth;
      const maxY = window.innerHeight - this.draggedPanel.offsetHeight;

      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));

      this.draggedPanel.style.left = constrainedX + 'px';
      this.draggedPanel.style.top = constrainedY + 'px';
      this.draggedPanel.style.right = 'auto';
      this.draggedPanel.style.bottom = 'auto';
      this.draggedPanel.style.transform = 'none';
    }

    stopDrag() {
      if (!this.draggedPanel) return;

      const panelId = this.draggedPanel.id;
      const targetPos = this.allowedPositions.find(pos => pos.id === panelId);

      if (targetPos) {
        this.draggedPanel.style.left = targetPos.left + 'px';
        this.draggedPanel.style.top = targetPos.top + 'px';

        localStorage.setItem(this.draggedPanel.id, JSON.stringify({
          left: targetPos.left + 'px',
          top: targetPos.top + 'px',
        }));
      } else {
        const panelRect = this.draggedPanel.getBoundingClientRect();
        let closestPos = null;
        let minDistance = Infinity;

        this.allowedPositions.forEach(pos => {
          const dx = panelRect.left - pos.left;
          const dy = panelRect.top - pos.top;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDistance) {
            minDistance = dist;
            closestPos = pos;
          }
        });

        if (closestPos) {
          this.draggedPanel.style.left = closestPos.left + 'px';
          this.draggedPanel.style.top = closestPos.top + 'px';

          localStorage.setItem(this.draggedPanel.id, JSON.stringify({
            left: closestPos.left + 'px',
            top: closestPos.top + 'px',
          }));
        }
      }

      this.draggedPanel.classList.remove('dragging');
      this.draggedPanel = null;
    }
  }

  window.PanelDragger = PanelDragger;
}

document.addEventListener('DOMContentLoaded', () => {
  new PanelDragger();
});
