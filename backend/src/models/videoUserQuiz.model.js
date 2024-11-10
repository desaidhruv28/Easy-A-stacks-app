// models/videoUserQuiz.model.js
const mongoose = require('mongoose');

const videoUserQuizSchema = new mongoose.Schema({
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true },
  attempts: { type: Boolean, required: true },
  quizDate: { type: Date, default: Date.now }
});

const VideoUserQuiz = mongoose.model('VideoUserQuiz', videoUserQuizSchema);
module.exports = VideoUserQuiz;