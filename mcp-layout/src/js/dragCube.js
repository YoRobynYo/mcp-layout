// dragCube.js
console.log("dragCube.js loaded");

class CubeDragger {
  constructor(cubeSceneElement) {
    console.log(`CubeDragger constructor called for #${cubeSceneElement.id}`);
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
    this.cubeScene = cubeSceneElement; // Store the specific cubeScene element
    this.centreCube = this.cubeScene.querySelector('.centreCube');
    if (!this.cubeScene || !this.centreCube) {
      console.warn("Cube elements not found for this instance");
      return;
    }
    this.init();
  }

  async init() {
    console.log(`init() called for #${this.cubeScene.id}`);
    this.cubeScene.style.cssText = 'position:absolute;z-index:10';
    const dragHandle = this.createDragHandle(this.cubeScene);
    await this.restorePosition(this.cubeScene, `cube-scene-position-${this.cubeScene.id}`);
    this.addEventListeners(dragHandle, this.cubeScene);

    // Only the main cube controls the content screen
    // if (this.cubeScene.id === 'cube-scene-main') {
    //   this.updateMainContentScreen();
    // }
    this.initializePanels();
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

  async restorePosition(cubeScene, storageKey) {
    console.log(`restorePosition() called for #${cubeScene.id} with key ${storageKey}`);
    try {
      let attempts = 0;
      while (!window.electronAPI?.getItem && attempts < 50) {
        console.log("Waiting for electronAPI.getItem...");
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (window.electronAPI?.getItem) {
        console.log("electronAPI.getItem is available.");
        const savedPos = await window.electronAPI.getItem(storageKey);
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
        } else {
          console.log("No saved position found for key:", storageKey);
        }

        const savedRotation = await window.electronAPI.getItem('cube-rotation');
        if (savedRotation) {
          const rotation = typeof savedRotation === 'string' ? JSON.parse(savedRotation) : savedRotation;
          this.state.rotationX = rotation.x;
          this.state.rotationY = rotation.y;
          this.centreCube.style.transform = `rotateX(${this.state.rotationX}deg) rotateY(${this.state.rotationY}deg)`;
          console.log("Rotation restored:", rotation);
        } else {
          console.log("No saved rotation found.");
        }
      } else {
        console.warn("window.electronAPI.getItem not available after attempts.");
      }
    } catch (err) {
      console.error("Error in restorePosition:", err);
    }

    // Make the cube visible after restoring its position
    cubeScene.style.visibility = 'visible';
    cubeScene.style.opacity = 1;
  }

  createDragHandle(cubeScene) {
    console.log(`createDragHandle() called for #${cubeScene.id}`);
    const handle = Object.assign(document.createElement('div'), {
      className: 'cube-drag-handle',
      innerHTML: '⋮⋮⋮'
    });

    handle.style.cssText = `
      position:absolute;top:5px;left:50%;transform:translateX(-50%);
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
    return handle;
  }

  addEventListeners(dragHandle, cubeScene) {
    console.log(`addEventListeners() called for #${cubeScene.id}`);
    const events = {
      move: ['mousemove', 'touchmove'],
      stop: ['mouseup', 'touchend']
    };

    dragHandle.addEventListener('mousedown', this.startDrag.bind(this));
    dragHandle.addEventListener('touchstart', this.startDrag.bind(this));
    this.centreCube.addEventListener('mousedown', this.startRotate.bind(this));
    this.centreCube.addEventListener('touchstart', this.startRotate.bind(this));

    events.move.forEach(event => document.addEventListener(event, this.move.bind(this)));
    events.stop.forEach(event => document.addEventListener(event, this.stopInteraction.bind(this)));
    this.centreCube.addEventListener("contextmenu", e => e.preventDefault());
  }

  startDrag(e) {
    console.log(`startDrag() called for #${this.cubeScene.id}`);
    e.preventDefault();
    this.state.isDragging = true;
    this.state.draggedCube = this.cubeScene;
    const dragHandle = this.cubeScene.querySelector('.cube-drag-handle');
    if (dragHandle) dragHandle.style.cursor = 'grabbing';

    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    this.state.offset = {
      x: clientX - this.cubeScene.offsetLeft,
      y: clientY - this.cubeScene.offsetTop
    };
  }

  startRotate(e) {
    console.log(`startRotate() called for #${this.cubeScene.id}`);
    e.preventDefault();
    this.state.isRotating = true;
    this.state.draggedCube = this.cubeScene;
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    this.state.startX = clientX;
    this.state.startY = clientY;
    this.centreCube.style.cssText += 'transition:none;cursor:grabbing';
  }

  setCubeRotation(rotationX, rotationY, transition = 'none') {
    this.state.rotationX = rotationX;
    this.state.rotationY = rotationY;
    this.centreCube.style.transition = transition;
    this.centreCube.style.transform = `rotateX(${this.state.rotationX}deg) rotateY(${this.state.rotationY}deg)`;

    // Counter-rotate the labels
    const labels = document.querySelectorAll('.face-label');
    labels.forEach(label => {
      label.style.transition = transition;
      label.style.transform = `rotateY(${-this.state.rotationY}deg) rotateX(${-this.state.rotationX}deg)`;
    });
  }

  move(e) {
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;

    if (this.state.isDragging) {
      const newX = clientX - this.state.offset.x;
      const newY = clientY - this.state.offset.y;

      const maxX = window.innerWidth - this.state.draggedCube.offsetWidth;
      const maxY = window.innerHeight - this.state.draggedCube.offsetHeight;
      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));

      this.state.draggedCube.style.left = `${constrainedX}px`;
      this.state.draggedCube.style.top = `${constrainedY}px`;
    } else if (this.state.isRotating) {
      const deltaX = clientX - this.state.startX;
      const deltaY = clientY - this.state.startY;
      const newRotationX = this.state.rotationX - deltaY * 0.5;
      const newRotationY = this.state.rotationY + deltaX * 0.5;
      this.setCubeRotation(newRotationX, newRotationY);
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

  snapToFace() {
    const snapAngle = 90;
    const snapThreshold = 45;

    // Normalize angles to be within -180 to 180
    let normRotationX = this.state.rotationX % 360;
    let normRotationY = this.state.rotationY % 360;

    // Snap X rotation
    let targetX = Math.round(normRotationX / snapAngle) * snapAngle;

    // Snap Y rotation
    let targetY = Math.round(normRotationY / snapAngle) * snapAngle;

    // Apply a smooth transition
    this.setCubeRotation(targetX, targetY, 'transform 0.5s ease-out');

    // Update the visible panel after snapping
    setTimeout(() => {
      this.updateVisiblePanel();
      // Reset label transition after snap
      const labels = document.querySelectorAll('.face-label');
      labels.forEach(label => {
        label.style.transition = 'none';
      });
    }, 500);
  }

  async stopInteraction() {
    console.log(`stopInteraction() called for #${this.cubeScene.id}`);
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
          await window.electronAPI.setItem(`cube-scene-position-${this.cubeScene.id}`, position);
          console.log("Position saved:", position);
        } else {
          console.warn("window.electronAPI.setItem not available for saving position.");
        }
      } catch (err) {
        console.error("Could not save cube position:", err);
      }
    }

    if (this.state.isRotating) {
      this.state.isRotating = false;
      this.centreCube.style.cursor = 'grab';
      this.snapToFace();

      const rotation = {
        x: this.state.rotationX,
        y: this.state.rotationY
      };

      try {
        if (window.electronAPI?.setItem) {
          await window.electronAPI.setItem('cube-rotation', rotation);
          console.log("Rotation saved:", rotation);
        } else {
          console.warn("window.electronAPI.setItem not available for saving rotation.");
        }
      } catch (err) {
        console.error("Could not save cube rotation:", err);
      }
    }

    this.state.draggedCube = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired.");
    const cubeScenes = document.querySelectorAll('.cube-scene');
    console.log(`Found ${cubeScenes.length} cube scenes.`);
    cubeScenes.forEach(cubeScene => {
        console.log(`Initializing CubeDragger for #${cubeScene.id}`);
        new CubeDragger(cubeScene);
    });
});