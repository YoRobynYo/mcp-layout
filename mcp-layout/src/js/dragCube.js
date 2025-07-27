// dragCube.js 
console.log("dragCube.js loaded");

class CubeDragger {
  constructor() {
    this.draggedCube = null;
    this.offset = { x: 0, y: 0 };
    this.isDragging = false;

    this.centreCube = null;
    this.isRotating = false;
    this.startX = 0;
    this.startY = 0;
    this.rotationX = 0;
    this.rotationY = 0;

    this.init();
  }

  async init() {
    const cubeScene = document.querySelector('.cube-scene');
    this.centreCube = document.querySelector('.centreCube');

    if (!cubeScene || !this.centreCube) {
      console.warn("Cube elements not found");
      return;
    }

    cubeScene.style.position = 'absolute';
    cubeScene.style.zIndex = '10';

    // Restore position if saved
    try {
      if (window.electronAPI?.getItem) {
        const savedPos = await window.electronAPI.getItem('cube-scene-position');
        if (savedPos) {
          const pos = typeof savedPos === 'string' ? JSON.parse(savedPos) : savedPos;
          cubeScene.style.left = pos.left;
          cubeScene.style.top = pos.top;
        }
      }
    } catch (err) {
      console.warn("Could not restore cube position", err);
    }

    const start = this.startInteraction.bind(this);
    const move = this.move.bind(this);
    const stop = this.stopInteraction.bind(this);

    cubeScene.addEventListener("mousedown", start);
    cubeScene.addEventListener("touchstart", start);
    document.addEventListener("mousemove", move);
    document.addEventListener("touchmove", move);
    document.addEventListener("mouseup", stop);
    document.addEventListener("touchend", stop);

    this.centreCube.addEventListener("contextmenu", e => e.preventDefault());
  }

  startInteraction(e) {
    const cubeScene = e.target.closest('.cube-scene');
    const isCentre = e.target.closest('.centreCube');
    if (!cubeScene) return;

    e.preventDefault();
    if (isCentre) {
      this.startRotate(e, cubeScene);
    } else {
      this.startDrag(e, cubeScene);
    }
  }

  startDrag(e, cubeScene) {
    this.isDragging = true;
    this.draggedCube = cubeScene;
    const rect = cubeScene.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    this.offset.x = clientX - rect.left;
    this.offset.y = clientY - rect.top;
  }

  startRotate(e, cubeScene) {
    this.isRotating = true;
    this.draggedCube = cubeScene;
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    this.startX = clientX;
    this.startY = clientY;
    this.centreCube.style.transition = 'none';
    this.centreCube.style.cursor = 'grabbing';
  }

  move(e) {
    if (this.isDragging) {
      const clientX = e.clientX || e.touches?.[0]?.clientX;
      const clientY = e.clientY || e.touches?.[0]?.clientY;
      const newX = clientX - this.offset.x;
      const newY = clientY - this.offset.y;

      const maxX = window.innerWidth - this.draggedCube.offsetWidth;
      const maxY = window.innerHeight - this.draggedCube.offsetHeight;

      this.draggedCube.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
      this.draggedCube.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;
    } else if (this.isRotating) {
      const clientX = e.clientX || e.touches?.[0]?.clientX;
      const clientY = e.clientY || e.touches?.[0]?.clientY;
      const deltaX = clientX - this.startX;
      const deltaY = clientY - this.startY;

      this.rotationY += deltaX * 0.5;
      this.rotationX -= deltaY * 0.5;

      this.centreCube.style.transform = `rotateX(${this.rotationX}deg) rotateY(${this.rotationY}deg)`;

      this.startX = clientX;
      this.startY = clientY;
    }
  }

  async stopInteraction() {
    if (this.isDragging) {
      this.isDragging = false;
      const left = this.draggedCube.style.left;
      const top = this.draggedCube.style.top;
      try {
        if (window.electronAPI?.setItem) {
          await window.electronAPI.setItem('cube-scene-position', { left, top });
        }
      } catch (err) {
        console.warn("Could not save cube position", err);
      }
    }

    if (this.isRotating) {
      this.isRotating = false;
      this.centreCube.style.cursor = 'grab';
    }

    this.draggedCube = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CubeDragger();
});