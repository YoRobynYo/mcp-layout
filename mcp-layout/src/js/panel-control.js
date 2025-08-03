document.addEventListener('DOMContentLoaded', () => {
  // Store rotation state and selected face per cube panel
  const rotationStates = {
    'centre-cube-main': { x: 0, y: 0, selectedFace: 'front' },
    'centre-cube-secondary': { x: 0, y: 0, selectedFace: 'front' },
  };

  // Define face-to-rotation mapping
  const faceRotations = {
    'front': { x: 0, y: 0 },
    'back': { x: 0, y: 180 },
    'left': { x: 0, y: -90 },
    'right': { x: 0, y: 90 },
    'top': { x: -90, y: 0 },
    'bottom': { x: 90, y: 0 }
  };

  // Current selected panel
  let currentPanelId = 'centre-cube-main';

  // Get cube elements by panel id
  const cubes = {
    'centre-cube-main': document.getElementById('centre-cube-main'),
    'centre-cube-secondary': document.getElementById('centre-cube-secondary'),
  };

  // Update cube rotation styles
  function updateRotation() {
    const cube = cubes[currentPanelId];
    if (!cube) return;
    const rot = rotationStates[currentPanelId];
    cube.style.transform = `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`;

    // Trigger face highlight update in dragCube.js (if available)
    if (window.cubeDraggers && window.cubeDraggers[currentPanelId]) {
      window.cubeDraggers[currentPanelId].updateFaceHighlight(rot.selectedFace);
    }
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

      // Update button highlights for the newly selected cube's face
      updateButtonHighlights(rotationStates[currentPanelId].selectedFace);
    });
  });

  // Function to update button highlights based on selected face
  function updateButtonHighlights(selectedFace) {
    document.querySelectorAll('.rotate-btn').forEach(btn => {
      btn.classList.remove('button-active');
      if (btn.getAttribute('data-action') === `select-${selectedFace}`) {
        btn.classList.add('button-active');
      }
    });
  }

  // Rotation buttons to select specific cube faces
  document.querySelectorAll('.rotate-btn').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-action');
      const rot = rotationStates[currentPanelId];

      // Remove active class from all rotate buttons
      document.querySelectorAll('.rotate-btn').forEach(btn => btn.classList.remove('button-active'));
      // Add active class to the clicked button
      button.classList.add('button-active');

      if (action.startsWith('select-')) {
        const face = action.replace('select-', '');
        const targetRotation = faceRotations[face];
        if (targetRotation) {
          rot.x = targetRotation.x;
          rot.y = targetRotation.y;
          rot.selectedFace = face;
          updateRotation();
        }
      } else { // Keep existing rotation logic for now if not a 'select-' action
        switch (action) {
          case 'left': rot.y -= 90; break;
          case 'right': rot.y += 90; break;
          case 'up': rot.x += 90; break;
          case 'down': rot.x -= 90; break;
        }
        // Determine selected face based on new rotation (simplified for now)
        // This part might need more sophisticated logic if rotation is not snapped
        rot.selectedFace = 'front'; // Default to front for non-face-selection rotations
        updateRotation();
      }
    });
  });

  // Reset rotation button
  const resetBtn = document.getElementById('reset-btn');
  resetBtn?.addEventListener('click', () => {
    rotationStates[currentPanelId] = { x: 0, y: 0, selectedFace: 'front' };
    updateRotation();
    updateButtonHighlights('front');
  });

  // Optional: Apply button (does nothing for now)
  const applyBtn = document.getElementById('apply-btn');
  applyBtn?.addEventListener('click', () => {
    alert(`Rotation applied to ${currentPanelId}: X=${rotationStates[currentPanelId].x}, Y=${rotationStates[currentPanelId].y}, Selected Face: ${rotationStates[currentPanelId].selectedFace}`);
  });

  // Initialize rotation and button highlights on page load
  updateRotation();
  updateButtonHighlights(rotationStates[currentPanelId].selectedFace);
});


