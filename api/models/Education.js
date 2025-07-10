const mongoose = require('mongoose');

const EducationCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    modules: [{
        title: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        type: {
            type: String,
            enum: ['video', 'audio', 'text'],
            required: true
        },
        url: {
            type: String
        },
        content: {
            type: String
        }
    }],
    quizzes: [{
        question: {
            type: String,
            required: true
        },
        answer: {
            type: String,
            required: true
        },
        options: {
            type: [String],
            required: true
        },
    }],
}, {
  timestamps: true
});

const EducationCategory = mongoose.model('EducationCategory', EducationCategorySchema);

module.exports = EducationCategory;