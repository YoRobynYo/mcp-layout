
// Load the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player; // This will hold our YouTube player instance

function onYouTubeIframeAPIReady() {
  console.log("YouTube IFrame API is ready.");
  // The player will be created when a video is loaded
}

document.addEventListener("DOMContentLoaded", () => {
  const categories = document.querySelectorAll(".category");
  const youtubeUrlInput = document.getElementById("youtube-url-input");
  const loadVideoBtn = document.getElementById("load-video-btn");
  const menuBtn = document.querySelector(".menu-btn");

  categories.forEach((btn) => {
    btn.addEventListener("click", () => {
      categories.forEach((c) => c.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".content");

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      document.body.classList.toggle("sidebar-hidden");
    });
  }

  loadVideoBtn.addEventListener("click", () => {
    const url = youtubeUrlInput.value;
    const videoId = getYouTubeVideoId(url);

    if (videoId) {
      if (!player) {
        // Create the player if it doesn't exist
        player = new YT.Player('player', {
          height: '360',
          width: '640',
          videoId: videoId,
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      } else {
        // Load new video if player already exists
        player.loadVideoById(videoId);
      }
    } else {
      alert("Please enter a valid YouTube URL.");
    }
  });

  function getYouTubeVideoId(url) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[2].length == 11) {
      return match[2];
    } else {
      return null;
    }
  }

  function onPlayerReady(event) {
    event.target.playVideo();
  }

  function onPlayerStateChange(event) {
    // You can add logic here based on player state changes (e.g., video ended)
  }
});
