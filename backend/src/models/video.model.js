// models/video.model.js
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  video_url: { type: String, required: true },
  video_title: { type: String, required: true },
  video_duration: { type: Number, required: true },
  video_thumbnail: { type: String, required: true }
});

const Video = mongoose.model('Video', videoSchema);
module.exports = Video;