const videoUrlInput = document.getElementById('videoUrl');
const downloadBtn = document.getElementById('downloadBtn');
const progressBar = document.getElementById('progressBar');
const player = document.getElementById('player');

downloadBtn.addEventListener('click', async () => {
  const url = videoUrlInput.value.trim();
  if (!url) return alert("Please enter a YouTube URL");

  downloadBtn.disabled = true;
  progressBar.style.width = '0%';
  player.style.display = 'none';

  // Send URL to main process
  const result = await window.electronAPI.downloadYouTubeVideo(url);

  if (result.success && result.filePath) {
    // Show video in player
    player.src = result.filePath;
    player.style.display = 'block';
  } else {
    alert("Download failed: " + result.message);
  }

  downloadBtn.disabled = false;
});
