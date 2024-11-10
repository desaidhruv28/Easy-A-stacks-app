// models/user.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    stack_key: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);
module.exports = User;