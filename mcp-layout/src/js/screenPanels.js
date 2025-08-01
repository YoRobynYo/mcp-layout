
// screenPanels.js
console.log("screenPanels.js loaded");

class ScreenPanels {
  constructor() {
    this.panels = {
      front: {
        id: 'front-panel',
        content: '<div class="face-label-container"><span class="face-label">F</span></div>'
      },
      back: {
        id: 'back-panel',
        content: '<div class="face-label-container"><span class="face-label">B</span></div>'
      },
      left: {
        id: 'left-panel',
        content: '<div class="face-label-container"><span class="face-label">L</span></div>'
      },
      right: {
        id: 'right-panel',
        content: '<div class="face-label-container"><span class="face-label">R</span></div>'
      },
      top: {
        id: 'top-panel',
        content: '<div class="face-label-container"><span class="face-label">T</span></div>'
      },
      bottom: {
        id: 'bottom-panel',
        content: '<div class="face-label-container"><span class="face-label">B</span></div>'
      }
    };

    this.createPanels();
    this.updateSystemInfo();
  }

  createPanels() {
    const cube = document.querySelector('.centreCube');
    if (!cube) {
      console.warn("Centre cube not found");
      return;
    }

    for (const face in this.panels) {
      const panelInfo = this.panels[face];
      const panel = document.createElement('div');
      panel.id = panelInfo.id;
      panel.className = `screen-panel ${face}-panel`;
      panel.innerHTML = panelInfo.content;
      cube.querySelector(`.centre${face.charAt(0).toUpperCase() + face.slice(1)}`).appendChild(panel);
    }
  }

  updateSystemInfo() {
    const systemInfoPanel = document.getElementById('system-info');
    if (systemInfoPanel) {
      // Mock system info for now
      systemInfoPanel.innerHTML = `
        <p>CPU Usage: ${Math.floor(Math.random() * 100)}%</p>
        <p>RAM Usage: ${Math.floor(Math.random() * 100)}%</p>
        <p>Fan Speed: ${Math.floor(Math.random() * 5000)} RPM</p>
      `;
    }
  }
}


