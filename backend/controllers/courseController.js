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

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        await course.deleteOne();
        res.json({ message: 'Course removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a subject from a semester
// @route   DELETE /api/courses/:id/subjects/:semester/:subjectCode
// @access  Private (Admin)
exports.deleteSubject = async (req, res) => {
    const { id, semester, subjectCode } = req.params;
    try {
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const semesterIndex = course.curriculum.findIndex(s => s.semester === parseInt(semester));
        if (semesterIndex === -1) {
            return res.status(400).json({ message: 'Invalid semester' });
        }

        const subjectIndex = course.curriculum[semesterIndex].subjects.findIndex(s => s.code === subjectCode);
        if (subjectIndex === -1) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        course.curriculum[semesterIndex].subjects.splice(subjectIndex, 1);
        await course.save();
        res.json({ message: 'Subject removed', course });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (Admin)
exports.updateCourse = async (req, res) => {
    const { name, code, totalSemesters } = req.body;
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        course.name = name || course.name;
        course.code = code || course.code;
        
        // If totalSemesters is changed, we might need to adjust curriculum array
        if (totalSemesters && totalSemesters !== course.totalSemesters) {
            if (totalSemesters > course.totalSemesters) {
                // Add new semesters
                for (let i = course.totalSemesters + 1; i <= totalSemesters; i++) {
                    course.curriculum.push({ semester: i, subjects: [] });
                }
            } else {
                // Remove semesters (only if they are empty to be safe, or just warn? For now, let's just slice)
                // Ideally we should check if there are subjects/students in those semesters
                course.curriculum = course.curriculum.slice(0, totalSemesters);
            }
            course.totalSemesters = totalSemesters;
        }

        await course.save();
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a subject
// @route   PUT /api/courses/:id/subjects/:semester/:subjectCode
// @access  Private (Admin)
exports.updateSubject = async (req, res) => {
    const { id, semester, subjectCode } = req.params;
    const { name, code, creditHours, fullMarks, passMarks } = req.body;

    try {
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const semesterIndex = course.curriculum.findIndex(s => s.semester === parseInt(semester));
        if (semesterIndex === -1) {
            return res.status(400).json({ message: 'Invalid semester' });
        }

        const subjectIndex = course.curriculum[semesterIndex].subjects.findIndex(s => s.code === subjectCode);
        if (subjectIndex === -1) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Update fields
        const subject = course.curriculum[semesterIndex].subjects[subjectIndex];
        subject.name = name || subject.name;
        subject.creditHours = creditHours || subject.creditHours;
        subject.fullMarks = fullMarks || subject.fullMarks;
        subject.passMarks = passMarks || subject.passMarks;
        
        // If code is changing, check for uniqueness
        if (code && code !== subjectCode) {
             // Check if new code exists elsewhere
             let codeExists = false;
             course.curriculum.forEach(sem => {
                 if (sem.subjects.find(s => s.code === code)) {
                     codeExists = true;
                 }
             });
     
             if (codeExists) {
                 return res.status(400).json({ message: 'Subject code already exists in this course' });
             }
             subject.code = code;
        }

        await course.save();
        res.json({ message: 'Subject updated', course });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
