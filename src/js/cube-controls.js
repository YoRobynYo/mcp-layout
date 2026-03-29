// Cube rotation state for each corner cube
const cubeRotation = {
  'cube-tl': { x: 0, y: 0, z: 0 },
  'cube-tr': { x: 0, y: 0, z: 0 },
  'cube-bl': { x: 0, y: 0, z: 0 }
};

// Default selected cube
let currentCubeId = 'cube-tl';

// Function to generate content for center stage based on clicked module
function generateAppContent(cubeId, faceName, label, value) {
  const centerPanel = document.getElementById('center-panel');
  if (!centerPanel) return;

  const cleanLabel = label.trim().toUpperCase();

  if (cleanLabel.includes('YOUTUBE')) {
    renderYoutubePlayer();
    return;
  }

  if (cleanLabel.includes('SYSTEMS CONTROL')) {
    renderSystemsControl();
    return;
  }

  const themes = {
    'cube-tl': { title: 'System Core', color: '#9f8045' },
    'cube-tr': { title: 'Network Hub', color: '#4682b4' },
    'cube-bl': { title: 'Security Matrix', color: '#dc143c' }
  };

  const theme = themes[cubeId] || { title: 'Module', color: '#9f8045' };

  centerPanel.innerHTML = `
    <div class="active-app-container" style="border-top: 4px solid ${theme.color}">
      <div class="app-header">
        <span class="app-title">${theme.title}</span>
        <button class="close-app-btn" onclick="resetCenterStage()">CLOSE</button>
      </div>
      <div class="app-body">
        <div class="app-sidebar">
           <div class="sidebar-item active">Overview</div>
           <div class="sidebar-item">Telemetry</div>
           <div class="sidebar-item">History</div>
           <div class="sidebar-item">Config</div>
        </div>
        <div class="app-main">
          <div class="detail-grid">
            <div class="detail-card">
              <div class="detail-label">${label}</div>
              <div class="detail-value" style="color: ${theme.color}">${value}</div>
            </div>
            <div class="detail-card">
              <div class="detail-label">ACTIVE THREADS</div>
              <div class="detail-value">256</div>
            </div>
            <div class="detail-card full-width">
              <div class="detail-label">LIVE STATUS LOG</div>
              <div class="log-output">
                [${new Date().toLocaleTimeString()}] Accessing ${faceName} protocols...<br>
                [${new Date().toLocaleTimeString()}] Handshaking with ${cubeId} module...<br>
                [${new Date().toLocaleTimeString()}] Data stream synchronized.<br>
                [${new Date().toLocaleTimeString()}] Stability verified at 99.9%.<br>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderYoutubePlayer() {
  const centerPanel = document.getElementById('center-panel');
  centerPanel.innerHTML = `
    <div class="active-app-container" style="border-top: 4px solid #ff0000">
      <div class="app-header">
        <span class="app-title">YouTube Player</span>
        <button class="close-app-btn" onclick="resetCenterStage()">CLOSE</button>
      </div>
      <div class="app-body">
        <iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>
      </div>
    </div>
  `;
}

function renderSystemsControl() {
  const centerPanel = document.getElementById('center-panel');
  centerPanel.innerHTML = `
    <div class="active-app-container" style="border-top: 4px solid #00ff00">
      <div class="app-header">
        <span class="app-title">Systems Control</span>
        <button class="close-app-btn" onclick="resetCenterStage()">CLOSE</button>
      </div>
      <div class="app-body" style="padding: 20px; flex-direction: column; overflow-y: auto;">
        <h3 style="color: #9f8045; margin-bottom: 20px;">SYSTEM PERFORMANCE</h3>
        <div class="detail-grid">
          <div class="detail-card"><div class="detail-label">CPU USAGE</div><div class="detail-value">14%</div></div>
          <div class="detail-card"><div class="detail-label">RAM FREE</div><div class="detail-value">12.4 GB</div></div>
          <div class="detail-card"><div class="detail-label">DISK USAGE</div><div class="detail-value">68%</div></div>
          <div class="detail-card"><div class="detail-label">BATTERY</div><div class="detail-value">98%</div></div>
          <div class="detail-card full-width" style="text-align: center;">
            <button class="face-btn" style="width: 200px; margin-top: 20px;" onclick="alert('Diagnostics Running...')">RUN FULL DIAGNOSTICS</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Global reset for center stage
window.resetCenterStage = function() {
  const centerPanel = document.getElementById('center-panel');
  if (centerPanel) {
    centerPanel.innerHTML = `
      <div class="welcome-msg">
        <h2>SYSTEM ONLINE</h2>
        <p>Select a module from the corner nodes to begin.</p>
      </div>
    `;
  }
};

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

  // Handle face clicks (restoring original cube interaction)
  document.querySelectorAll('.face').forEach(faceEl => {
    faceEl.addEventListener('click', function(e) {
      // Get location info
      const faceName = Array.from(this.classList).find(c => ['front', 'back', 'left', 'right', 'top', 'bottom'].includes(c));
      const cubeId = this.closest('.cube-container').id;

      const labelEl = this.querySelector('.face-label');
      const valueEl = this.querySelector('.face-value');

      const label = labelEl ? labelEl.innerText : 'Unknown Module';
      const value = valueEl ? valueEl.innerText : 'N/A';

      // Don't trigger if we clicked an interactive element inside the face
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') {
        generateAppContent(cubeId, faceName, label, value);
        return;
      }
      e.stopPropagation();

      // Remove active class from all faces
      document.querySelectorAll('.face').forEach(f => f.classList.remove('active'));

      // Add active class to clicked face
      this.classList.add('active');

      // Generate rich content in center stage
      generateAppContent(cubeId, faceName, label, value);
    });
  });

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
