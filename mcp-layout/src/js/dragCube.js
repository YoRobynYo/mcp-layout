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
      rotationY: 0,
      selectedFace: 'front' // Initialize selected face
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

    await this.initializePanels();
    this.updateFaceHighlight(this.state.selectedFace); // Initial highlight
  }

  initializePanels() {
    return new Promise(resolve => {
      setTimeout(() => {
        this.panels = {
          front: this.centreCube.querySelector(".face.front"),
          back: this.centreCube.querySelector(".face.back"),
          left: this.centreCube.querySelector(".face.left"),
          right: this.centreCube.querySelector(".face.right"),
          top: this.centreCube.querySelector(".face.top"),
          bottom: this.centreCube.querySelector(".face.bottom")
        };
        console.log("Panels initialized:", this.panels);
        this.updateVisiblePanel();
        resolve();
      }, 100);
    });
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
      position:absolute;top:-30px;left:50%;transform:translateX(-50%);
      width:50px;height:20px;background:linear-gradient(145deg,rgba(255,255,255,0.1),rgba(255,255,255,0.05));
      border:1px solid rgba(255,255,255,0.2);border-radius:10px 10px 3px 3px;
      color:rgba(255,255,255,0.6);font-size:12px;display:flex;align-items:center;
      justify-content:center;cursor:grab;backdrop-filter:blur(5px);user-select:none;
      z-index:1001;transition:all 0.2s ease;display:block;
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

    dragHandle.addEventListener('mousedown', this.startDrag.bind(this));
    dragHandle.addEventListener('touchstart', this.startDrag.bind(this));

    this.centreCube.addEventListener("contextmenu", e => e.preventDefault());

    this.addFaceInteractionListeners();
  }

  addFaceInteractionListeners() {
    const faces = this.centreCube.querySelectorAll('.face');
    faces.forEach(face => {
      face.addEventListener('click', (e) => {
        const faceElement = e.target.closest('.face');
        const faceName = faceElement ? faceElement.dataset.face : 'unknown';
        const smallCubeElement = e.target.closest('.small-cube');
        const smallCubeId = smallCubeElement ? smallCubeElement.dataset.smallCubeId : 'unknown';
        if (window.streamspaceIntegration) {
          window.streamspaceIntegration.showStreamspace(smallCubeId, faceName);
        }
      });
    });
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

    document.addEventListener('mousemove', this.move.bind(this));
    document.addEventListener('touchmove', this.move.bind(this));
    document.addEventListener('mouseup', this.stopInteraction.bind(this));
    document.addEventListener('touchend', this.stopInteraction.bind(this));
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

    document.addEventListener('mousemove', this.move.bind(this));
    document.addEventListener('touchmove', this.move.bind(this));
    document.addEventListener('mouseup', this.stopInteraction.bind(this));
    document.addEventListener('touchend', this.stopInteraction.bind(this));
  }

  setCubeRotation(rotationX, rotationY, transition = 'none') {
    this.state.rotationX = rotationX;
    this.state.rotationY = rotationY;
    this.centreCube.style.transition = transition;
    this.centreCube.style.transform = `rotateX(${this.state.rotationX}deg) rotateY(${this.state.rotationY}deg)`;

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
      if (!this.state.draggedCube) return; // Add this null check

      const newX = clientX - this.state.offset.x;
      const newY = clientY - this.state.offset.y;

      const maxX = window.innerWidth - this.state.draggedCube.offsetWidth - 10;
      const maxY = window.innerHeight - this.state.draggedCube.offsetHeight - 10;
      const constrainedX = Math.max(10, Math.min(newX, maxX));
      const constrainedY = Math.max(40, Math.min(newY, maxY));

      this.state.draggedCube.style.left = constrainedX + 'px';
      this.state.draggedCube.style.top = constrainedY + 'px';
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
    if (!this.panels.front) return;

    const normalizedY = ((this.state.rotationY % 360) + 360) % 360;
    const normalizedX = ((this.state.rotationX % 360) + 360) % 360;

    // Remove panel-visible from all faces
    Object.values(this.panels).forEach(p => {
      if (p) p.classList.remove("panel-visible");
    });

    // Determine which face is most visible based on rotation
    let currentVisibleFace = '';
    if (normalizedX === 0) { // Horizontal faces (front, back, left, right)
      if ((normalizedY >= 315 || normalizedY < 45)) {
        currentVisibleFace = 'front';
      } else if (normalizedY >= 45 && normalizedY < 135) {
        currentVisibleFace = 'right';
      } else if (normalizedY >= 135 && normalizedY < 225) {
        currentVisibleFace = 'back';
      } else if (normalizedY >= 225 && normalizedY < 315) {
        currentVisibleFace = 'left';
      }
    } else if (normalizedY === 0 || normalizedY === 180) { // Vertical faces (top, bottom)
      if (normalizedX >= 45 && normalizedX < 135) {
        currentVisibleFace = 'bottom';
      } else if (normalizedX >= 225 && normalizedX < 315) {
        currentVisibleFace = 'top';
      }
    }

    if (this.panels[currentVisibleFace]) {
      this.panels[currentVisibleFace].classList.add("panel-visible");
      console.log(`Showing ${currentVisibleFace} panel`);
    }
  }

  updateFaceHighlight(faceName) {
    if (!this.panels.front) return; // Panels not initialized yet

    // Remove highlight from all faces
    Object.values(this.panels).forEach(p => {
      if (p) p.classList.remove("face-selected");
    });

    // Add highlight to the selected face
    if (this.panels[faceName]) {
      this.panels[faceName].classList.add("face-selected");
      this.state.selectedFace = faceName; // Update internal state
      console.log(`Highlighted face: ${faceName}`);
    }
  }

  snapToFace() {
    const snapAngle = 90;

    let normRotationX = this.state.rotationX % 360;
    let normRotationY = this.state.rotationY % 360;

    let targetX = Math.round(normRotationX / snapAngle) * snapAngle;
    let targetY = Math.round(normRotationY / snapAngle) * snapAngle;

    this.setCubeRotation(targetX, targetY, 'transform 0.5s ease-out');

    setTimeout(() => {
      this.updateVisiblePanel();
      const labels = document.querySelectorAll('.face-label');
      labels.forEach(label => {
        label.style.transition = 'none';
      });
    }, 500);
  }

  async stopInteraction() {
    document.removeEventListener('mousemove', this.move.bind(this));
    document.removeEventListener('touchmove', this.move.bind(this));
    document.removeEventListener('mouseup', this.stopInteraction.bind(this));
    document.removeEventListener('touchend', this.stopInteraction.bind(this));

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

window.cubeDraggers = {}; // Expose dragger instances globally

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired.");
    const cubeScenes = document.querySelectorAll('.cube-scene');
    console.log(`Found ${cubeScenes.length} cube scenes.`);
    cubeScenes.forEach(cubeScene => {
        console.log(`Initializing CubeDragger for #${cubeScene.id}`);
        const dragger = new CubeDragger(cubeScene);
        window.cubeDraggers[cubeScene.id] = dragger; // Store instance
    });
});


