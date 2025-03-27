const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const request = require("request");

const app = express();
const port = process.env.PORT || 3001;

const YT_DLP_PATH = path.join(__dirname, process.platform === "win32" ? "yt-dlp.exe" : "./yt-dlp");

app.get("/stream", (req, res) => {
    const { videoId } = req.query;
    if (!videoId) return res.status(400).send("Video ID is required");

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    exec(`${YT_DLP_PATH} -f "best[ext=mp4]" -g "${videoUrl}"`, (error, stdout) => {
        if (error) return res.status(500).send("Failed to extract video");

        const streamUrl = stdout.trim();
        console.log("Streaming from:", streamUrl);

        res.setHeader("Content-Type", "video/mp4");
        request(streamUrl).pipe(res); // Proxy the stream directly to client
    });
});

app.listen(port, () => console.log(`🚀 Streaming API running on port ${port}!`));
