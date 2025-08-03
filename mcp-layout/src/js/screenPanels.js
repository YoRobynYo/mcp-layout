document.addEventListener('DOMContentLoaded', () => {
  const cubeScenes = document.querySelectorAll('.cube-scene');

  const faceLabels = {
    'front': 'F',
    'back': 'B',
    'left': 'L',
    'right': 'R',
    'top': 'T',
    'bottom': 'D'
  };

  cubeScenes.forEach(cubeScene => {
    const faces = cubeScene.querySelectorAll('.face');

    faces.forEach(face => {
      const directionClass = Array.from(face.classList).find(cls => faceLabels[cls]);

      if (directionClass) {
        const label = faceLabels[directionClass];
        face.innerHTML = `<span style="font-size: 2rem; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">${label}</span>`;
      }
    });
  });
});
