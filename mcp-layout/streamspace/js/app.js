document.addEventListener("DOMContentLoaded", () => {
  const categories = document.querySelectorAll(".category");
  const menuBtn = document.querySelector(".menu-btn");
  const youtubeUrlInput = document.getElementById("youtube-url-input");
  const loadVideoBtn = document.getElementById("load-video-btn");

  categories.forEach((btn) => {
    btn.addEventListener("click", () => {
      categories.forEach((c) => c.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      document.body.classList.toggle("sidebar-hidden");
    });
  }

  if (loadVideoBtn) {
    loadVideoBtn.addEventListener("click", () => {
      const url = youtubeUrlInput.value;
      if (url) {
        // Send the URL to the parent window (main Electron renderer process)
        if (window.parent) {
          window.parent.postMessage({ type: 'open-youtube-video', url: url }, '*');
        } else {
          alert("Parent window not available to open video.");
        }
      } else {
        alert("Please enter a YouTube URL.");
      }
    });
  }
});