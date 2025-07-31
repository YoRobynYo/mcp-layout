// dragCube.js
console.log("dragCube.js loaded");

class CubeDragger {
  constructor() {
    this.state = {
      draggedCube: null,
      offset: { x: 0, y: 0 },
      isDragging: false,
      isRotating: false,
      startX: 0,
      startY: 0,
      rotationX: 0,
      rotationY: 0
    };
    this.centreCube = null;
    this.panels = {}; // Panel references
    this.init();
  }

  async init() {
    const cubeScene = document.querySelector('.cube-scene');
    this.centreCube = document.querySelector('.centreCube');
    if (!cubeScene || !this.centreCube) {
      console.warn("Cube elements not found");
      return;
    }

    // Initialize panels after DOM ready
    this.initializePanels();

    cubeScene.style.cssText = 'position:absolute;z-index:10';
    this.createDragHandle(cubeScene);
    await this.restorePosition(cubeScene);
    this.addEventListeners(cubeScene);

    // Show correct panel on start
    this.updateVisiblePanel();
  }

  initializePanels() {
    // Delay to ensure DOM is ready and panels exist
    setTimeout(() => {
      this.panels = {
        front: document.querySelector(".extended-panel.front"),
        back: document.querySelector(".extended-panel.back"),
        left: document.querySelector(".extended-panel.left"),
        right: document.querySelector(".extended-panel.right")
      };
      console.log("Panels initialized:", this.panels);

      // Set panel heights equal to cube height
      const cubeHeight = this.centreCube.offsetHeight;
      Object.values(this.panels).forEach(panel => {
        if (panel) panel.style.height = `${cubeHeight}px`;
      });

      this.updateVisiblePanel(); // Update visibility after initialization
    }, 100);
  }

  async restorePosition(cubeScene) {
    try {
      let attempts = 0;
      while (!window.electronAPI?.getItem && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (window.electronAPI?.getItem) {
        const savedPos = await window.electronAPI.getItem('cube-scene-position');
        if (savedPos) {
          const pos = typeof savedPos === 'string' ? JSON.parse(savedPos) : savedPos;
          const setPos = () => {
            cubeScene.style.left = typeof pos.left === 'number' ? `${pos.left}px` : pos.left;
            cubeScene.style.top = typeof pos.top === 'number' ? `${pos.top}px` : pos.top;
          };
          requestAnimationFrame(() => {
            setPos();
            setTimeout(setPos, 100);
            setTimeout(setPos, 500);
          });
          console.log("Position restored:", pos);
        }
      }
    } catch (err) {
      console.warn("Could not restore cube position", err);
    }
  }

  createDragHandle(cubeScene) {
    const handle = Object.assign(document.createElement('div'), {
      className: 'cube-drag-handle',
      innerHTML: '⋮⋮⋮'
    });

    handle.style.cssText = `
      position:absolute;top:-30px;left:50%;transform:translateX(-50%);
      width:50px;height:20px;background:linear-gradient(145deg,rgba(255,255,255,0.1),rgba(255,255,255,0.05));
      border:1px solid rgba(255,255,255,0.2);border-radius:10px 10px 3px 3px;
      color:rgba(255,255,255,0.6);font-size:12px;display:flex;align-items:center;
      justify-content:center;cursor:grab;backdrop-filter:blur(5px);user-select:none;
      z-index:1000;transition:all 0.2s ease;
    `;

    ['mouseenter', 'mouseleave'].forEach((event, i) => {
      handle.addEventListener(event, () => {
        const styles = [
          'background:linear-gradient(145deg,rgba(255,255,255,0.15),rgba(255,255,255,0.08));border-color:rgba(255,255,255,0.3)',
          'background:linear-gradient(145deg,rgba(255,255,255,0.1),rgba(255,255,255,0.05));border-color:rgba(255,255,255,0.2)'
        ];
        handle.style.cssText += styles[i];
      });
    });

    cubeScene.appendChild(handle);
  }

  addEventListeners(cubeScene) {
    const events = {
      start: ['mousedown', 'touchstart'],
      move: ['mousemove', 'touchmove'],
      stop: ['mouseup', 'touchend']
    };

    events.start.forEach(event => cubeScene.addEventListener(event, this.startInteraction.bind(this)));
    events.move.forEach(event => document.addEventListener(event, this.move.bind(this)));
    events.stop.forEach(event => document.addEventListener(event, this.stopInteraction.bind(this)));
    this.centreCube.addEventListener("contextmenu", e => e.preventDefault());
  }

  startInteraction(e) {
    const cubeScene = e.target.closest('.cube-scene');
    if (!cubeScene) return;

    e.preventDefault();
    const isCentre = e.target.closest('.centreCube');
    const isDragHandle = e.target.closest('.cube-drag-handle');
    const isShiftPressed = e.shiftKey;

    console.log("Interaction:", { isCentre: !!isCentre, isDragHandle: !!isDragHandle, isShiftPressed });

    if (isDragHandle || isShiftPressed || !isCentre) {
      this.startDrag(e, cubeScene);
    } else {
      this.startRotate(e, cubeScene);
    }
  }

  startDrag(e, cubeScene) {
    this.state.isDragging = true;
    this.state.draggedCube = cubeScene;
    const dragHandle = cubeScene.querySelector('.cube-drag-handle');
    if (dragHandle) dragHandle.style.cursor = 'grabbing';

    const rect = cubeScene.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    this.state.offset = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  startRotate(e, cubeScene) {
    this.state.isRotating = true;
    this.state.draggedCube = cubeScene;
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    this.state.startX = clientX;
    this.state.startY = clientY;
    this.centreCube.style.cssText += 'transition:none;cursor:grabbing';
  }

  move(e) {
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;

    if (this.state.isDragging) {
      const newX = clientX - this.state.offset.x;
      const newY = clientY - this.state.offset.y;
      const maxX = window.innerWidth - this.state.draggedCube.offsetWidth;
      const maxY = window.innerHeight - this.state.draggedCube.offsetHeight;
      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));
      this.state.draggedCube.style.left = `${boundedX}px`;
      this.state.draggedCube.style.top = `${boundedY}px`;
    } else if (this.state.isRotating) {
      const deltaX = clientX - this.state.startX;
      const deltaY = clientY - this.state.startY;
      this.state.rotationY += deltaX * 0.5;
      this.state.rotationX -= deltaY * 0.5;
      this.centreCube.style.transform = `rotateX(${this.state.rotationX}deg) rotateY(${this.state.rotationY}deg)`;
      this.state.startX = clientX;
      this.state.startY = clientY;

      this.updateVisiblePanel();
    }
  }

  updateVisiblePanel() {
    if (!this.panels.front) return; // Panels not initialized yet

    const normalizedY = ((this.state.rotationY % 360) + 360) % 360;

    // Hide all panels first
    Object.values(this.panels).forEach(p => {
      if (p) p.classList.remove("panel-visible");
    });

    if ((normalizedY >= 315 || normalizedY < 45)) {
      this.panels.front?.classList.add("panel-visible");
      console.log("Showing front panel");
    } else if (normalizedY >= 45 && normalizedY < 135) {
      this.panels.right?.classList.add("panel-visible");
      console.log("Showing right panel");
    } else if (normalizedY >= 135 && normalizedY < 225) {
      this.panels.back?.classList.add("panel-visible");
      console.log("Showing back panel");
    } else if (normalizedY >= 225 && normalizedY < 315) {
      this.panels.left?.classList.add("panel-visible");
      console.log("Showing left panel");
    }
  }

  async stopInteraction() {
    if (this.state.isDragging) {
      this.state.isDragging = false;
      const dragHandle = this.state.draggedCube?.querySelector('.cube-drag-handle');
      if (dragHandle) dragHandle.style.cursor = 'grab';

      const position = {
        left: this.state.draggedCube.offsetLeft + 'px',
        top: this.state.draggedCube.offsetTop + 'px'
      };

      try {
        if (window.electronAPI?.setItem) {
          await window.electronAPI.setItem('cube-scene-position', position);
          console.log("Position saved:", position);
        }
      } catch (err) {
        console.warn("Could not save cube position", err);
      }
    }

    if (this.state.isRotating) {
      this.state.isRotating = false;
      this.centreCube.style.cursor = 'grab';
    }

    this.state.draggedCube = null;
  }
}

document.addEventListener('DOMContentLoaded', () => new CubeDragger());
