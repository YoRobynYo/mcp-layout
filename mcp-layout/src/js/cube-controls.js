// Cube rotation state for each corner cube
const cubeRotation = {
  'cube-tl': { x: 0, y: 0, z: 0 },
  'cube-tr': { x: 0, y: 0, z: 0 },
  'cube-bl': { x: 0, y: 0, z: 0 },
  'cube-br': { x: 0, y: 0, z: 0 }
};

// Default selected cube
let currentCubeId = 'cube-tl';

// Function to apply rotation to the selected cube
function updateCubeRotation() {
  const container = document.getElementById(currentCubeId);
  if (!container) return;

  const cube = container.querySelector('.cube');
  if (cube) {
    const rot = cubeRotation[currentCubeId];
    cube.style.transform = `rotateX(${rot.x}deg) rotateY(${rot.y}deg) rotateZ(${rot.z}deg)`;
  }
}

// Initialize controls when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Handle cube selection buttons
  document.querySelectorAll('.screen-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.screen-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentCubeId = this.dataset.target;
      updateCubeRotation();
    });
  });

  // Handle rotation button clicks
  document.querySelectorAll('.rotate-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const action = this.dataset.action;
      const rot = cubeRotation[currentCubeId];
      if (!rot) return;
      
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
      if (cubeRotation[currentCubeId]) {
        cubeRotation[currentCubeId] = { x: 0, y: 0, z: 0 };
        updateCubeRotation();
      }
    });
  }

  // Initialize rotation for all cubes on page load
  Object.keys(cubeRotation).forEach(id => {
      const container = document.getElementById(id);
      if (container) {
          const cube = container.querySelector('.cube');
          if (cube) {
              const rot = cubeRotation[id];
              cube.style.transform = `rotateX(${rot.x}deg) rotateY(${rot.y}deg) rotateZ(${rot.z}deg)`;
          }
      }
  });
});
