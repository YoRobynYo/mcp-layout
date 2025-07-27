To setup the project::

    setup the css to compile the scss 
In the css folder add style.scss 
open a new terminal in the folder layout name (cd into mcp-layout)
sass css/style.scss css/style.css
this will link the style.scss with the css for the scss to run 

    in the terminal run :: 
cd mcp-layout / npx sass css/style.scss css/style.css --watch

    to setup package.json 
in a new terminal :: npm init -y

then install Electron browser for this project 
npm install electron --save-dev (to add Electron)
you need to add "start": "electron ." in the package.json

here is an updated version of package.json 
{
  "name": "dashboard-project",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron ." <------- note the update 
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/YoRobynYo/Dashboard.git"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/YoRobynYo/Dashboard/issues"
  },
  "homepage": "https://github.com/YoRobynYo/Dashboard#readme",
  "description": ""
}

    when restarting : 
cd into the project / cd into mcp-layout 
terminal -1 npx sass scss/style.scss css/style.css --watch (for css / style.scss)
terminal -2 npm start 
(this will start the package.json to run electron browser)

    // any errors look here first check the path
sometimes on running npm start you will get a path error 
normally its in the main.js file in here :: 
    win.loadFile(path.join(__dirname, 'index.html')); 
but the file electron is looking for is here :: 
win.loadFile(path.join(__dirname, 'mcp-layout', 'index.html'));
so we have to update the main.js path for electron
this will tell Electron to load the HTML from the correct folder

then restart the electron browser 

    clearing the cache 
in the terminal :: rm -rf node_modules/.cache
then restart your server:

    add git so we have a backup 
cd mcp-layout 
# 1. Initialize Git (if not already done)
git init

# 2. Add your files to staging
git add .

# 3. Commit the files
git commit -m "Initial commit"

# 4. Rename the branch to 'main'
git branch -M main

# 5. Add the remote repo (if not already done)
git remote add origin https://github.com/YoRobynYo/mcp-layout.git

# 6. Push to GitHub
git push -u origin main

# git is now updated 
https://github.com/YoRobynYo/mcp-layout 


this setting rotates a 3d cube 

class CubeDragger {
    constructor() {
        this.centreCube = document.querySelector('.centreCube');
        this.isRotating = false;
        this.startX = 0;
        this.startY = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        this.init();
    }

    init() {
        if (!this.centreCube) {
            console.error('Centre cube not found!');
            return;
        }

        console.log('CubeDragger initialized, cube found:', this.centreCube);

        // Only listen for rotation events on the cube itself
        this.centreCube.addEventListener('mousedown', this.startRotate.bind(this));
        document.addEventListener('mousemove', this.rotate.bind(this));
        document.addEventListener('mouseup', this.stopRotate.bind(this));
        
        // Prevent context menu
        this.centreCube.addEventListener('contextmenu', e => e.preventDefault());
    }

    startRotate(e) {
        console.log('🟢 START ROTATE - Mouse down detected');
        e.preventDefault();
        e.stopPropagation();

        this.isRotating = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        
        // Disable CSS transitions immediately
        this.centreCube.style.transition = 'none';
        this.centreCube.style.cursor = 'grabbing';
        
        console.log('Starting position:', this.startX, this.startY);
        console.log('Current rotations:', this.rotationX, this.rotationY);
    }

    rotate(e) {
        if (!this.isRotating) return;
        
        console.log('🔄 ROTATING - Mouse move detected');
        e.preventDefault();
        
        const currentX = e.clientX;
        const currentY = e.clientY;
        
        const deltaX = currentX - this.startX;
        const deltaY = currentY - this.startY;
        
        // Update rotation values
        this.rotationY += deltaX * 0.5;
        this.rotationX -= deltaY * 0.5;
        
        // Apply the transform
        const transform = `rotateX(${this.rotationX}deg) rotateY(${this.rotationY}deg)`;
        this.centreCube.style.transform = transform;
        
        console.log('Delta:', deltaX, deltaY);
        console.log('New rotations:', this.rotationX, this.rotationY);
        console.log('Applied transform:', transform);
        
        // Update start position for next move
        this.startX = currentX;
        this.startY = currentY;
    }

    stopRotate() {
        if (!this.isRotating) return;
        
        console.log('🔴 STOP ROTATE - Mouse up detected');
        
        this.isRotating = false;
        this.centreCube.style.cursor = 'grab';
        this.centreCube.style.transition = '';
        
        console.log('Final rotations:', this.rotationX, this.rotationY);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating CubeDragger...');
    window.cubeDragger = new CubeDragger();
});

// Also try immediate initialization in case DOM is already loaded
if (document.readyState === 'loading') {
    console.log('DOM still loading, waiting...');
} else {
    console.log('DOM already ready, creating CubeDragger immediately...');
    window.cubeDragger = new CubeDragger();
}

while this setting drags a cube 

console.log("dragCube.js script loaded!");
console.log("TEST: This log should always appear for cube!");

if (typeof CubeDragger === 'undefined') {
  class CubeDragger {
    constructor() {
      this.draggedCube = null;
      this.offset = { x: 0, y: 0 };
      this.initializeDragging();
    }

    async initializeDragging() {
      const cubeScene = document.querySelector('.cube-scene');
      if (!cubeScene) {
        console.warn("No .cube-scene element found. Cube dragging will not be initialized.");
        return;
      }

      console.log(`Found cube scene:`, cubeScene);

      cubeScene.style.position = 'absolute';
      cubeScene.style.zIndex = '10'; // Default z-index for the cube

      // Restore position if saved
      try {
        if (window.electronAPI && typeof window.electronAPI.getItem === 'function') {
          const savedPos = await window.electronAPI.getItem('cube-scene-position');
          console.log(`Raw savedPos for cube:`, savedPos);

          if (savedPos) {
            const pos = typeof savedPos === 'string' ? JSON.parse(savedPos) : savedPos;
            cubeScene.style.left = pos.left;
            cubeScene.style.top = pos.top;
            cubeScene.style.right = 'auto';
            cubeScene.style.bottom = 'auto';
            cubeScene.style.margin = '0';
            cubeScene.style.transform = 'none';
            cubeScene.style.zIndex = '10'; // Ensure z-index is reset after restoration
            cubeScene.style.removeProperty('inset'); // Remove inset to avoid conflicts

            console.log(`Restored position for cube:`, pos);
          } else {
            console.log(`No saved position for cube, using default CSS position`);
          }
        } else {
          console.warn('window.electronAPI or getItem function not available. Cannot restore cube position.');
        }
      } catch (err) {
        console.warn(`Failed to restore cube position:`, err);
      }

      const boundStartDrag = this.startDrag.bind(this);
      cubeScene.addEventListener("mousedown", boundStartDrag);
      cubeScene.addEventListener("touchstart", boundStartDrag);
      console.log(`Event listeners attached to cube scene.`);
      // Keep click test for debugging if needed
      cubeScene.addEventListener("click", () => {
        console.log(`Click test for cube scene.`);
      });

      const boundDrag = this.drag.bind(this);
      const boundStopDrag = this.stopDrag.bind(this);

      document.addEventListener("mousemove", boundDrag);
      document.addEventListener("touchmove", boundDrag);
      document.addEventListener("mouseup", boundStopDrag);
      document.addEventListener("touchend", boundStopDrag);
    }

    startDrag(e) {
      console.log("startDrag function called for cube!");
      console.log("Event target:", e.target);
      console.log("Closest cube scene:", e.target.closest(".cube-scene"));

      this.draggedCube = e.target.closest('.cube-scene');
      if (!this.draggedCube) {
        console.log("No draggable cube scene found for event target.");
        return;
      }

      this.draggedCube.classList.add('dragging');
      this.draggedCube.style.zIndex = '1000'; // Bring to front when dragging
      document.body.classList.add('dragging-active'); // For visual debugging

      const rect = this.draggedCube.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);

      this.offset.x = clientX - rect.left;
      this.offset.y = clientY - rect.top;
    }

    drag(e) {
      if (!this.draggedCube) return;
      e.preventDefault(); // Prevent default touch/mouse behavior

      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);

      const newX = clientX - this.offset.x;
      const newY = clientY - this.offset.y;

      // Constrain cube within window boundaries
      const maxX = window.innerWidth - this.draggedCube.offsetWidth;
      const maxY = window.innerHeight - this.draggedCube.offsetHeight;

      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));

      this.draggedCube.style.left = `${constrainedX}px`;
      this.draggedCube.style.top = `${constrainedY}px`;
      this.draggedCube.style.right = 'auto';
      this.draggedCube.style.bottom = 'auto';
      this.draggedCube.style.transform = 'none'; // Ensure no transform conflicts
    }

    async stopDrag() {
      if (!this.draggedCube) return;

      const left = this.draggedCube.style.left;
      const top = this.draggedCube.style.top;

      this.draggedCube.style.zIndex = '10'; // Reset z-index after dragging

      if (window.electronAPI && typeof window.electronAPI.setItem === 'function') {
        try {
          // Save only position (left, top)
          await window.electronAPI.setItem('cube-scene-position', { left, top });
          console.log(`Saved position for cube:`, { left, top });
          // Debug: confirm saved position
          const saved = await window.electronAPI.getItem('cube-scene-position');
          console.log(`Retrieved back from store for cube:`, saved);
        } catch (err) {
          console.error(`Failed to save position for cube:`, err);
        }
      } else {
        console.warn('electronAPI.setItem not available. Cannot save cube position.');
      }

      this.draggedCube.classList.remove('dragging');
      document.body.classList.remove('dragging-active');
      this.draggedCube = null;
    }
  }

  window.CubeDragger = CubeDragger;
}

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOMContentLoaded event fired, initializing CubeDragger...");
  new CubeDragger();
});

this setting drags the cube and rotates it 


console.log("Combined dragCube.js script loaded!");
console.log("TEST: This log should always appear for cube!");

if (typeof CubeDragger === 'undefined') {
    class CubeDragger {
        constructor() {
            // For position dragging
            this.draggedCube = null;
            this.offset = { x: 0, y: 0 };
            this.isDragging = false;
            
            // For rotation
            this.centreCube = null;
            this.isRotating = false;
            this.startX = 0;
            this.startY = 0;
            this.rotationX = 0;
            this.rotationY = 0;
            
            this.initializeDragging();
        }

        async initializeDragging() {
            const cubeScene = document.querySelector('.cube-scene');
            this.centreCube = document.querySelector('.centreCube');
            
            if (!cubeScene) {
                console.warn("No .cube-scene element found. Cube dragging will not be initialized.");
                return;
            }
            
            if (!this.centreCube) {
                console.warn("No .centreCube element found. Cube rotation will not be initialized.");
                return;
            }

            console.log(`Found cube scene:`, cubeScene);
            console.log(`Found centre cube:`, this.centreCube);
            
            cubeScene.style.position = 'absolute';
            cubeScene.style.zIndex = '10'; // Default z-index for the cube
            
            // Restore position if saved
            try {
                if (window.electronAPI && typeof window.electronAPI.getItem === 'function') {
                    const savedPos = await window.electronAPI.getItem('cube-scene-position');
                    console.log(`Raw savedPos for cube:`, savedPos);
                    if (savedPos) {
                        const pos = typeof savedPos === 'string' ? JSON.parse(savedPos) : savedPos;
                        cubeScene.style.left = pos.left;
                        cubeScene.style.top = pos.top;
                        cubeScene.style.right = 'auto';
                        cubeScene.style.bottom = 'auto';
                        cubeScene.style.margin = '0';
                        cubeScene.style.zIndex = '10';
                        cubeScene.style.removeProperty('inset');
                        console.log(`Restored position for cube:`, pos);
                    } else {
                        console.log(`No saved position for cube, using default CSS position`);
                    }
                } else {
                    console.warn('window.electronAPI or getItem function not available. Cannot restore cube position.');
                }
            } catch (err) {
                console.warn(`Failed to restore cube position:`, err);
            }

            // Bind event handlers
            const boundStartInteraction = this.startInteraction.bind(this);
            const boundMove = this.move.bind(this);
            const boundStopInteraction = this.stopInteraction.bind(this);

            // Add event listeners to the cube scene for both drag and rotate
            cubeScene.addEventListener("mousedown", boundStartInteraction);
            cubeScene.addEventListener("touchstart", boundStartInteraction);
            
            // Global move and stop listeners
            document.addEventListener("mousemove", boundMove);
            document.addEventListener("touchmove", boundMove);
            document.addEventListener("mouseup", boundStopInteraction);
            document.addEventListener("touchend", boundStopInteraction);
            
            // Prevent context menu on cube
            this.centreCube.addEventListener('contextmenu', e => e.preventDefault());
            
            console.log(`Event listeners attached to cube scene.`);
        }

        startInteraction(e) {
            console.log("startInteraction function called for cube!");
            console.log("Event target:", e.target);
            
            const cubeScene = e.target.closest('.cube-scene');
            const centreCube = e.target.closest('.centreCube');
            
            if (!cubeScene) {
                console.log("No draggable cube scene found for event target.");
                return;
            }

            e.preventDefault();
            e.stopPropagation();
            
            // Determine if we're clicking on the center cube (for rotation) or elsewhere (for dragging)
            if (centreCube) {
                console.log('🟢 START ROTATE - Mouse down on center cube');
                this.startRotate(e, cubeScene);
            } else {
                console.log('🟢 START DRAG - Mouse down on cube scene');
                this.startDrag(e, cubeScene);
            }
        }

        startDrag(e, cubeScene) {
            this.isDragging = true;
            this.draggedCube = cubeScene;
            this.draggedCube.classList.add('dragging');
            this.draggedCube.style.zIndex = '1000'; // Bring to front when dragging
            document.body.classList.add('dragging-active');

            const rect = this.draggedCube.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
            const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);

            this.offset.x = clientX - rect.left;
            this.offset.y = clientY - rect.top;
        }

        startRotate(e, cubeScene) {
            this.isRotating = true;
            this.draggedCube = cubeScene; // Still need reference for z-index management
            
            const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
            const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
            
            this.startX = clientX;
            this.startY = clientY;
            
            // Disable CSS transitions immediately
            this.centreCube.style.transition = 'none';
            this.centreCube.style.cursor = 'grabbing';
            cubeScene.style.zIndex = '1000'; // Bring to front when rotating
            
            console.log('Starting position:', this.startX, this.startY);
            console.log('Current rotations:', this.rotationX, this.rotationY);
        }

        move(e) {
            if (!this.isDragging && !this.isRotating) return;
            
            e.preventDefault();
            
            if (this.isDragging) {
                this.drag(e);
            } else if (this.isRotating) {
                this.rotate(e);
            }
        }

        drag(e) {
            if (!this.draggedCube) return;
            
            const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
            const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
            
            const newX = clientX - this.offset.x;
            const newY = clientY - this.offset.y;
            
            // Constrain cube within window boundaries
            const maxX = window.innerWidth - this.draggedCube.offsetWidth;
            const maxY = window.innerHeight - this.draggedCube.offsetHeight;
            const constrainedX = Math.max(0, Math.min(newX, maxX));
            const constrainedY = Math.max(0, Math.min(newY, maxY));
            
            this.draggedCube.style.left = `${constrainedX}px`;
            this.draggedCube.style.top = `${constrainedY}px`;
            this.draggedCube.style.right = 'auto';
            this.draggedCube.style.bottom = 'auto';
            // Don't reset transform here as it might conflict with rotation
        }

        rotate(e) {
            if (!this.isRotating) return;
            
            console.log('🔄 ROTATING - Mouse move detected');
            
            const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
            const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
            
            const deltaX = clientX - this.startX;
            const deltaY = clientY - this.startY;
            
            // Update rotation values
            this.rotationY += deltaX * 0.5;
            this.rotationX -= deltaY * 0.5;
            
            // Apply the transform
            const transform = `rotateX(${this.rotationX}deg) rotateY(${this.rotationY}deg)`;
            this.centreCube.style.transform = transform;
            
            console.log('Delta:', deltaX, deltaY);
            console.log('New rotations:', this.rotationX, this.rotationY);
            console.log('Applied transform:', transform);
            
            // Update start position for next move
            this.startX = clientX;
            this.startY = clientY;
        }

        async stopInteraction() {
            if (!this.isDragging && !this.isRotating) return;
            
            if (this.isDragging) {
                console.log('🔴 STOP DRAG - Mouse up detected');
                await this.stopDrag();
            }
            
            if (this.isRotating) {
                console.log('🔴 STOP ROTATE - Mouse up detected');
                this.stopRotate();
            }
        }

        async stopDrag() {
            if (!this.draggedCube) return;
            
            const left = this.draggedCube.style.left;
            const top = this.draggedCube.style.top;
            
            this.draggedCube.style.zIndex = '10'; // Reset z-index after dragging
            
            if (window.electronAPI && typeof window.electronAPI.setItem === 'function') {
                try {
                    // Save only position (left, top)
                    await window.electronAPI.setItem('cube-scene-position', { left, top });
                    console.log(`Saved position for cube:`, { left, top });
                    
                    // Debug: confirm saved position
                    const saved = await window.electronAPI.getItem('cube-scene-position');
                    console.log(`Retrieved back from store for cube:`, saved);
                } catch (err) {
                    console.error(`Failed to save position for cube:`, err);
                }
            } else {
                console.warn('electronAPI.setItem not available. Cannot save cube position.');
            }
            
            this.draggedCube.classList.remove('dragging');
            document.body.classList.remove('dragging-active');
            this.isDragging = false;
            this.draggedCube = null;
        }

        stopRotate() {
            if (!this.isRotating) return;
            
            this.isRotating = false;
            this.centreCube.style.cursor = 'grab';
            this.centreCube.style.transition = '';
            
            if (this.draggedCube) {
                this.draggedCube.style.zIndex = '10'; // Reset z-index after rotating
                this.draggedCube = null;
            }
            
            console.log('Final rotations:', this.rotationX, this.rotationY);
        }
    }

    window.CubeDragger = CubeDragger;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired, initializing CubeDragger...");
    new CubeDragger();
});

// Also try immediate initialization in case DOM is already loaded
if (document.readyState === 'loading') {
    console.log('DOM still loading, waiting...');
} else {
    console.log('DOM already ready, creating CubeDragger immediately...');
    new CubeDragger();
}


added a button manager so the centre cube faces can be controlled 
console.log("Independent Panel System loaded!");
if (typeof PanelManager === 'undefined') {
class PanelManager {
constructor() {
this.draggedPanel = null;
this.panelOffset = { x: 0, y: 0 };
this.isPanelDragging = false;
this.initializePanels();
}
initializePanels() {
// Create Panel 4 (AI)
this.createPanel('screen-4', 'AI Panel', 100, 100);
// Create Panel 4a (Buttons)
this.createPanel('screen-4a', 'Button Controls', 450, 100);
// Add global panel dragging listeners
document.addEventListener("mousemove", this.handlePanelMove.bind(this));
document.addEventListener("mouseup", this.stopPanelDrag.bind(this));
document.addEventListener("touchmove", this.handlePanelMove.bind(this));
document.addEventListener("touchend", this.stopPanelDrag.bind(this));
}
createPanel(id, title, left, top) {
// Check if panel already exists
if (document.getElementById(id)) {
this.addPanelListeners(document.getElementById(id));
return;
}
const panel = document.createElement('div');
panel.id = id;
panel.className = 'panel';
panel.style.cssText = `
                position: absolute;
                left: ${left}px;
                top: ${top}px;
                width: 200px;
                height: 200px;
                background: transparent;
                border: 1.5px solid rgba(255, 255, 255, 0.2);
                border-radius: 14px;
                padding: 15px;
                color: #ffffff;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);
                user-select: none;
                transition: box-shadow 0.2s ease;
                z-index: 10;
                cursor: grab;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: center;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
`;
// Add title
const titleElement = document.createElement('h3');
titleElement.textContent = title;
titleElement.style.cssText = `
                margin: 0 0 20px 0;
                color: #ffffff;
                font-size: 16px;
                font-weight: 500;
                text-align: center;
                pointer-events: none;
`;
panel.appendChild(titleElement);
// Add content based on panel type
if (id === 'screen-4a') {
this.addButtonControls(panel);
} else if (id === 'screen-4') {
this.addAIContent(panel);
}
document.body.appendChild(panel);
this.addPanelListeners(panel);
console.log(`Created independent panel: ${id}`);
}
addButtonControls(panel) {
const controlsContainer = document.createElement('div');
controlsContainer.className = 'control-panel';
controlsContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 12px;
                width: 100%;
                height: 100%;
                pointer-events: none;
`;
// Screen Selector
const screenSelector = document.createElement('div');
screenSelector.className = 'screen-selector';
screenSelector.style.cssText = `
                display: flex;
                gap: 8px;
                justify-content: center;
                align-items: center;
                padding: 8px;
                pointer-events: auto;
`;
const label = document.createElement('label');
label.textContent = 'Screen:';
label.style.cssText = `
                font-size: 12px;
                color: #f0f0f0;
                margin-right: 8px;
                font-weight: 500;
`;
screenSelector.appendChild(label);
// Screen buttons
            ['centre', '1', '2', '3'].forEach((screen, index) => {
const btn = this.createGlassyButton(screen, 'screen-btn', screen === 'centre');
if (index === 0) btn.classList.add('active'); // Default to "centre"
btn.dataset.screen = screen === 'centre' ? 'center' : screen;
screenSelector.appendChild(btn);
});
// Rotation Controls
const rotationControls = document.createElement('div');
rotationControls.className = 'rotation-controls';
rotationControls.style.cssText = `
                display: flex;
                gap: 8px;
                justify-content: center;
                align-items: center;
                padding: 8px;
                flex-wrap: wrap;
                pointer-events: auto;
`;
// Direction buttons
const directions = [
{ text: '← Left', dir: 'left' },
{ text: 'Right →', dir: 'right' },
{ text: '↑ Up', dir: 'up' },
{ text: 'Down ↓', dir: 'down' }
            ];
directions.forEach(({ text, dir }) => {
const btn = this.createGlassyButton(text, 'rotate-btn');
btn.dataset.direction = dir;
rotationControls.appendChild(btn);
});
// Action Controls
const actionControls = document.createElement('div');
actionControls.className = 'action-controls';
actionControls.style.cssText = `
                display: flex;
                gap: 8px;
                justify-content: center;
                align-items: center;
                padding: 8px;
                pointer-events: auto;
`;
const applyBtn = this.createGlassyButton('Apply', 'action-btn');
applyBtn.id = 'apply-btn';
applyBtn.style.background = 'linear-gradient(145deg, rgba(0, 255, 136, 0.15), rgba(0, 255, 136, 0.05))';
applyBtn.style.color = '#00ff88';
applyBtn.style.borderColor = 'rgba(0, 255, 136, 0.3)';
const resetBtn = this.createGlassyButton('Reset', 'action-btn');
resetBtn.id = 'reset-btn';
resetBtn.style.background = 'linear-gradient(145deg, rgba(255, 100, 100, 0.15), rgba(255, 100, 100, 0.05))';
resetBtn.style.color = '#ff6464';
resetBtn.style.borderColor = 'rgba(255, 100, 100, 0.3)';
actionControls.appendChild(applyBtn);
actionControls.appendChild(resetBtn);
// Append all sections
controlsContainer.appendChild(screenSelector);
controlsContainer.appendChild(rotationControls);
controlsContainer.appendChild(actionControls);
panel.appendChild(controlsContainer);
this.addButtonListeners(panel);
}
createGlassyButton(text, className, isCenterButton = false) {
const btn = document.createElement('button');
btn.textContent = text;
btn.className = `glassy-btn ${className}`;
btn.style.cssText = `
                padding: ${className === 'screen-btn' ? '6px 12px' : '12px 16px'};
                background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.25);
                color: #e8f0f0;
                font-weight: 500;
                font-size: ${className === 'screen-btn' ? '12px' : '14px'};
                cursor: pointer;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.25), -6px -6px 12px rgba(255, 255, 255, 0.05), inset 1px 1px 2px rgba(255, 255, 255, 0.1);
                transition: all 0.2s ease;
                text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
                min-width: ${className === 'screen-btn' ? (isCenterButton ? '42px' : '32px') : '70px'};
                pointer-events: auto;
`;
// Add hover and active effects
btn.addEventListener('mouseenter', () => {
btn.style.transform = 'translateY(-2px)';
btn.style.boxShadow = '8px 8px 16px rgba(0, 0, 0, 0.3), -4px -4px 8px rgba(255, 255, 255, 0.08)';
});
btn.addEventListener('mouseleave', () => {
btn.style.transform = 'translateY(0)';
btn.style.boxShadow = '6px 6px 12px rgba(0, 0, 0, 0.25), -6px -6px 12px rgba(255, 255, 255, 0.05), inset 1px 1px 2px rgba(255, 255, 255, 0.1)';
});
btn.addEventListener('mousedown', () => {
btn.style.transform = 'translateY(0)';
btn.style.boxShadow = 'inset 4px 4px 6px rgba(0, 0, 0, 0.25), inset -2px -2px 6px rgba(255, 255, 255, 0.1)';
});
btn.addEventListener('mouseup', () => {
btn.style.boxShadow = '6px 6px 12px rgba(0, 0, 0, 0.25), -6px -6px 12px rgba(255, 255, 255, 0.05), inset 1px 1px 2px rgba(255, 255, 255, 0.1)';
});
return btn;
}
addAIContent(panel) {
const aiContainer = document.createElement('div');
aiContainer.className = 'ai-interface';
aiContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 15px;
                width: 100%;
                height: 100%;
                pointer-events: none;
`;
// AI Status
const statusDiv = document.createElement('div');
statusDiv.className = 'ai-status';
statusDiv.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px;
                background: rgba(0, 255, 136, 0.1);
                border-radius: 8px;
                border: 1px solid rgba(0, 255, 136, 0.2);
`;
const indicator = document.createElement('div');
indicator.className = 'status-indicator';
indicator.style.cssText = `
                width: 8px;
                height: 8px;
                background: #00ff88;
                border-radius: 50%;
                animation: pulse 2s infinite;
`;
const statusText = document.createElement('span');
statusText.textContent = 'AI Ready';
statusText.style.cssText = `
                color: #00ff88;
                font-size: 12px;
                font-weight: 500;
`;
statusDiv.appendChild(indicator);
statusDiv.appendChild(statusText);
// Chat area
const chatDiv = document.createElement('div');
chatDiv.className = 'ai-chat';
chatDiv.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 10px;
                flex: 1;
                pointer-events: auto;
`;
const messagesDiv = document.createElement('div');
messagesDiv.className = 'chat-messages';
messagesDiv.style.cssText = `
                flex: 1;
                padding: 10px;
                background: rgba(255, 255, 255, 0.02);
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                overflow-y: auto;
                max-height: 150px;
`;
const welcomeMsg = document.createElement('div');
welcomeMsg.className = 'message ai-message';
welcomeMsg.textContent = 'Hello! I\'m ready to help with your cube controls.';
welcomeMsg.style.cssText = `
                padding: 8px;
                background: rgba(0, 255, 247, 0.1);
                border-radius: 6px;
                font-size: 12px;
                color: #00fff7;
`;
messagesDiv.appendChild(welcomeMsg);
// Input area
const inputDiv = document.createElement('div');
inputDiv.className = 'chat-input';
inputDiv.style.cssText = `
                display: flex;
                gap: 8px;
`;
const input = document.createElement('input');
input.type = 'text';
input.placeholder = 'Ask me anything...';
input.style.cssText = `
                flex: 1;
                padding: 8px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                color: #ffffff;
                font-size: 12px;
`;
const sendBtn = this.createGlassyButton('Send', 'send-btn');
sendBtn.style.padding = '8px 12px';
sendBtn.style.fontSize = '12px';
inputDiv.appendChild(input);
inputDiv.appendChild(sendBtn);
chatDiv.appendChild(messagesDiv);
chatDiv.appendChild(inputDiv);
aiContainer.appendChild(statusDiv);
aiContainer.appendChild(chatDiv);
panel.appendChild(aiContainer);
// Add pulse animation
const style = document.createElement('style');
style.textContent = `
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
`;
document.head.appendChild(style);
}
addButtonListeners(panel) {
// Initialize cube connection
this.selectedCube = 'center'; // Only center cube for now
this.currentRotation = { x: 0, y: 0 };
// Rotation buttons
panel.querySelectorAll('.rotate-btn').forEach(btn => {
btn.addEventListener('click', (e) => {
e.stopPropagation();
const direction = btn.dataset.direction;
this.rotateCubeFace(direction);
});
});
// Screen selection buttons
panel.querySelectorAll('.screen-btn').forEach(btn => {
btn.addEventListener('click', (e) => {
e.stopPropagation();
const screen = btn.dataset.screen;
// Only allow center for now
if (screen !== 'center') {
console.log(`Screen ${screen} not available yet - only center cube exists`);
return;
}
// Remove active class from all screen buttons
panel.querySelectorAll('.screen-btn').forEach(b => b.classList.remove('active'));
// Add active class to clicked button
btn.classList.add('active');
// Update active button styling
panel.querySelectorAll('.screen-btn').forEach(b => {
if (b.classList.contains('active')) {
b.style.background = 'linear-gradient(145deg, rgba(0, 255, 247, 0.15), rgba(0, 255, 247, 0.08))';
b.style.color = '#00fff7';
b.style.borderColor = 'rgba(0, 255, 247, 0.2)';
} else {
b.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))';
b.style.color = '#e8f0f0';
b.style.borderColor = 'rgba(255, 255, 255, 0.25)';
}
});
this.selectedCube = screen;
console.log(`Selected cube: ${screen}`);
});
});
// Action buttons
const applyBtn = panel.querySelector('#apply-btn');
const resetBtn = panel.querySelector('#reset-btn');
if (applyBtn) {
applyBtn.addEventListener('click', (e) => {
e.stopPropagation();
this.applyCubeState();
});
}
if (resetBtn) {
resetBtn.addEventListener('click', (e) => {
e.stopPropagation();
this.resetCube();
});
}
// Set default to center
const centerBtn = panel.querySelector('[data-screen="center"]');
if (centerBtn) {
centerBtn.click();
}
}
rotateCubeFace(direction) {
// Find the cube element
const cube = document.querySelector('.centreCube');
if (!cube) {
console.warn('No .centreCube found - make sure your cube is loaded');
return;
}
const rotationAmount = 90; // degrees
// Update rotation values
switch(direction) {
case 'left':
this.currentRotation.y -= rotationAmount;
console.log(`🔄 Rotating LEFT - showing different face`);
break;
case 'right':
this.currentRotation.y += rotationAmount;
console.log(`🔄 Rotating RIGHT - showing different face`);
break;
case 'up':
this.currentRotation.x -= rotationAmount;
console.log(`🔄 Rotating UP - showing different face`);
break;
case 'down':
this.currentRotation.x += rotationAmount;
console.log(`🔄 Rotating DOWN - showing different face`);
break;
}
// Apply the rotation with smooth animation
const transform = `rotateX(${this.currentRotation.x}deg) rotateY(${this.currentRotation.y}deg)`;
cube.style.transform = transform;
cube.style.transition = 'transform 0.5s ease';
// Log which face is now showing
const faceInfo = this.getCurrentFace();
console.log(`📱 Current face: ${faceInfo.name} (${faceInfo.topic})`);
}
getCurrentFace() {
// Calculate which face is showing based on rotation
const x = ((this.currentRotation.x % 360) + 360) % 360;
const y = ((this.currentRotation.y % 360) + 360) % 360;
// Map rotations to faces and topics
const faces = {
'0,0': { name: 'Front', topic: 'Dashboard/Home' },
'0,90': { name: 'Right', topic: 'News Feed' },
'0,180': { name: 'Back', topic: 'Bitcoin/Crypto' },
'0,270': { name: 'Left', topic: 'Blog Posts' },
'90,0': { name: 'Top', topic: 'Weather' },
'270,0': { name: 'Bottom', topic: 'Social Media' }
};
const key = `${x},${y}`;
return faces[key] || { name: 'Unknown', topic: 'Mixed View' };
}
applyCubeState() {
console.log(`✅ Applied cube state - Face: ${this.getCurrentFace().name}, Topic: ${this.getCurrentFace().topic}`);
// Here you could save the current state, load content for the current face, etc.
}
resetCube() {
const cube = document.querySelector('.centreCube');
if (!cube) return;
this.currentRotation = { x: 0, y: 0 };
cube.style.transform = 'rotateX(0deg) rotateY(0deg)';
cube.style.transition = 'transform 0.5s ease';
console.log(`🔄 Cube reset to Front face (Dashboard/Home)`);
}
addPanelListeners(panel) {
panel.addEventListener("mousedown", this.startPanelDrag.bind(this));
panel.addEventListener("touchstart", this.startPanelDrag.bind(this));
}
startPanelDrag(e) {
const panel = e.target.closest('.panel');
if (!panel) return;
// Don't drag if clicking on interactive elements
if (e.target.matches('button, input, .status-indicator') || 
e.target.closest('button, input, .chat-input, .rotation-controls, .action-controls, .screen-selector')) {
return;
}
console.log('Starting panel drag:', panel.id);
e.preventDefault();
e.stopPropagation();
this.isPanelDragging = true;
this.draggedPanel = panel;
panel.style.cursor = 'grabbing';
panel.style.zIndex = '1000';
const rect = panel.getBoundingClientRect();
const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
this.panelOffset.x = clientX - rect.left;
this.panelOffset.y = clientY - rect.top;
}
handlePanelMove(e) {
if (!this.isPanelDragging || !this.draggedPanel) return;
e.preventDefault();
const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
const newX = clientX - this.panelOffset.x;
const newY = clientY - this.panelOffset.y;
// Constrain within window
const maxX = window.innerWidth - this.draggedPanel.offsetWidth;
const maxY = window.innerHeight - this.draggedPanel.offsetHeight;
const constrainedX = Math.max(0, Math.min(newX, maxX));
const constrainedY = Math.max(0, Math.min(newY, maxY));
this.draggedPanel.style.left = `${constrainedX}px`;
this.draggedPanel.style.top = `${constrainedY}px`;
}
stopPanelDrag() {
if (!this.isPanelDragging || !this.draggedPanel) return;
console.log('Stopping panel drag');
this.draggedPanel.style.cursor = 'grab';
this.draggedPanel.style.zIndex = '10';
this.draggedPanel = null;
this.isPanelDragging = false;
}
}
window.PanelManager = PanelManager;
}
document.addEventListener('DOMContentLoaded', () => {
console.log("DOMContentLoaded event fired, initializing PanelManager...");
new PanelManager();
});
// Also try immediate initialization in case DOM is already loaded
if (document.readyState === 'loading') {
console.log('DOM still loading, waiting...');
} else {
console.log('DOM already ready, creating PanelManager immediately...');
new PanelManager();
}

