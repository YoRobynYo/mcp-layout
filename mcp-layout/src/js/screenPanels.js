document.addEventListener('DOMContentLoaded', () => {
  const cubeScenes = document.querySelectorAll('.cube-scene');

  const faceLabels = {
    'front': 'F',
    'back': 'B',
    'left': 'L',
    'right': 'R'
  };

  cubeScenes.forEach(cubeScene => {
    // Clear all existing face content first
    const allFaces = cubeScene.querySelectorAll('.face');
    allFaces.forEach(face => {
      face.innerHTML = '';
    });

    // Assign labels to specific faces for each cube
    const cubeId = cubeScene.id;

    // Front face
    const frontFace = cubeScene.querySelector(`[data-small-cube-id="${cubeId}-top-left-front"] .face.front`);
    if (frontFace) {
      frontFace.innerHTML = `<span style="font-size: 2rem; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">${faceLabels.front}</span>`;
    }

    // Back face
    const backFace = cubeScene.querySelector(`[data-small-cube-id="${cubeId}-top-left-back"] .face.back`);
    if (backFace) {
      backFace.innerHTML = `<span style="font-size: 2rem; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">${faceLabels.back}</span>`;
    }

    // Left face
    const leftFace = cubeScene.querySelector(`[data-small-cube-id="${cubeId}-top-left-front"] .face.left`);
    if (leftFace) {
      leftFace.innerHTML = `<span style="font-size: 2rem; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">${faceLabels.left}</span>`;
    }

    // Right face
    const rightFace = cubeScene.querySelector(`[data-small-cube-id="${cubeId}-top-right-front"] .face.right`);
    if (rightFace) {
      rightFace.innerHTML = `<span style="font-size: 2rem; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">${faceLabels.right}</span>`;
    }
  });
});