const { youtubeDl } = require("youtube-dl-exec");
const path = require("path");

async function downloadYouTubeVideo(url, outputPath) {
  try {
    const output = await youtubeDl(url, {
      output: path.join(outputPath, ".%(ext)s"),
      format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best", // Prioritize MP4, then best overall
    });
    console.log("Download complete:", output);
    return { success: true, message: "Download complete" };
  } catch (error) {
    console.error("Download failed:", error);
    return { success: false, message: error.message };
  }
}

module.exports = { downloadYouTubeVideo };
