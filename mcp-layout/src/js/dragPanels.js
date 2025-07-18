console.log("dragPanels.js script loaded!");
console.log("TEST: This log should always appear!");

if (typeof PanelDragger === 'undefined') {
  class PanelDragger {
    constructor() {
      this.draggedPanel = null;
      this.offset = { x: 0, y: 0 };
      this.initializeDragging();
    }

    async initializeDragging() {
      const panels = document.querySelectorAll('.panel');
      console.log(`Found ${panels.length} panels:`);
      panels.forEach(panel => {
        console.log(`Panel id="${panel.id}"`, panel);
      });

      for (const panel of panels) {
        panel.style.position = 'absolute';
        panel.style.zIndex = '1';

        try {
          if (window.electronAPI && typeof window.electronAPI.getItem === 'function') {
            const savedPos = await window.electronAPI.getItem(panel.id);
            console.log(`Raw savedPos for ${panel.id}:`, savedPos);

            if (savedPos) {
              const pos = savedPos;
              panel.style.removeProperty('inset');
              panel.style.position = 'absolute';
              panel.style.left = pos.left;
              panel.style.top = pos.top;
              panel.style.right = 'auto';
              panel.style.bottom = 'auto';
              panel.style.margin = '0';
              panel.style.transform = 'none';
              panel.setAttribute('style',
                `position: absolute; left: ${pos.left}; top: ${pos.top}; right: auto; bottom: auto; transform: none; z-index: 1;`
              );
              console.log(`FORCE restored position for ${panel.id}:`, pos);
            } else {
              console.log(`No saved position for ${panel.id}, using default CSS position`);
            }
          } else {
            console.warn('window.electronAPI or getItem function not available. Cannot restore position.');
          }
        } catch (err) {
          console.warn(`Failed to restore position for ${panel.id}:`, err);
        }

        const boundStartDrag = this.startDrag.bind(this);
        panel.addEventListener("mousedown", boundStartDrag);
        panel.addEventListener("touchstart", boundStartDrag);
        console.log(`Event listeners attached to panel: ${panel.id}`);
        panel.addEventListener("click", () => {
          console.log(`Click test for panel: ${panel.id}`);
        });
      }

      const boundDrag = this.drag.bind(this);
      const boundStopDrag = this.stopDrag.bind(this);

      document.addEventListener("mousemove", boundDrag);
      document.addEventListener("touchmove", boundDrag);
      document.addEventListener("mouseup", boundStopDrag);
      document.addEventListener("touchend", boundStopDrag);
    }

    startDrag(e) {
      console.log("startDrag function called!");
      console.log("Event target:", e.target);
      console.log("Closest panel:", e.target.closest(".panel"));

      this.draggedPanel = e.target.closest('.panel');
      if (!this.draggedPanel) {
        console.log("No draggable panel found for event target.");
        return;
      }

      this.draggedPanel.classList.add('dragging');
      this.draggedPanel.style.zIndex = '1000';
      document.body.classList.add('dragging-active');

      const rect = this.draggedPanel.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);

      this.offset.x = clientX - rect.left;
      this.offset.y = clientY - rect.top;
    }

    drag(e) {
      if (!this.draggedPanel) return;
      e.preventDefault();

      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
      const newX = clientX - this.offset.x;
      const newY = clientY - this.offset.y;

      const maxX = window.innerWidth - this.draggedPanel.offsetWidth;
      const maxY = window.innerHeight - this.draggedPanel.offsetHeight;

      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));

      this.draggedPanel.style.left = `${constrainedX}px`;
      this.draggedPanel.style.top = `${constrainedY}px`;
      this.draggedPanel.style.right = 'auto';
      this.draggedPanel.style.bottom = 'auto';
      this.draggedPanel.style.transform = 'none';
    }

    async stopDrag() {
      console.log("stopDrag function called!");
      if (!this.draggedPanel) return;

      const left = this.draggedPanel.style.left;
      const top = this.draggedPanel.style.top;
      this.draggedPanel.style.zIndex = '1';

      if (this.draggedPanel.id && window.electronAPI && typeof window.electronAPI.setItem === 'function') {
        try {
          const position = { left, top };
          await window.electronAPI.setItem(this.draggedPanel.id, position);
          console.log(`Saved position for ${this.draggedPanel.id}:`, position);
          const saved = await window.electronAPI.getItem(this.draggedPanel.id);
          console.log(`Retrieved back from store for ${this.draggedPanel.id}:`, saved);
        } catch (err) {
          console.error(`Failed to save position for ${this.draggedPanel.id}:`, err);
        }
      } else {
        console.warn('Panel has no ID or electronAPI.setItem not available. Cannot save position.');
      }

      this.draggedPanel.classList.remove('dragging');
      document.body.classList.remove('dragging-active');
      this.draggedPanel = null;
    }
  }

  window.PanelDragger = PanelDragger;
}

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOMContentLoaded event fired, initializing PanelDragger...");
  new PanelDragger();
});
