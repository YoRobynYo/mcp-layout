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
