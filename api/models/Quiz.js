const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  quiz: [{
    moduleName: {
        type: String,
        required: [true, 'Module Name is required'],
        trim: true
    },
    passed: {
        type: Boolean,
        default: false
    },
    score: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

quizSchema.index({ userId: 1 }, { unique: true });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;