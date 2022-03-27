const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true
  },
  firstName: {
    type: String,
    trim: true,
    required: true
  },
  lastName: {
    type: String,
    trim: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  termsOfService: {
    type: Boolean,
    required: true
  },
  settings: { }
}, {
  timestamps: true
});

// Compares given password by generating hash and comparing to Mongo
userSchema.methods.verifyPassword = (pwd, userPwd) => bcrypt.compareSync(pwd, userPwd);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
