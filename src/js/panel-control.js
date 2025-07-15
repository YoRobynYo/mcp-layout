document.addEventListener('DOMContentLoaded', () => {
  // Store rotation state per cube panel
  const rotationStates = {
    cube: { x: 0, y: 0 },
    'cube-1': { x: 0, y: 0 },
    'cube-2': { x: 0, y: 0 },
    'cube-3': { x: 0, y: 0 },
  };

  // Current selected panel
  let currentPanelId = 'cube';

  // Get cube elements by panel id
  const cubes = {
    cube: document.querySelector('#cube .cube'),
    'cube-1': document.querySelector('#cube-1 .cube'),
    'cube-2': document.querySelector('#cube-2 .cube'),
    'cube-3': document.querySelector('#cube-3 .cube'),
  };

  // Update cube rotation styles
  function updateRotation() {
    const cube = cubes[currentPanelId];
    if (!cube) return;
    const rot = rotationStates[currentPanelId];
    cube.style.transform = `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`;
  }

  // Screen buttons to switch selected cube
  document.querySelectorAll('.screen-btn').forEach(button => {
    button.addEventListener('click', () => {
      // Update active button
      document.querySelectorAll('.screen-btn').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Switch current panel
      currentPanelId = button.getAttribute('data-target');

      // Update rotation for selected cube
      updateRotation();
    });
  });

  // Rotation buttons to rotate selected cube
  document.querySelectorAll('.rotate-btn').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-action');
      const rot = rotationStates[currentPanelId];

      switch (action) {
        case 'left': rot.y -= 90; break;
        case 'right': rot.y += 90; break;
        case 'up': rot.x += 90; break;
        case 'down': rot.x -= 90; break;
      }

      updateRotation();
    });
  });

  // Reset rotation button
  const resetBtn = document.getElementById('reset-btn');
  resetBtn?.addEventListener('click', () => {
    rotationStates[currentPanelId] = { x: 0, y: 0 };
    updateRotation();
  });

  // Optional: Apply button (does nothing for now)
  const applyBtn = document.getElementById('apply-btn');
  applyBtn?.addEventListener('click', () => {
    alert(`Rotation applied to ${currentPanelId}: X=${rotationStates[currentPanelId].x}, Y=${rotationStates[currentPanelId].y}`);
  });

  // Initialize rotation on page load
  updateRotation();
});