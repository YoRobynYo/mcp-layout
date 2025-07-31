// CubeSync.js - Minimal integration to sync existing systems
console.log("CubeSync.js loaded - Bridging CubeDragger and PanelManager");

class CubeSync {
    constructor() {
        this.cubeDragger = null;
        this.panelManager = null;
        this.isInitialized = false;
        
        // Wait for both systems to load
        this.initWhenReady();
    }
    
    async initWhenReady() {
        // Wait for both systems to be available
        let attempts = 0;
        while ((!window.CubeDragger && !document.querySelector('.centreCube')) || 
               (!window.PanelManager && !document.querySelector('.panel')) && 
               attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        // Find existing instances or create references
        this.findExistingSystems();
        this.setupSyncMethods();
        this.isInitialized = true;
        
        console.log("🔗 CubeSync initialized - Systems are now synchronized");
    }
    
    findExistingSystems() {
        // Try to find existing CubeDragger instance
        if (window.cubeDragger) {
            this.cubeDragger = window.cubeDragger;
        }
        
        // Try to find existing PanelManager instance
        if (window.panelManager) {
            this.panelManager = window.panelManager;
        } else if (window.PanelManager) {
            // Look for PanelManager instances in the global scope
            this.panelManager = window.lastPanelManager || new window.PanelManager();
        }
        
        console.log("Found systems:", { 
            cubeDragger: !!this.cubeDragger, 
            panelManager: !!this.panelManager 
        });
    }
    
    setupSyncMethods() {
        if (!this.panelManager) return;
        
        // Override PanelManager's rotateCube method to sync with CubeDragger
        const originalRotateCube = this.panelManager.rotateCube.bind(this.panelManager);
        
        this.panelManager.rotateCube = (direction) => {
            // Call original method
            originalRotateCube(direction);
            
            // Sync with CubeDragger if it exists
            if (this.cubeDragger && this.cubeDragger.state) {
                this.cubeDragger.state.rotationX = this.panelManager.currentRotation.x;
                this.cubeDragger.state.rotationY = this.panelManager.currentRotation.y;
                
                // Update extended panel visibility
                if (this.cubeDragger.updateVisiblePanel) {
                    this.cubeDragger.updateVisiblePanel();
                }
            }
            
            console.log(`🔄 Synced rotation: X=${this.panelManager.currentRotation.x}°, Y=${this.panelManager.currentRotation.y}°`);
        };
        
        // If CubeDragger exists, override its rotation update to sync back
        if (this.cubeDragger && this.cubeDragger.updateVisiblePanel) {
            const originalUpdateVisiblePanel = this.cubeDragger.updateVisiblePanel.bind(this.cubeDragger);
            
            this.cubeDragger.updateVisiblePanel = () => {
                // Update PanelManager's rotation state
                if (this.panelManager) {
                    this.panelManager.currentRotation.x = this.cubeDragger.state.rotationX;
                    this.panelManager.currentRotation.y = this.cubeDragger.state.rotationY;
                }
                
                // Call original method
                originalUpdateVisiblePanel();
            };
        }
        
        console.log("✅ Sync methods installed");
    }
    
    // Public method to manually sync states
    syncStates() {
        if (!this.isInitialized || !this.panelManager) return;
        
        const cube = document.querySelector('.centreCube');
        if (!cube) return;
        
        // Get current transform values
        const transform = cube.style.transform;
        const rotateXMatch = transform.match(/rotateX\(([^)]+)\)/);
        const rotateYMatch = transform.match(/rotateY\(([^)]+)\)/);
        
        if (rotateXMatch && rotateYMatch) {
            const currentX = parseFloat(rotateXMatch[1]);
            const currentY = parseFloat(rotateYMatch[1]);
            
            // Update both systems
            if (this.panelManager) {
                this.panelManager.currentRotation.x = currentX;
                this.panelManager.currentRotation.y = currentY;
            }
            
            if (this.cubeDragger && this.cubeDragger.state) {
                this.cubeDragger.state.rotationX = currentX;
                this.cubeDragger.state.rotationY = currentY;
            }
            
            console.log(`🔄 States synced to X=${currentX}°, Y=${currentY}°`);
        }
    }
    
    // Helper method to get current face from either system
    getCurrentFace() {
        if (this.panelManager && this.panelManager.getCurrentFace) {
            return this.panelManager.getCurrentFace();
        }
        
        return { name: 'Unknown', topic: 'No system available' };
    }
    
    // Helper method to reset both systems
    resetAll() {
        if (this.panelManager && this.panelManager.resetCube) {
            this.panelManager.resetCube();
        }
        
        if (this.cubeDragger && this.cubeDragger.state) {
            this.cubeDragger.state.rotationX = 0;
            this.cubeDragger.state.rotationY = 0;
            if (this.cubeDragger.updateVisiblePanel) {
                this.cubeDragger.updateVisiblePanel();
            }
        }
        
        console.log("🔄 All systems reset to front face");
    }
}

// Enhanced PanelManager Integration
// This modifies the existing PanelManager to work better with CubeDragger
if (typeof PanelManager !== 'undefined') {
    // Store reference to the last created PanelManager
    const originalPanelManagerInit = PanelManager.prototype.init;
    
    PanelManager.prototype.init = function() {
        // Call original init
        originalPanelManagerInit.call(this);
        
        // Store reference globally for CubeSync
        window.lastPanelManager = this;
        
        // Add enhanced button controls with sync indicators
        this.addSyncIndicators();
    };
    
    PanelManager.prototype.addSyncIndicators = function() {
        // Add a sync status indicator to button controls panel
        const buttonPanel = document.getElementById('screen-4a');
        if (buttonPanel) {
            const syncIndicator = document.createElement('div');
            syncIndicator.className = 'sync-indicator';
            syncIndicator.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                width: 8px;
                height: 8px;
                background: #00ff88;
                border-radius: 50%;
                animation: pulse 2s infinite;
            `;
            syncIndicator.title = 'Systems Synchronized';
            buttonPanel.appendChild(syncIndicator);
        }
    };
    
    // Enhanced rotateCube method with better logging
    const originalRotateCube = PanelManager.prototype.rotateCube;
    PanelManager.prototype.rotateCube = function(direction) {
        const oldFace = this.getCurrentFace();
        
        // Call original method
        originalRotateCube.call(this, direction);
        
        const newFace = this.getCurrentFace();
        
        // Enhanced logging
        if (oldFace.name !== newFace.name) {
            console.log(`🎯 Face transition: ${oldFace.name} → ${newFace.name}`);
            console.log(`📱 Topic: ${newFace.topic}`);
        }
    };
}

// Enhanced CubeDragger Integration Helper


// Initialize the sync system
const cubeSync = new CubeSync();

// Make it globally available
window.cubeSync = cubeSync;

// Enhanced initialization helper
function initializeEnhancedCubeSystem() {
    // Wait a bit for other systems to fully load
    setTimeout(() => {
        // Sync initial state
        cubeSync.syncStates();
        
        console.log("🚀 Enhanced cube system ready!");
        console.log("Available commands:");
        console.log("  - window.cubeSync.resetAll() - Reset all systems");
        console.log("  - window.cubeSync.syncStates() - Manual sync");
        console.log("  - window.cubeSync.getCurrentFace() - Get current face info");
        
    }, 1000);
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEnhancedCubeSystem);
} else {
    initializeEnhancedCubeSystem();
}