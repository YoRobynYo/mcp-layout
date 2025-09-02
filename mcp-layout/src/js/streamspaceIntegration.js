// This file will contain logic for integrating StreamSpace with cube interactions.
// It will handle dynamic loading of StreamSpace content into a central display area
// based on cube face hovers.

(function() {
  const streamspaceContainer = document.getElementById('streamspace-display-container');
  const streamspaceIframe = document.getElementById('streamspace-iframe');
  const streamspaceCloseBtn = document.getElementById('streamspace-close-btn');
  const streamspaceDragHandle = document.getElementById('streamspace-drag-handle');
  const streamspaceOverlay = document.getElementById('streamspace-overlay');
  // Ensure the drag handle never shows; remove it and normalize iframe spacing
  if (streamspaceDragHandle) {
    try { streamspaceDragHandle.remove(); } catch (e) { /* ignore */ }
    if (streamspaceIframe) {
      streamspaceIframe.style.marginTop = '0px';
      streamspaceIframe.style.height = '100%';
    }
  }


  let isDraggingStreamspace = false;
  let offsetX, offsetY;
  let animationFrameId = null;
  let originalTransition = '';

  window.streamspaceIntegration = {
    showStreamspace: function(smallCubeId, faceName) {
      if (streamspaceContainer && streamspaceIframe) {
        let contentPath = '';

        // Logic to determine content based on smallCubeId and faceName
        if (smallCubeId === 'cube-1-top-right-front' && faceName === 'front') {
          if (window.electronAPI && window.electronAPI.openSystemMonitor) {
            window.electronAPI.openSystemMonitor();
            streamspaceContainer.style.display = 'none'; // Hide the iframe container
            streamspaceIframe.src = ''; // Clear the iframe content
          } else {
            console.warn("Electron API for System Monitor not available. Falling back to waiting screen.");
            streamspaceIframe.src = './streamspace/waiting.html'; // Fallback to waiting screen
            streamspaceContainer.style.display = 'block';
          }
        } else if ((smallCubeId === 'cube-1-top-left-front' && faceName === 'front') ||
                   (smallCubeId === 'cube-1-top-left-front' && faceName === 'bottom')) {
          contentPath = './streamspace/index.html';
        } else if (smallCubeId.startsWith('cube-1-') && faceName === 'front') {
          // Other small cubes on cube-1's front face
          contentPath = './streamspace/waiting.html';
        } else if (smallCubeId.startsWith('cube-2-') && faceName === 'front') {
          // All small cubes on cube-2's front face
          contentPath = './streamspace/waiting.html';
        } else {
          // Default for other faces/cubes if needed, or just hide
          contentPath = './streamspace/waiting.html'; // Or leave empty to show nothing
        }

        if (contentPath) {
          streamspaceIframe.src = contentPath;
          streamspaceContainer.style.display = 'block';
          streamspaceContainer.style.pointerEvents = 'auto';
        } else {
          streamspaceContainer.style.display = 'none';
          streamspaceContainer.style.pointerEvents = 'none';
          streamspaceIframe.src = '';
        }
      }
    },

    hideStreamspace: function() {
      console.log('Hiding StreamSpace');
      if (streamspaceContainer && streamspaceIframe) {
        streamspaceContainer.style.display = 'none';
        streamspaceContainer.style.pointerEvents = 'none';
        streamspaceIframe.src = ''; // Clear the iframe content
      }
    }
  };

  // Add a global click listener to hide StreamSpace when clicking outside
  document.addEventListener('click', (event) => {
    const target = event.target;
    // Check if the click was outside the streamspace container and not on a cube face or the close/drag handle
    if (streamspaceContainer.style.display === 'block' &&
        !streamspaceContainer.contains(target) &&
        !target.closest('.face') &&
        !target.closest('.panel') &&
        target.id !== 'streamspace-close-btn' &&
        target.id !== 'streamspace-drag-handle') {
      window.streamspaceIntegration.hideStreamspace();
    }
  });

  // Add click listener for the close button
  if (streamspaceCloseBtn) {
    streamspaceCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent click from bubbling up to global listener
      window.streamspaceIntegration.hideStreamspace();
    });
  }

  // Dragging functionality for StreamSpace container
  if (false && streamspaceDragHandle && streamspaceContainer) {
    streamspaceDragHandle.addEventListener('mousedown', (e) => {
      isDraggingStreamspace = true;
      offsetX = e.clientX - streamspaceContainer.getBoundingClientRect().left;
      offsetY = e.clientY - streamspaceContainer.getBoundingClientRect().top;
      streamspaceContainer.style.cursor = 'grabbing';
      e.stopPropagation(); // Prevent event from bubbling up

      // Store original transition and disable it for smooth dragging
      originalTransition = streamspaceContainer.style.transition;
      streamspaceContainer.style.transition = 'none';

      // Show overlay to capture mouse events over iframe
      if (streamspaceOverlay) {
        streamspaceOverlay.style.display = 'block';
      }
    });

    streamspaceDragHandle.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent click event from bubbling up
    });

    const animateDrag = () => {
      if (!isDraggingStreamspace) return;

      const newX = mouseX - offsetX;
      const newY = mouseY - offsetY;

      // Optional: Constrain movement within window bounds
      const maxX = window.innerWidth - streamspaceContainer.offsetWidth;
      const maxY = window.innerHeight - streamspaceContainer.offsetHeight;

      streamspaceContainer.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
      streamspaceContainer.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;

      animationFrameId = requestAnimationFrame(animateDrag);
    };

    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isDraggingStreamspace) return;
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(animateDrag);
      }
    });

    document.addEventListener('mouseup', () => {
      isDraggingStreamspace = false;
      streamspaceContainer.style.cursor = 'grab';
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      // Restore original transition
      streamspaceContainer.style.transition = originalTransition;

      // Hide overlay
      if (streamspaceOverlay) {
        streamspaceOverlay.style.display = 'none';
      }
    });
  }

  // Listen for messages from the iframe (StreamSpace app)
  window.addEventListener('message', (event) => {
    // Ensure the message is from a trusted origin if deployed to production
    // For local development, 'event.origin' might be 'file://' or similar
    if (event.data && event.data.type === 'open-youtube-video') {
      if (window.electronAPI && window.electronAPI.openYoutubeVideo) {
        window.electronAPI.openYoutubeVideo(event.data.url);
      } else {
        console.warn("Electron API not available in main renderer process to open video.");
      }
    }
  });
})();