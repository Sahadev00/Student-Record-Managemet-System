const Course = require('../models/Course');

// @desc    Create a new course (e.g., BIM)
// @route   POST /api/courses
// @access  Private (Admin)
exports.createCourse = async (req, res) => {
    const { name, code, totalSemesters } = req.body;

    try {
        const courseExists = await Course.findOne({ code });
        if (courseExists) {
            return res.status(400).json({ message: 'Course already exists' });
        }

        // Initialize curriculum with empty semesters
        const curriculum = [];
        for (let i = 1; i <= (totalSemesters || 8); i++) {
            curriculum.push({ semester: i, subjects: [] });
        }

        const course = await Course.create({
            name,
            code,
            totalSemesters: totalSemesters || 8,
            curriculum
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find({});
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add Subject to a Semester
// @route   POST /api/courses/:id/subjects
// @access  Private (Admin)
exports.addSubject = async (req, res) => {
    const { semester, name, code, creditHours, fullMarks, passMarks } = req.body;
    const courseId = req.params.id;

    // Validate code is only numbers
    if (!/^\d+$/.test(code)) {
        return res.status(400).json({ message: 'Subject code must contain only numbers' });
    }

    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const semesterIndex = course.curriculum.findIndex(s => s.semester === parseInt(semester));
        if (semesterIndex === -1) {
            return res.status(400).json({ message: 'Invalid semester' });
        }

        // Check if subject code already exists in ANY semester of this course
        let codeExists = false;
        course.curriculum.forEach(sem => {
            if (sem.subjects.find(s => s.code === code)) {
                codeExists = true;
            }
        });

        if (codeExists) {
            return res.status(400).json({ message: 'Subject code already exists in this course' });
        }

        course.curriculum[semesterIndex].subjects.push({
            name,
            code,
            creditHours: creditHours || 3,
            fullMarks: fullMarks || 100,
            passMarks: passMarks || 40
        });

        await course.save();
        res.json({ message: 'Subject added successfully', course });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
