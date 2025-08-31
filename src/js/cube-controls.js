// Cube rotation state for each cube
const cubeRotation = {
  cube: { x: 0, y: 0, z: 0 },
  'cube-1': { x: 0, y: 0, z: 0 },
  'cube-2': { x: 0, y: 0, z: 0 },
  'cube-3': { x: 0, y: 0, z: 0 }
};

// Default selected cube
let currentCubeId = 'cube';

// Function to apply rotation to the selected cube
function updateCubeRotation() {
  const cube = document.querySelector(`#${currentCubeId} .cube`);
  if (cube) {
    const rot = cubeRotation[currentCubeId];
    cube.style.transform = `rotateX(${rot.x}deg) rotateY(${rot.y}deg) rotateZ(${rot.z}deg)`;
  }
}

// NEW: Panel dragging functionality
class PanelDragger {
  constructor() {
    this.draggedPanel = null;
    this.offset = { x: 0, y: 0 };
    this.initializeDragging();
  }

  initializeDragging() {
    const panels = document.querySelectorAll('.panel');
    
    panels.forEach(panel => {
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
    
    // Keep panels within the viewport
    const maxX = window.innerWidth - this.draggedPanel.offsetWidth;
    const maxY = window.innerHeight - this.draggedPanel.offsetHeight;
    
    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));
    
    // Update panel position
    this.draggedPanel.style.left = constrainedX + 'px';
    this.draggedPanel.style.top = constrainedY + 'px';
    this.draggedPanel.style.right = 'auto';
    this.draggedPanel.style.bottom = 'auto';
    this.draggedPanel.style.transform = 'none';
  }

  stopDrag() {
    if (this.draggedPanel) {
      this.draggedPanel.classList.remove('dragging');
      this.draggedPanel = null;
    }
  }
}

// Initialize controls when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // NEW: Initialize panel dragging
  new PanelDragger();
  
  // Handle cube selection buttons (if you have them)
  document.querySelectorAll('.screen-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      currentCubeId = this.dataset.target;
      updateCubeRotation();
    });
  });

  // Handle rotation button clicks
  document.querySelectorAll('.rotate-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const action = this.dataset.action;
      const rot = cubeRotation[currentCubeId];
      
      switch(action) {
        case 'left': rot.y -= 90; break;
        case 'right': rot.y += 90; break;
        case 'up': rot.x -= 90; break;
        case 'down': rot.x += 90; break;
      }
      updateCubeRotation();
    });
  });

  // Reset button
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      cubeRotation[currentCubeId] = { x: 0, y: 0, z: 0 };
      updateCubeRotation();
    });
  }

  // Apply button
  const applyBtn = document.getElementById('apply-btn');
  if (applyBtn) {
    applyBtn.addEventListener('click', function() {
      console.log('Current rotation:', cubeRotation[currentCubeId]);
    });
  }

  // Initialize rotation on page load
  updateCubeRotation();
});