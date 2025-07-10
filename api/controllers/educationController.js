const Education = require('../models/Education');
const Quiz = require('../models/Quiz');
const { CustomError } = require('../utils/customErrors');

// Add Education Category
const addEducation = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            throw new CustomError('Education name is required', 400);
        }

        // Check if education category already exists
        const existingEducation = await Education.findOne({ name });
        if (existingEducation) {
            throw new CustomError('Education category already exists', 400);
        }

        const education = new Education({
            name,
            description,
            modules: [],
            quizzes: []
        });

        await education.save();

        res.status(201).json({
            success: true,
            message: 'Education category added successfully',
            data: education
        });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        } else {
            console.error('Error adding education:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
};

// Add Module to Education Category
const addModule = async (req, res) => {
    try {
        const { educationId } = req.params;
        const { title, description, type, url, content } = req.body;

        if (!title || !type) {
            throw new CustomError('Module title and type are required', 400);
        }

        if (!['video', 'audio', 'text'].includes(type)) {
            throw new CustomError('Module type must be video, audio, or text', 400);
        }

        // Find the education category
        const education = await Education.findById(educationId);
        if (!education) {
            throw new CustomError('Education category not found', 404);
        }

        // Check if module with same title already exists
        const existingModule = education.modules.find(module => module.title === title);
        if (existingModule) {
            throw new CustomError('Module with this title already exists in this education category', 400);
        }

        // Add the new module
        education.modules.push({
            title,
            description,
            type,
            url,
            content
        });

        await education.save();

        res.status(201).json({
            success: true,
            message: 'Module added successfully',
            data: education.modules[education.modules.length - 1]
        });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        } else {
            console.error('Error adding module:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
};

// Add Quiz to Education Category
const addQuiz = async (req, res) => {
    try {
        const { educationId } = req.params;
        const { question, answer, options } = req.body;

        if (!question || !answer || !options || !Array.isArray(options) || options.length < 2) {
            throw new CustomError('Question, answer, and at least 2 options are required', 400);
        }

        // Validate that the answer is one of the options
        if (!options.includes(answer)) {
            throw new CustomError('Answer must be one of the provided options', 400);
        }

        // Find the education category
        const education = await Education.findById(educationId);
        if (!education) {
            throw new CustomError('Education category not found', 404);
        }

        // Check if quiz with same question already exists
        const existingQuiz = education.quizzes.find(quiz => quiz.question === question);
        if (existingQuiz) {
            throw new CustomError('Quiz with this question already exists in this education category', 400);
        }

        // Add the new quiz
        education.quizzes.push({
            question,
            answer,
            options
        });

        await education.save();

        res.status(201).json({
            success: true,
            message: 'Quiz added successfully',
            data: education.quizzes[education.quizzes.length - 1]
        });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        } else {
            console.error('Error adding quiz:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
};

// Get all education categories
const getAllEducation = async (req, res) => {
    try {
        const education = await Education.find().select('-__v');
        
        res.status(200).json({
            success: true,
            data: education
        });
    } catch (error) {
        console.error('Error fetching education:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get education category by ID
const getEducationById = async (req, res) => {
    try {
        const { educationId } = req.params;
        
        const education = await Education.findById(educationId).select('-__v');
        if (!education) {
            throw new CustomError('Education category not found', 404);
        }

        res.status(200).json({
            success: true,
            data: education
        });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        } else {
            console.error('Error fetching education:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
};

// Update Education Category
const updateEducation = async (req, res) => {
    try {
        const { educationId } = req.params;
        const { name, description } = req.body;

        if (!name) {
            throw new CustomError('Education name is required', 400);
        }

        // Find the education category
        const education = await Education.findById(educationId);
        if (!education) {
            throw new CustomError('Education category not found', 404);
        }

        // Check if name is being changed and if it conflicts with existing education
        if (name !== education.name) {
            const existingEducation = await Education.findOne({ name });
            if (existingEducation) {
                throw new CustomError('Education category with this name already exists', 400);
            }
        }

        // Update the education category
        education.name = name;
        if (description !== undefined) {
            education.description = description;
        }

        await education.save();

        res.status(200).json({
            success: true,
            message: 'Education category updated successfully',
            data: education
        });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        } else {
            console.error('Error updating education:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
};

// Update Module in Education Category
const updateModule = async (req, res) => {
    try {
        const { educationId, moduleId } = req.params;
        const { title, description, type, url, content } = req.body;

        if (!title || !type) {
            throw new CustomError('Module title and type are required', 400);
        }

        if (!['video', 'audio', 'text'].includes(type)) {
            throw new CustomError('Module type must be video, audio, or text', 400);
        }

        // Find the education category
        const education = await Education.findById(educationId);
        if (!education) {
            throw new CustomError('Education category not found', 404);
        }

        // Find the module to update
        const moduleIndex = education.modules.findIndex(module => module._id.toString() === moduleId);
        if (moduleIndex === -1) {
            throw new CustomError('Module not found', 404);
        }

        // Check if title is being changed and if it conflicts with existing module
        if (title !== education.modules[moduleIndex].title) {
            const existingModule = education.modules.find(module => module.title === title);
            if (existingModule) {
                throw new CustomError('Module with this title already exists in this education category', 400);
            }
        }

        // Update the module
        education.modules[moduleIndex] = {
            ...education.modules[moduleIndex],
            title,
            description,
            type,
            url,
            content
        };

        await education.save();

        res.status(200).json({
            success: true,
            message: 'Module updated successfully',
            data: education.modules[moduleIndex]
        });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        } else {
            console.error('Error updating module:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
};

// Update Quiz in Education Category
const updateQuiz = async (req, res) => {
    try {
        const { educationId, quizId } = req.params;
        const { question, answer, options } = req.body;

        if (!question || !answer || !options || !Array.isArray(options) || options.length < 2) {
            throw new CustomError('Question, answer, and at least 2 options are required', 400);
        }

        // Validate that the answer is one of the options
        if (!options.includes(answer)) {
            throw new CustomError('Answer must be one of the provided options', 400);
        }

        // Find the education category
        const education = await Education.findById(educationId);
        if (!education) {
            throw new CustomError('Education category not found', 404);
        }

        // Find the quiz to update
        const quizIndex = education.quizzes.findIndex(quiz => quiz._id.toString() === quizId);
        if (quizIndex === -1) {
            throw new CustomError('Quiz not found', 404);
        }

        // Check if question is being changed and if it conflicts with existing quiz
        if (question !== education.quizzes[quizIndex].question) {
            const existingQuiz = education.quizzes.find(quiz => quiz.question === question);
            if (existingQuiz) {
                throw new CustomError('Quiz with this question already exists in this education category', 400);
            }
        }

        // Update the quiz
        education.quizzes[quizIndex] = {
            ...education.quizzes[quizIndex],
            question,
            answer,
            options
        };

        await education.save();

        res.status(200).json({
            success: true,
            message: 'Quiz updated successfully',
            data: education.quizzes[quizIndex]
        });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        } else {
            console.error('Error updating quiz:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
};

// Delete Education Category
const deleteEducation = async (req, res) => {
    try {
        const { educationId } = req.params;

        const education = await Education.findById(educationId);
        if (!education) {
            throw new CustomError('Education category not found', 404);
        }

        await Education.findByIdAndDelete(educationId);

        res.status(200).json({
            success: true,
            message: 'Education category deleted successfully'
        });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        } else {
            console.error('Error deleting education:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
};

// Delete Module from Education Category
const deleteModule = async (req, res) => {
    try {
        const { educationId, moduleId } = req.params;

        const education = await Education.findById(educationId);
        if (!education) {
            throw new CustomError('Education category not found', 404);
        }

        const moduleIndex = education.modules.findIndex(module => module._id.toString() === moduleId);
        if (moduleIndex === -1) {
            throw new CustomError('Module not found', 404);
        }

        education.modules.splice(moduleIndex, 1);
        await education.save();

        res.status(200).json({
            success: true,
            message: 'Module deleted successfully'
        });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        } else {
            console.error('Error deleting module:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
};

// Delete Quiz from Education Category
const deleteQuiz = async (req, res) => {
    try {
        const { educationId, quizId } = req.params;

        const education = await Education.findById(educationId);
        if (!education) {
            throw new CustomError('Education category not found', 404);
        }

        const quizIndex = education.quizzes.findIndex(quiz => quiz._id.toString() === quizId);
        if (quizIndex === -1) {
            throw new CustomError('Quiz not found', 404);
        }

        education.quizzes.splice(quizIndex, 1);
        await education.save();

        res.status(200).json({
            success: true,
            message: 'Quiz deleted successfully'
        });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        } else {
            console.error('Error deleting quiz:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
};

module.exports = {
    addEducation,
    addModule,
    addQuiz,
    getAllEducation,
    getEducationById,
    updateEducation,
    updateModule,
    updateQuiz,
    deleteEducation,
    deleteModule,
    deleteQuiz
};
