console.log("dragPanels.js script loaded!");

if (typeof PanelDragger === 'undefined') {
  class PanelDragger {
    constructor() {
      this.draggedPanel = null;
      this.offset = { x: 0, y: 0 };
      this.initializeDragging();
    }

    async initializeDragging() {
      const panels = document.querySelectorAll('.panel');

      for (const panel of panels) {
        // Ensure panels are interactive and correctly positioned
        panel.style.position = 'absolute';
        panel.style.zIndex = '100';
        panel.style.pointerEvents = 'auto';

        try {
          if (window.electronAPI && typeof window.electronAPI.getItem === 'function') {
            const savedPos = await window.electronAPI.getItem(panel.id);
            if (savedPos) {
              panel.style.left = savedPos.left;
              panel.style.top = savedPos.top;
              panel.style.right = 'auto';
              panel.style.bottom = 'auto';
              panel.style.transform = 'none';
            }
          }
        } catch (err) {
          console.warn(`Failed to restore position for ${panel.id}:`, err);
        }

        const boundStartDrag = this.startDrag.bind(this);
        panel.addEventListener("mousedown", boundStartDrag);
        panel.addEventListener("touchstart", boundStartDrag);
      }

      const boundDrag = this.drag.bind(this);
      const boundStopDrag = this.stopDrag.bind(this);

      document.addEventListener("mousemove", boundDrag);
      document.addEventListener("touchmove", boundDrag);
      document.addEventListener("mouseup", boundStopDrag);
      document.addEventListener("touchend", boundStopDrag);
    }

    startDrag(e) {
      // Prevent drag if clicking on something that should be interactive inside the panel
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') {
        return;
      }

      this.draggedPanel = e.target.closest('.panel');
      if (!this.draggedPanel) return;

      e.preventDefault();
      e.stopPropagation(); // Prevent event from bubbling up to parents that might interfere

      this.draggedPanel.classList.add('dragging');
      this.draggedPanel.style.zIndex = '1000';

      const rect = this.draggedPanel.getBoundingClientRect();
      const clientX = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

      this.offset.x = clientX - rect.left;
      this.offset.y = clientY - rect.top;
    }

    drag(e) {
      if (!this.draggedPanel) return;
      e.preventDefault();

      const clientX = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

      let newX = clientX - this.offset.x;
      let newY = clientY - this.offset.y;

      // Implement viewport constraints
      const rect = this.draggedPanel.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (newX < 0) newX = 0;
      if (newY < 0) newY = 0;
      if (newX + rect.width > viewportWidth) newX = viewportWidth - rect.width;
      if (newY + rect.height > viewportHeight) newY = viewportHeight - rect.height;

      this.draggedPanel.style.left = `${newX}px`;
      this.draggedPanel.style.top = `${newY}px`;
      this.draggedPanel.style.right = 'auto';
      this.draggedPanel.style.bottom = 'auto';
      this.draggedPanel.style.transform = 'none';
    }

    async stopDrag() {
      if (!this.draggedPanel) return;

      const left = this.draggedPanel.style.left;
      const top = this.draggedPanel.style.top;
      this.draggedPanel.style.zIndex = '100';

      if (this.draggedPanel.id && window.electronAPI && typeof window.electronAPI.setItem === 'function') {
        try {
          await window.electronAPI.setItem(this.draggedPanel.id, { left, top });
        } catch (err) {
          console.error(`Failed to save position for ${this.draggedPanel.id}:`, err);
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
