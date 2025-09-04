// Independent Panel System for MCP Layout
// Manages draggable panels, button controls, and AI interactions
console.log("Independent Panel System loaded!");

if (typeof PanelManager === 'undefined') {
    class PanelManager {
        constructor() {
            // Properties for panel dragging
            this.draggedPanel = null;
            this.panelOffset = { x: 0, y: 0 };
            this.isPanelDragging = false;
            
            // Properties for cube selection and rotation
            this.selectedCube = 'center';
            this.currentRotation = { x: 0, y: 0 };
            
            // Initialize the panel system
            this.init();
        }
        
        // Main initialization method
        init() {
            // Prevent multiple initializations
            if (window.panelManagerInitialized) return;
            window.panelManagerInitialized = true;

            // Set up global event listeners for dragging
            this.addGlobalListeners();
            
            // Create the AI Panel (Panel 4)
            this.createPanel('screen-4', 'AI Panel', 100, 100, this.createAIContent.bind(this));
            
            // Create the Button Controls Panel
            this.createPanel('screen-4a', 'Button Controls', 350, 100, this.createButtonControls.bind(this));
        }
        
        // Add listeners for mouse/touch events to handle panel dragging globally
        addGlobalListeners() {
            ['mousemove', 'mouseup', 'touchmove', 'touchend'].forEach(event => {
                document.addEventListener(event, event.includes('move') ?
                    this.handlePanelMove.bind(this) : this.stopPanelDrag.bind(this));
            });
        }
        
        // Asynchronously create a panel with saved position
        async createPanel(id, title, defaultLeft, defaultTop, contentFn) {
            let panel = document.getElementById(id);
            if (panel) {
                // If panel exists but not initialized, add listeners
                if (!panel.dataset.initialized) {
                    this.addPanelListeners(panel);
                    panel.dataset.initialized = 'true';
                }
                return;
            }

            // Create the panel element
            panel = Object.assign(document.createElement('div'), {
                id,
                className: 'panel',
                innerHTML: `<h3 style="margin:0 0 20px 0;color:#fff;font-size:16px;text-align:center;pointer-events:none">${title}</h3>`
            });

            // Hide panel initially for fade-in effect
            panel.style.visibility = 'hidden';
            panel.style.opacity = 0;

            // Get saved position from storage or use defaults
            const savedPos = await window.electronAPI.getItem(`${id}-position`);
            const left = savedPos ? savedPos.left : `${defaultLeft}px`;
            const top = savedPos ? savedPos.top : `${defaultTop}px`;

            // Apply panel styles (glassy, draggable)
            panel.style.cssText += `position:absolute;left:${left};top:${top};width:200px;height:220px;` +
                `background:transparent;border:none;border-radius:14px;padding:15px;color:#fff;` +
                `box-shadow:0 4px 10px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.05);` +
                `user-select:none;transition:box-shadow 0.2s ease, opacity 0.3s ease-in-out;z-index:2000;cursor:grab;` +
                `display:flex;flex-direction:column;justify-content:flex-start;align-items:center;` +
                `backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)`;

            // Call the content function to populate the panel
            contentFn(panel);
            document.body.appendChild(panel);
            this.addPanelListeners(panel);
            panel.dataset.initialized = 'true';
            console.log(`Created panel: ${id}`);

            // Fade in the panel
            requestAnimationFrame(() => {
                panel.style.visibility = 'visible';
                panel.style.opacity = 1;
            });
        }
        
        // Create a styled button with hover effects
        createButton(text, className, special = false) {
            const btn = Object.assign(document.createElement('button'), {
                textContent: text,
                className: `glassy-btn ${className}`
            });

            // Base styles for glassy button
            const baseStyle = `padding:8px 12px;background:linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02));
                border-radius:12px;border:1px solid rgba(255,255,255,0.25);color:#e8f0f0;font-weight:500;
                font-size:12px;cursor:pointer;backdrop-filter:blur(8px);transition:all 0.2s ease;
                box-shadow:6px 6px 12px rgba(0,0,0,0.25),-6px -6px 12px rgba(255,255,255,0.05);
                pointer-events:auto;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center`;

            btn.style.cssText = baseStyle + (special ? special : '');

            // Add hover/press effects
            ['mouseenter', 'mouseleave', 'mousedown', 'mouseup'].forEach((event, i) => {
                btn.addEventListener(event, () => {
                    const transforms = ['translateY(-2px)', 'translateY(0)', 'translateY(0)', 'translateY(0)'];
                    const shadows = [
                        '8px 8px 16px rgba(0,0,0,0.3),-4px -4px 8px rgba(255,255,255,0.08)',
                        baseStyle.match(/box-shadow:[^;]+/)[0].replace('box-shadow:', ''),
                        'inset 4px 4px 6px rgba(0,0,0,0.25),inset -2px -2px 6px rgba(255,255,255,0.1)',
                        baseStyle.match(/box-shadow:[^;]+/)[0].replace('box-shadow:', '')
                    ];
                    btn.style.transform = transforms[i];
                    btn.style.boxShadow = shadows[i];
                });
            });
            return btn;
        }
        
        // Populate the Button Controls panel with screen/rotation/action buttons
        createButtonControls(panel) {
            const container = Object.assign(document.createElement('div'), {
                innerHTML: `
                    <div class="screen-selector" style="display:flex;gap:8px;justify-content:center;align-items:center;padding:4px;pointer-events:auto;position:relative;"></div>
                    <div class="rotation-controls" style="display:flex;gap:8px;justify-content:center;padding:4px;flex-wrap:wrap;pointer-events:auto"></div>
                    <div class="action-controls" style="display:flex;gap:8px;justify-content:center;padding:4px;pointer-events:auto"></div>`
            });
            
            // Screen selection buttons
            const screenSelector = container.querySelector('.screen-selector');
            const screenLabel = Object.assign(document.createElement('div'), {
                textContent: 'Screen',
                style: 'font-size:14px;color:#f0f0f0;font-weight:500;position:absolute;top:-20px;left:8px'
            });
            screenSelector.appendChild(screenLabel);

            ['1', '2', 'centre'].forEach((screen, i) => {
                const btn = this.createButton(screen, 'screen-btn');
                btn.dataset.screen = screen;
                if (i === 0) btn.classList.add('active');
                screenSelector.appendChild(btn);
            });

            // Rotation control buttons
            const rotationControls = container.querySelector('.rotation-controls');
            [['← Left', 'left'], ['Right →', 'right'], ['↑ Up', 'up'], ['Down ↓', 'down']].forEach(([text, dir]) => {
                const btn = this.createButton(text, 'rotate-btn');
                btn.dataset.direction = dir;
                rotationControls.appendChild(btn);
            });

            // Action buttons (Apply and Reset)
            const actionControls = container.querySelector('.action-controls');
            const applyBtn = this.createButton('Apply', 'action-btn', 'background:linear-gradient(145deg,rgba(0,255,136,0.15),rgba(0,255,136,0.05));color:#00ff88;border-color:rgba(0,255,136,0.3)');
            const resetBtn = this.createButton('Reset', 'action-btn', 'background:linear-gradient(145deg,rgba(255,100,100,0.15),rgba(255,100,100,0.05));color:#ff6464;border-color:rgba(255,100,100,0.3)');
            applyBtn.id = 'apply-btn';
            resetBtn.id = 'reset-btn';
            actionControls.append(applyBtn, resetBtn);

            panel.appendChild(container);
            this.addButtonListeners(panel);
        }
        
        // Populate the AI Panel with status, input, and Send button
        // Updated: Bigger status area with Send button inside for compact layout
        createAIContent(panel) {
            try {
                panel.innerHTML += `
                    <div class="ai-interface" style="display:flex;flex-direction:column;gap:15px;width:100%;height:100%;pointer-events:auto">
                        <!-- Status area with bigger gaps -->
                        <div style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:30px;background:rgba(0,255,136,0.1);border-radius:8px;border:1px solid rgba(0,255,136,0.2);flex:1;justify-content:center;text-align:center;margin:20px 0;">
                            <!-- Pulsing indicator -->
                            <div style="width:12px;height:12px;background:#00ff88;border-radius:50%;animation:pulse 2s infinite"></div>
                            <!-- Larger status text with Georgia font -->
                            <span style="color:#3CB371;font-size:16px;font-weight:500;font-family:'Georgia', serif;margin:15px 0;">AI</span>
                            <!-- Wider Send button -->
                            <button id="ai-send-btn" class="glassy-btn send-btn" style="padding:10px 30px;background:linear-gradient(145deg,rgba(0,153,255,0.15),rgba(0,153,255,0.05));border-radius:12px;border:1px solid rgba(0,153,255,0.3);color:#66b3ff;font-weight:500;font-size:14px;cursor:pointer;backdrop-filter:blur(8px);transition:all 0.2s ease;box-shadow:6px 6px 12px rgba(0,0,0,0.25),-6px -6px 12px rgba(255,255,255,0.05);pointer-events:auto;">Send</button>
                        </div>
                    </div>`;
                
                // Bind click handler to the Send button
                const sendBtn = panel.querySelector('#ai-send-btn');
                if (sendBtn) {
                    sendBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        console.log('AI Send clicked in panel', panel.id);
                        // Open AI Companion and send default message
                        const text = 'Hello';
                        if (window.electronAPI?.openAICompanion) {
                            const p = window.electronAPI.openAICompanion(text);
                            if (p && typeof p.then === 'function') {
                                p.then(res => console.log('openAICompanion resolve (direct):', res)).catch(err => console.error('openAICompanion error (direct):', err));
                            }
                        }
                        if (window.electronAPI?.aiSend) {
                            window.electronAPI.aiSend(text);
                        }
                    });
                }
                
                // Add pulse animation styles if not already present
                if (!document.querySelector('style[data-pulse]')) {
                    const style = Object.assign(document.createElement('style'), {
                        textContent: '@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}'
                    });
                    style.dataset.pulse = 'true';
                    document.head.appendChild(style);
                }
            } catch (error) {
                console.error('Error in createAIContent:', error);
            }
        }
        
        // Handle button clicks in panels (e.g., rotation, screen selection, AI send)
        addButtonListeners(panel) {
            panel.addEventListener('click', e => {
                const btn = e.target.closest('button');
                if (!btn) return;
                e.stopPropagation();

                console.log('Before click handling - Panel display:', panel.style.display, 'visibility:', panel.style.visibility);

                // Handle rotation buttons
                if (btn.classList.contains('rotate-btn')) {
                    console.log(`Rotate button clicked. Direction: ${btn.dataset.direction}, Selected Cube: ${this.selectedCube}`);
                    this.rotateCube(btn.dataset.direction);
                } 
                // Handle screen selection buttons
                else if (btn.classList.contains('screen-btn')) {
                    panel.querySelectorAll('.screen-btn').forEach(b => {
                        b.classList.toggle('active', b === btn);
                        b.style.cssText += b === btn ?
                            'background:linear-gradient(145deg,rgba(0,255,247,0.15),rgba(0,255,247,0.08));color:#00fff7;border-color:rgba(0,255,247,0.2)' :
                            'background:linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02));color:#e8f0f0;border-color:rgba(255,255,255,0.25)';
                    });
                    const screen = btn.dataset.screen;

                    if (screen === '1') {
                        this.selectedCube = 'cube-1';
                    } else if (screen === '2') {
                        this.selectedCube = 'cube-2';
                    } else if (screen === 'centre') {
                        console.log("'centre' screen button clicked. Functionality disabled for now.");
                    }
                    console.log(`Selected cube: ${this.selectedCube}`);
                } 
                // Handle Apply button
                else if (btn.id === 'apply-btn') {
                    const dragger = window.cubeDraggers[this.selectedCube];
                    if (dragger) {
                        dragger.setCubeRotation(this.currentRotation.x, this.currentRotation.y, 'transform 0.5s ease');
                        console.log(`✅ Applied cube state - Face: ${this.getCurrentFace().name}`);
                    } else {
                        console.warn(`CubeDragger instance not found for #${this.selectedCube}`);
                    }
                } 
                // Handle Reset button
                else if (btn.id === 'reset-btn') {
                    this.resetCube();
                } 
                // Handle AI Send button (fallback)
                else if (btn.id === 'ai-send-btn') {
                    console.log('AI Send clicked in panel', panel.id);
                    const inputEl = panel.querySelector('#ai-input') || panel.querySelector('input[type="text"]');
                    const text = inputEl ? inputEl.value.trim() : '';
                    if (window.electronAPI?.openAICompanion) {
                        const p = window.electronAPI.openAICompanion(text);
                        if (p && typeof p.then === 'function') {
                            p.then(res => console.log('openAICompanion resolve:', res)).catch(err => console.error('openAICompanion error:', err));
                        }
                    } else {
                        console.warn('electronAPI.openAICompanion not available');
                    }
                }
                
                console.log('After click handling - Panel display:', panel.style.display, 'visibility:', panel.style.visibility);
            });
        }
        
        // Rotate the selected cube based on direction
        rotateCube(direction) {
            console.log(`rotateCube called. Selected Cube: ${this.selectedCube}`);
            console.log("window.cubeDraggers:", window.cubeDraggers);

            const dragger = window.cubeDraggers[this.selectedCube];
            if (!dragger) {
                return console.warn(`CubeDragger instance not found for #${this.selectedCube}`);
            }

            // Define rotation deltas for each direction
            const rotations = { left: [0, -90], right: [0, 90], up: [-90, 0], down: [90, 0] };
            const [deltaX, deltaY] = rotations[direction];

            // Update current rotation
            this.currentRotation.x += deltaX;
            this.currentRotation.y += deltaY;

            // Apply rotation to the cube
            dragger.setCubeRotation(this.currentRotation.x, this.currentRotation.y, 'transform 0.5s ease');

            console.log(`🔄 Current face: ${this.getCurrentFace().name} (${this.getCurrentFace().topic})`);
        }

        // Get the current face of the cube based on rotation
        getCurrentFace() {
            const x = ((this.currentRotation.x % 360) + 360) % 360;
            const y = ((this.currentRotation.y % 360) + 360) % 360;
            const faces = {
                '0,0': { name: 'F', topic: 'Dashboard/Home' },
                '0,90': { name: 'R', topic: 'News Feed' },
                '0,180': { name: 'B', topic: 'Bitcoin/Crypto' },
                '0,270': { name: 'L', topic: 'Blog Posts' },
                '90,0': { name: 'T', topic: 'Weather' },
                '270,0': { name: 'B', topic: 'Social Media' }
            };
            return faces[`${x},${y}`] || { name: 'Unknown', topic: 'Mixed View' };
        }
        
        // Reset the cube to front face
        resetCube() {
            const dragger = window.cubeDraggers[this.selectedCube];
            if (!dragger) {
                return console.warn(`CubeDragger instance not found for #${this.selectedCube}`);
            }

            this.currentRotation = { x: 0, y: 0 };
            dragger.setCubeRotation(0, 0, 'transform 0.5s ease');
            console.log('🔄 Cube reset to Front face');
        }
        
        // Add event listeners for panel dragging
        addPanelListeners(panel) {
            ['mousedown', 'touchstart'].forEach(event =>
                panel.addEventListener(event, this.startPanelDrag.bind(this)));
            // Fallback click handler for AI send
            panel.addEventListener('click', (ev) => {
                const t = ev.target;
                if (t && t.id === 'ai-send-btn') {
                    console.log('AI Send (delegated) clicked in panel', panel.id);
                    const inputEl = panel.querySelector('#ai-input') || panel.querySelector('input[type="text"]');
                    const text = inputEl ? inputEl.value.trim() : '';
                    if (window.electronAPI?.openAICompanion) {
                        window.electronAPI.openAICompanion(text);
                    }
                }
            });
        }
        
        // Start dragging a panel
        startPanelDrag(e) {
            const panel = e.target.closest('.panel');
            console.log('startPanelDrag called. Panel found:', panel);
            if (!panel) return;
            // Prevent dragging on interactive elements
            if (e.target.matches('button, input') || e.target.closest('button, input, .chat-input, .rotation-controls, .action-controls, .screen-selector')) return;
            e.preventDefault();
            e.stopPropagation();
            this.isPanelDragging = true;
            this.draggedPanel = panel;
            panel.style.cursor = 'grabbing';
            panel.style.zIndex = 1000;
            const rect = panel.getBoundingClientRect();
            const clientX = e.clientX || e.touches?.[0]?.clientX;
            const clientY = e.clientY || e.touches?.[0]?.clientY;
            this.panelOffset = { x: clientX - rect.left, y: clientY - rect.top };
        }
        
        // Handle panel movement during drag
        handlePanelMove(e) {
            if (!this.isPanelDragging || !this.draggedPanel) return;
            e.preventDefault();
            const clientX = e.clientX || e.touches?.[0]?.clientX;
            const clientY = e.clientY || e.touches?.[0]?.clientY;
            const newX = Math.max(0, Math.min(clientX - this.panelOffset.x, window.innerWidth - this.draggedPanel.offsetWidth));
            const newY = Math.max(0, Math.min(clientY - this.panelOffset.y, window.innerHeight - this.draggedPanel.offsetHeight));
            this.draggedPanel.style.left = `${newX}px`;
            this.draggedPanel.style.top = `${newY}px`;
        }
        
        // Stop dragging and save panel position
        async stopPanelDrag() {
            if (!this.isPanelDragging || !this.draggedPanel) return;

            const panel = this.draggedPanel;
            panel.style.cursor = 'grab';
            panel.style.zIndex = 10;

            const position = { left: panel.style.left, top: panel.style.top };

            try {
                await window.electronAPI.setItem(`${panel.id}-position`, position);
                console.log(`Saved position for panel ${panel.id}:`, position);
            } catch (err) {
                console.error(`Failed to save position for panel ${panel.id}:`, err);
            }

            this.draggedPanel = null;
            this.isPanelDragging = false;
        }
    }
    window.PanelManager = PanelManager;
}

// Initialize the PanelManager when DOM is ready
const init = () => new PanelManager();
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();

// Add these variables and functions for button wiring
let voiceEnabled = JSON.parse(localStorage.getItem('ai_voice_enabled') || 'true');
let preferredVoice = localStorage.getItem('ai_voice_name') || '';
let preferredRate = parseFloat(localStorage.getItem('ai_voice_rate') || '1.0');

if (!isFinite(preferredRate)) preferredRate = 1.0;

// Function to populate voice options
function populateVoices() {
  const voiceSelect = document.getElementById('voice-select');
  if (!voiceSelect) return;
  const voices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = '';
  const enVoices = voices.filter(v => /en[-_]/i.test(v.lang));
  const list = enVoices.length ? enVoices : voices;
  list.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.name;
    opt.textContent = `${v.name} (${v.lang})`;
    if (preferredVoice && preferredVoice === v.name) opt.selected = true;
    voiceSelect.appendChild(opt);
  });
  if (!preferredVoice && list[0]) {
    preferredVoice = list[0].name;
  }
}

// Function to speak text
function speak(line) {
  if (!voiceEnabled) return;
  if (!('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(line);
  utter.rate = preferredRate || 1.0;
  utter.pitch = 1.0;
  utter.volume = 1.0;
  const voices = speechSynthesis.getVoices();
  const selected = voices.find(v => v.name === preferredVoice);
  if (selected) utter.voice = selected;
  else if (voices[0]) utter.voice = voices[0];
  utter.onstart = () => { /* Optional: update status */ };
  utter.onend = () => { /* Optional: update status */ };
  speechSynthesis.speak(utter);
}

// Function to apply mode
function applyMode(mode, src) {
  const avatar = document.getElementById('avatar');
  const portrait = document.getElementById('portrait');
  if (mode === 'portrait') {
    if (src && portrait) portrait.src = src;
    if (avatar) avatar.style.display = 'none';
    if (portrait) {
      portrait.style.display = 'block';
      portrait.setAttribute('aria-hidden', 'false');
    }
  } else {
    if (portrait) portrait.style.display = 'none';
    if (avatar) avatar.style.display = 'flex';
  }
  localStorage.setItem('ai_mode', mode);
  if (src) localStorage.setItem('ai_mode_image', src);
}

// Function to toggle setting options
function toggleSetting(id) {
  const options = document.getElementById(id + '-options');
  if (options) {
    options.style.display = options.style.display === 'none' ? 'block' : 'none';
  }
}

// Wire up all buttons on DOM load
document.addEventListener('DOMContentLoaded', () => {
  const voiceToggle = document.getElementById('voice-toggle');
  const modeApply = document.getElementById('mode-apply');
  const voiceSelect = document.getElementById('voice-select');
  const voiceRate = document.getElementById('voice-rate');
  const modeSelect = document.getElementById('mode-select');
  const modeImage = document.getElementById('mode-image');

  // Voice toggle
  if (voiceToggle) {
    voiceToggle.textContent = voiceEnabled ? 'Unmute' : 'Muted';
    voiceToggle.addEventListener('click', () => {
      voiceEnabled = !voiceEnabled;
      localStorage.setItem('ai_voice_enabled', JSON.stringify(voiceEnabled));
      voiceToggle.textContent = voiceEnabled ? 'Unmute' : 'Muted';
      if (!voiceEnabled) {
        speechSynthesis.cancel();
      }
    });
  }

  // Mode apply
  if (modeApply) {
    modeApply.addEventListener('click', () => {
      const mode = modeSelect ? modeSelect.value : 'visualizer';
      const src = modeImage ? modeImage.value.trim() : '';
      applyMode(mode, src);
    });
  }

  // Voice select change
  if (voiceSelect) {
    voiceSelect.addEventListener('change', () => {
      preferredVoice = voiceSelect.value;
      localStorage.setItem('ai_voice_name', preferredVoice);
    });
  }

  // Voice rate change
  if (voiceRate) {
    voiceRate.value = String(preferredRate);
    voiceRate.addEventListener('input', () => {
      preferredRate = parseFloat(voiceRate.value || '1.0');
      localStorage.setItem('ai_voice_rate', String(preferredRate));
    });
  }

  // Populate voices on load
  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.onvoiceschanged = populateVoices;
  } else {
    populateVoices();
  }

  // Restore saved mode
  const savedMode = localStorage.getItem('ai_mode') || 'visualizer';
  const savedSrc = localStorage.getItem('ai_mode_image') || '';
  if (modeSelect) modeSelect.value = savedMode;
  if (modeImage) modeImage.value = savedSrc;
  applyMode(savedMode, savedSrc);

  // Add hover effects (as before)
  const buttons = document.querySelectorAll('.voice-toggle, #mode-apply, .setting-toggle');
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.05)';
      btn.style.transition = 'transform 0.2s ease';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
    });
  });
});

// Original handleUserMessage
function handleUserMessage(text) {
  const t = (text || '').trim();
  if (!t) return;
  history.push({ role: 'me', text: t });
  appendChat('me', t);
  const response = generateReply(t);
  history.push({ role: 'ai', text: response });
  appendChat('ai', response);
  speak(response);
  chatInput.value = '';
}


