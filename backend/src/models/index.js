// models/index.js
const Video = require('./video.model');
const User = require('./user.model');
const VideoUserQuiz = require('./videoUserQuiz.model');
const { Payment, Transaction } = require('./payment.model');

module.exports = {
  Video,
  User,
  VideoUserQuiz,
  Payment,
  Transaction
};

