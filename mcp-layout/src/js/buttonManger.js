// dragCube.js setting
// console.log("Independent Panel System loaded!");

// if (typeof PanelManager === 'undefined') {
//     class PanelManager {
//         constructor() {
//             this.draggedPanel = null;
//             this.panelOffset = { x: 0, y: 0 };
//             this.isPanelDragging = false;
//             this.selectedCube = 'center';
//             this.currentRotation = { x: 0, y: 0 };
//             this.init();
//         }

//         init() {
//             this.addGlobalListeners();
//             this.createPanel('screen-4', 'AI Panel', 100, 100, this.createAIContent.bind(this));
//             this.createPanel('screen-4a', 'Button Controls', 450, 100, this.createButtonControls.bind(this));
//         }

//         addGlobalListeners() {
//             ['mousemove', 'mouseup', 'touchmove', 'touchend'].forEach(event => {
//                 document.addEventListener(event, event.includes('move') ? 
//                     this.handlePanelMove.bind(this) : this.stopPanelDrag.bind(this));
//             });
//         }

//         createPanel(id, title, left, top, contentFn) {
//             let panel = document.getElementById(id);
//             if (panel) return this.addPanelListeners(panel);

//             panel = Object.assign(document.createElement('div'), {
//                 id, className: 'panel',
//                 innerHTML: `<h3 style="margin:0 0 20px 0;color:#fff;font-size:16px;text-align:center;pointer-events:none">${title}</h3>`
//             });

//             panel.style.cssText = `position:absolute;left:${left}px;top:${top}px;width:210px;height:220px;
//                 background:transparent;border:none;border-radius:14px;padding:15px;color:#fff;
//                 box-shadow:0 4px 10px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.05);
//                 user-select:none;transition:box-shadow 0.2s ease;z-index:10;cursor:grab;
//                 display:flex;flex-direction:column;justify-content:flex-start;align-items:center;
//                 backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)`;

//             contentFn(panel);
//             document.body.appendChild(panel);
//             this.addPanelListeners(panel);
//             console.log(`Created panel: ${id}`);
//         }

//         createButton(text, className, special = false) {
//             const btn = Object.assign(document.createElement('button'), {
//                 textContent: text, className: `glassy-btn ${className}`
//             });
            
//             const baseStyle = `padding:8px 12px;background:linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02));
//                 border-radius:12px;border:1px solid rgba(255,255,255,0.25);color:#e8f0f0;font-weight:500;
//                 font-size:12px;cursor:pointer;backdrop-filter:blur(8px);transition:all 0.2s ease;
//                 box-shadow:6px 6px 12px rgba(0,0,0,0.25),-6px -6px 12px rgba(255,255,255,0.05);
//                 pointer-events:auto;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center`;
            
//             btn.style.cssText = baseStyle + (special ? special : '');

//             ['mouseenter', 'mouseleave', 'mousedown', 'mouseup'].forEach((event, i) => {
//                 btn.addEventListener(event, () => {
//                     const transforms = ['translateY(-2px)', 'translateY(0)', 'translateY(0)', 'translateY(0)'];
//                     const shadows = [
//                         '8px 8px 16px rgba(0,0,0,0.3),-4px -4px 8px rgba(255,255,255,0.08)',
//                         baseStyle.match(/box-shadow:[^;]+/)[0].replace('box-shadow:', ''),
//                         'inset 4px 4px 6px rgba(0,0,0,0.25),inset -2px -2px 6px rgba(255,255,255,0.1)',
//                         baseStyle.match(/box-shadow:[^;]+/)[0].replace('box-shadow:', '')
//                     ];
//                     btn.style.transform = transforms[i];
//                     btn.style.boxShadow = shadows[i];
//                 });
//             });
//             return btn;
//         }

//         createButtonControls(panel) {
//             const container = Object.assign(document.createElement('div'), {
//                 innerHTML: `
//                     <div class="screen-selector" style="display:flex;gap:8px;justify-content:center;align-items:center;padding:4px;pointer-events:auto"></div>
//                     <div class="rotation-controls" style="display:flex;gap:8px;justify-content:center;padding:4px;flex-wrap:wrap;pointer-events:auto"></div>
//                     <div class="action-controls" style="display:flex;gap:8px;justify-content:center;padding:4px;pointer-events:auto"></div>`
//             });

//             // Screen buttons
//             const screenSelector = container.querySelector('.screen-selector');
            
//             // Add Screen label positioned above the first button
//             const screenLabel = Object.assign(document.createElement('div'), {
//                 textContent: 'Screen',
//                 style: 'font-size:14px;color:#f0f0f0;font-weight:500;position:absolute;top:-20px;left:0'
//             });
//             screenSelector.style.position = 'relative';
//             screenSelector.appendChild(screenLabel);
            
//             ['centre', '1', '2', '3'].forEach((screen, i) => {
//                 const btn = this.createButton(screen, 'screen-btn');
//                 btn.dataset.screen = screen === 'centre' ? 'center' : screen;
//                 if (i === 0) btn.classList.add('active');
//                 screenSelector.appendChild(btn);
//             });

//             // Rotation buttons
//             const rotationControls = container.querySelector('.rotation-controls');
//             [['← Left', 'left'], ['Right →', 'right'], ['↑ Up', 'up'], ['Down ↓', 'down']].forEach(([text, dir]) => {
//                 const btn = this.createButton(text, 'rotate-btn');
//                 btn.dataset.direction = dir;
//                 rotationControls.appendChild(btn);
//             });

//             // Action buttons
//             const actionControls = container.querySelector('.action-controls');
//             const applyBtn = this.createButton('Apply', 'action-btn', 'background:linear-gradient(145deg,rgba(0,255,136,0.15),rgba(0,255,136,0.05));color:#00ff88;border-color:rgba(0,255,136,0.3)');
//             const resetBtn = this.createButton('Reset', 'action-btn', 'background:linear-gradient(145deg,rgba(255,100,100,0.15),rgba(255,100,100,0.05));color:#ff6464;border-color:rgba(255,100,100,0.3)');
//             applyBtn.id = 'apply-btn';
//             resetBtn.id = 'reset-btn';
//             actionControls.append(applyBtn, resetBtn);

//             panel.appendChild(container);
//             this.addButtonListeners(panel);
//         }

//         createAIContent(panel) {
//             panel.innerHTML += `
//                 <div class="ai-interface" style="display:flex;flex-direction:column;gap:15px;width:100%;height:100%;pointer-events:none">
//                     <div style="display:flex;align-items:center;gap:8px;padding:10px;background:rgba(0,255,136,0.1);border-radius:8px;border:1px solid rgba(0,255,136,0.2)">
//                         <div style="width:8px;height:8px;background:#00ff88;border-radius:50%;animation:pulse 2s infinite"></div>
//                         <span style="color:#00ff88;font-size:12px;font-weight:500">AI Ready</span>
//                     </div>
//                     <div style="display:flex;flex-direction:column;gap:10px;flex:1;pointer-events:auto">
//                         <div class="chat-messages" style="flex:1;padding:10px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid rgba(255,255,255,0.1);overflow-y:auto;max-height:150px">
//                             <div style="padding:8px;background:rgba(0,255,247,0.1);border-radius:6px;font-size:12px;color:#00fff7">Hello! I'm ready to help with your cube controls.</div>
//                         </div>
//                         <div style="display:flex;gap:8px">
//                             <input type="text" placeholder="Ask me anything..." style="flex:1;padding:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:6px;color:#fff;font-size:12px">
//                             ${this.createButton('Send', 'send-btn').outerHTML}
//                         </div>
//                     </div>
//                 </div>`;

//             if (!document.querySelector('style[data-pulse]')) {
//                 const style = Object.assign(document.createElement('style'), {
//                     textContent: '@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}'
//                 });
//                 style.dataset.pulse = 'true';
//                 document.head.appendChild(style);
//             }
//         }

//         addButtonListeners(panel) {
//             panel.addEventListener('click', e => {
//                 const btn = e.target.closest('button');
//                 if (!btn) return;
//                 e.stopPropagation();

//                 if (btn.classList.contains('rotate-btn')) {
//                     this.rotateCube(btn.dataset.direction);
//                 } else if (btn.classList.contains('screen-btn')) {
//                     if (btn.dataset.screen !== 'center') {
//                         console.log(`Screen ${btn.dataset.screen} not available yet`);
//                         return;
//                     }
//                     panel.querySelectorAll('.screen-btn').forEach(b => {
//                         b.classList.toggle('active', b === btn);
//                         b.style.cssText += b === btn ? 
//                             'background:linear-gradient(145deg,rgba(0,255,247,0.15),rgba(0,255,247,0.08));color:#00fff7;border-color:rgba(0,255,247,0.2)' :
//                             'background:linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02));color:#e8f0f0;border-color:rgba(255,255,255,0.25)';
//                     });
//                     this.selectedCube = btn.dataset.screen;
//                 } else if (btn.id === 'apply-btn') {
//                     console.log(`✅ Applied cube state - Face: ${this.getCurrentFace().name}`);
//                 } else if (btn.id === 'reset-btn') {
//                     this.resetCube();
//                 }
//             });
//         }

//         rotateCube(direction) {
//             const cube = document.querySelector('.centreCube');
//             if (!cube) return console.warn('No .centreCube found');

//             const rotations = { left: [0, -90], right: [0, 90], up: [-90, 0], down: [90, 0] };
//             const [x, y] = rotations[direction];
//             this.currentRotation.x += x;
//             this.currentRotation.y += y;

//             cube.style.cssText += `transform:rotateX(${this.currentRotation.x}deg) rotateY(${this.currentRotation.y}deg);transition:transform 0.5s ease`;
//             console.log(`🔄 Current face: ${this.getCurrentFace().name} (${this.getCurrentFace().topic})`);
//         }

//         getCurrentFace() {
//             const x = ((this.currentRotation.x % 360) + 360) % 360;
//             const y = ((this.currentRotation.y % 360) + 360) % 360;
//             const faces = {
//                 '0,0': { name: 'Front', topic: 'Dashboard/Home' },
//                 '0,90': { name: 'Right', topic: 'News Feed' },
//                 '0,180': { name: 'Back', topic: 'Bitcoin/Crypto' },
//                 '0,270': { name: 'Left', topic: 'Blog Posts' },
//                 '90,0': { name: 'Top', topic: 'Weather' },
//                 '270,0': { name: 'Bottom', topic: 'Social Media' }
//             };
//             return faces[`${x},${y}`] || { name: 'Unknown', topic: 'Mixed View' };
//         }

//         resetCube() {
//             const cube = document.querySelector('.centreCube');
//             if (!cube) return;
//             this.currentRotation = { x: 0, y: 0 };
//             cube.style.cssText += 'transform:rotateX(0deg) rotateY(0deg);transition:transform 0.5s ease';
//             console.log('🔄 Cube reset to Front face');
//         }

//         addPanelListeners(panel) {
//             ['mousedown', 'touchstart'].forEach(event => 
//                 panel.addEventListener(event, this.startPanelDrag.bind(this)));
//         }

//         startPanelDrag(e) {
//             const panel = e.target.closest('.panel');
//             if (!panel || e.target.matches('button, input') || e.target.closest('button, input, .chat-input, .rotation-controls, .action-controls, .screen-selector')) return;

//             e.preventDefault();
//             e.stopPropagation();
//             this.isPanelDragging = true;
//             this.draggedPanel = panel;
//             panel.style.cssText += 'cursor:grabbing;z-index:1000';

//             const rect = panel.getBoundingClientRect();
//             const clientX = e.clientX || e.touches?.[0]?.clientX;
//             const clientY = e.clientY || e.touches?.[0]?.clientY;
//             this.panelOffset = { x: clientX - rect.left, y: clientY - rect.top };
//         }

//         handlePanelMove(e) {
//             if (!this.isPanelDragging || !this.draggedPanel) return;
//             e.preventDefault();

//             const clientX = e.clientX || e.touches?.[0]?.clientX;
//             const clientY = e.clientY || e.touches?.[0]?.clientY;
//             const newX = Math.max(0, Math.min(clientX - this.panelOffset.x, window.innerWidth - this.draggedPanel.offsetWidth));
//             const newY = Math.max(0, Math.min(clientY - this.panelOffset.y, window.innerHeight - this.draggedPanel.offsetHeight));

//             this.draggedPanel.style.cssText += `left:${newX}px;top:${newY}px`;
//         }

//         stopPanelDrag() {
//             if (!this.isPanelDragging || !this.draggedPanel) return;
//             this.draggedPanel.style.cssText += 'cursor:grab;z-index:10';
//             this.draggedPanel = null;
//             this.isPanelDragging = false;
//         }
//     }

//     window.PanelManager = PanelManager;
// }

// // Initialize when DOM is ready
// const init = () => new PanelManager();
// document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();


// 
console.log("Independent Panel System loaded!");
if (typeof PanelManager === 'undefined') {
    class PanelManager {
        constructor() {
            this.draggedPanel = null;
            this.panelOffset = { x: 0, y: 0 };
            this.isPanelDragging = false;
            this.selectedCube = 'center';
            this.currentRotation = { x: 0, y: 0 };
            this.init();
        }
        init() {
            this.addGlobalListeners();
            this.createPanel('screen-4', 'AI Panel', 100, 100, this.createAIContent.bind(this));
            this.createPanel('screen-4a', 'Button Controls', 450, 100, this.createButtonControls.bind(this));
        }
        addGlobalListeners() {
            ['mousemove', 'mouseup', 'touchmove', 'touchend'].forEach(event => {
                document.addEventListener(event, event.includes('move') ?
                    this.handlePanelMove.bind(this) : this.stopPanelDrag.bind(this));
            });
        }
        createPanel(id, title, left, top, contentFn) {
            let panel = document.getElementById(id);
            if (panel) {
                if (!panel.dataset.initialized) {
                    this.addPanelListeners(panel);
                    panel.dataset.initialized = 'true';
                }
                return;
            }
            panel = Object.assign(document.createElement('div'), {
                id,
                className: 'panel',
                innerHTML: `<h3 style="margin:0 0 20px 0;color:#fff;font-size:16px;text-align:center;pointer-events:none">${title}</h3>`
            });
            panel.style.cssText = `position:absolute;left:${left}px;top:${top}px;width:210px;height:220px;
                background:transparent;border:none;border-radius:14px;padding:15px;color:#fff;
                box-shadow:0 4px 10px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.05);
                user-select:none;transition:box-shadow 0.2s ease;z-index:10;cursor:grab;
                display:flex;flex-direction:column;justify-content:flex-start;align-items:center;
                backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)`;
            contentFn(panel);
            document.body.appendChild(panel);
            this.addPanelListeners(panel);
            panel.dataset.initialized = 'true';
            console.log(`Created panel: ${id}`);
        }
        createButton(text, className, special = false) {
            const btn = Object.assign(document.createElement('button'), {
                textContent: text,
                className: `glassy-btn ${className}`
            });

            const baseStyle = `padding:8px 12px;background:linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02));
                border-radius:12px;border:1px solid rgba(255,255,255,0.25);color:#e8f0f0;font-weight:500;
                font-size:12px;cursor:pointer;backdrop-filter:blur(8px);transition:all 0.2s ease;
                box-shadow:6px 6px 12px rgba(0,0,0,0.25),-6px -6px 12px rgba(255,255,255,0.05);
                pointer-events:auto;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center`;

            btn.style.cssText = baseStyle + (special ? special : '');

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
        createButtonControls(panel) {
            const container = Object.assign(document.createElement('div'), {
                innerHTML: `
                    <div class="screen-selector" style="display:flex;gap:8px;justify-content:center;align-items:center;padding:4px;pointer-events:auto;position:relative;"></div>
                    <div class="rotation-controls" style="display:flex;gap:8px;justify-content:center;padding:4px;flex-wrap:wrap;pointer-events:auto"></div>
                    <div class="action-controls" style="display:flex;gap:8px;justify-content:center;padding:4px;pointer-events:auto"></div>`
            });
            // Screen buttons
            const screenSelector = container.querySelector('.screen-selector');
            const screenLabel = Object.assign(document.createElement('div'), {
                textContent: 'Screen',
                style: 'font-size:14px;color:#f0f0f0;font-weight:500;position:absolute;top:-20px;left:0'
            });
            screenSelector.appendChild(screenLabel);

            ['center', '1', '2', '3'].forEach((screen, i) => {
                const btn = this.createButton(screen, 'screen-btn');
                btn.dataset.screen = screen;
                if (i === 0) btn.classList.add('active');
                screenSelector.appendChild(btn);
            });

            // Rotation buttons
            const rotationControls = container.querySelector('.rotation-controls');
            [['← Left', 'left'], ['Right →', 'right'], ['↑ Up', 'up'], ['Down ↓', 'down']].forEach(([text, dir]) => {
                const btn = this.createButton(text, 'rotate-btn');
                btn.dataset.direction = dir;
                rotationControls.appendChild(btn);
            });

            // Action buttons
            const actionControls = container.querySelector('.action-controls');
            const applyBtn = this.createButton('Apply', 'action-btn', 'background:linear-gradient(145deg,rgba(0,255,136,0.15),rgba(0,255,136,0.05));color:#00ff88;border-color:rgba(0,255,136,0.3)');
            const resetBtn = this.createButton('Reset', 'action-btn', 'background:linear-gradient(145deg,rgba(255,100,100,0.15),rgba(255,100,100,0.05));color:#ff6464;border-color:rgba(255,100,100,0.3)');
            applyBtn.id = 'apply-btn';
            resetBtn.id = 'reset-btn';
            actionControls.append(applyBtn, resetBtn);

            panel.appendChild(container);
            this.addButtonListeners(panel);
        }
        createAIContent(panel) {
            panel.innerHTML += `
                <div class="ai-interface" style="display:flex;flex-direction:column;gap:15px;width:100%;height:100%;pointer-events:auto">
                    <div style="display:flex;align-items:center;gap:8px;padding:10px;background:rgba(0,255,136,0.1);border-radius:8px;border:1px solid rgba(0,255,136,0.2)">
                        <div style="width:8px;height:8px;background:#00ff88;border-radius:50%;animation:pulse 2s infinite"></div>
                        <span style="color:#00ff88;font-size:12px;font-weight:500">AI Ready</span>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:10px;flex:1;pointer-events:auto">
                        <div class="chat-messages" style="flex:1;padding:10px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid rgba(255,255,255,0.1);overflow-y:auto;max-height:150px">
                            <div style="padding:8px;background:rgba(0,255,247,0.1);border-radius:6px;font-size:12px;color:#00fff7">Hello! I'm ready to help with your cube controls.</div>
                        </div>
                        <div style="display:flex;gap:8px">
                            <input type="text" placeholder="Ask me anything..." style="flex:1;padding:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:6px;color:#fff;font-size:12px">
                            ${this.createButton('Send', 'send-btn').outerHTML}
                        </div>
                    </div>
                </div>`;
            if (!document.querySelector('style[data-pulse]')) {
                const style = Object.assign(document.createElement('style'), {
                    textContent: '@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}'
                });
                style.dataset.pulse = 'true';
                document.head.appendChild(style);
            }
        }
        addButtonListeners(panel) {
            panel.addEventListener('click', e => {
                const btn = e.target.closest('button');
                if (!btn) return;
                e.stopPropagation();
                if (btn.classList.contains('rotate-btn')) {
                    this.rotateCube(btn.dataset.direction);
                } else if (btn.classList.contains('screen-btn')) {
                    if (btn.dataset.screen !== 'center') {
                        console.log(`Screen ${btn.dataset.screen} not available yet`);
                        return;
                    }
                    panel.querySelectorAll('.screen-btn').forEach(b => {
                        b.classList.toggle('active', b === btn);
                        b.style.cssText += b === btn ?
                            'background:linear-gradient(145deg,rgba(0,255,247,0.15),rgba(0,255,247,0.08));color:#00fff7;border-color:rgba(0,255,247,0.2)' :
                            'background:linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02));color:#e8f0f0;border-color:rgba(255,255,255,0.25)';
                    });
                    this.selectedCube = btn.dataset.screen;
                } else if (btn.id === 'apply-btn') {
                    console.log(`✅ Applied cube state - Face: ${this.getCurrentFace().name}`);
                } else if (btn.id === 'reset-btn') {
                    this.resetCube();
                }
            });
        }
        rotateCube(direction) {
            const cube = document.querySelector('.centreCube');
            if (!cube) return console.warn('No .centreCube found');
            const rotations = { left: [0, -90], right: [0, 90], up: [-90, 0], down: [90, 0] };
            const [x, y] = rotations[direction];
            this.currentRotation.x += x;
            this.currentRotation.y += y;
            cube.style.transform = `rotateX(${this.currentRotation.x}deg) rotateY(${this.currentRotation.y}deg)`;
            cube.style.transition = 'transform 0.5s ease';
            console.log(`🔄 Current face: ${this.getCurrentFace().name} (${this.getCurrentFace().topic})`);
        }
        getCurrentFace() {
            const x = ((this.currentRotation.x % 360) + 360) % 360;
            const y = ((this.currentRotation.y % 360) + 360) % 360;
            const faces = {
                '0,0': { name: 'Front', topic: 'Dashboard/Home' },
                '0,90': { name: 'Right', topic: 'News Feed' },
                '0,180': { name: 'Back', topic: 'Bitcoin/Crypto' },
                '0,270': { name: 'Left', topic: 'Blog Posts' },
                '90,0': { name: 'Top', topic: 'Weather' },
                '270,0': { name: 'Bottom', topic: 'Social Media' }
            };
            return faces[`${x},${y}`] || { name: 'Unknown', topic: 'Mixed View' };
        }
        resetCube() {
            const cube = document.querySelector('.centreCube');
            if (!cube) return;
            this.currentRotation = { x: 0, y: 0 };
            cube.style.transform = 'rotateX(0deg) rotateY(0deg)';
            cube.style.transition = 'transform 0.5s ease';
            console.log('🔄 Cube reset to Front face');
        }
        addPanelListeners(panel) {
            ['mousedown', 'touchstart'].forEach(event =>
                panel.addEventListener(event, this.startPanelDrag.bind(this)));
        }
        startPanelDrag(e) {
            const panel = e.target.closest('.panel');
            if (!panel) return;
            // Avoid dragging on buttons or inputs inside panel
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
        stopPanelDrag() {
            if (!this.isPanelDragging || !this.draggedPanel) return;
            this.draggedPanel.style.cursor = 'grab';
            this.draggedPanel.style.zIndex = 10;
            this.draggedPanel = null;
            this.isPanelDragging = false;
        }
    }
    window.PanelManager = PanelManager;
}
// Initialize when DOM is ready
const init = () => new PanelManager();
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();


