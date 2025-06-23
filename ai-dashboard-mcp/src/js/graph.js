// graph.js

// Move these declarations inside the DOMContentLoaded listener if they are causing issues,
// but for now, let's keep them global if they don't depend on DOM elements immediately.
const topMover = document.querySelector('.mover-top');
const bottomMover = document.querySelector('.mover-bottom');

let cpuData = [];
let fanData = [];

function drawGraph(id, dataPoints) {
  const canvas = document.getElementById(id);
  // Add a check here to be safe, though DOMContentLoaded should prevent null
  if (!canvas) {
    console.error(`Canvas element with ID '${id}' not found.`);
    return;
  }
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2;
  ctx.beginPath();

  dataPoints.forEach((y, i) => {
    const x = (i / (dataPoints.length - 1)) * canvas.width;
    const yPos = canvas.height - (y / 100) * canvas.height;
    if (i === 0) ctx.moveTo(x, yPos);
    else ctx.lineTo(x, yPos);
  });

  ctx.stroke();
}

async function updateGraphsReal() {
  // Add a console log here to see if this function is being called
  console.log('Updating graphs...');
  const { cpu, fan } = await window.api.getStats();

  // --- Animate GraphMovers ---
  const cpuRotation = Math.min(cpu, 100) * 1.8;
  const fanRotation = Math.min(fan, 2500) / 2500 * 180;

  if (topMover) {
    topMover.style.transform = `rotate(${cpuRotation}deg)`;
    topMover.style.transformOrigin = 'center bottom';
  } else {
    console.warn('topMover element not found.');
  }

  if (bottomMover) {
    bottomMover.style.transform = `rotate(${fanRotation}deg)`;
    bottomMover.style.transformOrigin = 'center bottom';
  } else {
    console.warn('bottomMover element not found.');
  }

  // --- Graph logic (same as before) ---
  if (cpuData.length > 30) cpuData.shift();
  if (fanData.length > 30) fanData.shift();

  cpuData.push(Math.round(cpu));
  fanData.push(Math.round((fan / 2500) * 100));

  drawGraph('graphTop', cpuData);
  drawGraph('graphBottom', fanData);
}

// Wrap the initial setup and setInterval in DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed. Initializing graph updates.');
  // Initial call to update graphs
  updateGraphsReal();
  // Set interval for continuous updates
  setInterval(updateGraphsReal, 1000);
});
