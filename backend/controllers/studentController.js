const User = require('../models/User');
const ExamResult = require('../models/ExamResult');

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin)
exports.getStudents = async (req, res) => {
    try {
        const { course, batch, semester } = req.query;
        const query = { role: 'student' };

        if (course) query.course = course;
        if (batch) query.batch = batch;
        // if (semester) query.currentSemester = semester; // Removed semester filtering as it's no longer stored

        const students = await User.find(query)
            .populate('course', 'name code')
            .select('-password')
            .lean(); // Optimize for read-only
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get unique batches
// @route   GET /api/students/batches
// @access  Private
exports.getBatches = async (req, res) => {
    try {
        const batches = await User.distinct('batch', { role: 'student' });
        // Sort batches descending (newest first)
        batches.sort().reverse();
        res.json(batches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
exports.getStudentById = async (req, res) => {
    try {
        // Check if user is admin or the student themselves
        if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ message: 'Not authorized to view this profile' });
        }

        const student = await User.findById(req.params.id)
            .populate('course', 'name code totalSemesters curriculum')
            .select('-password')
            .lean();
        
        if (student) {
            res.json(student);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
exports.deleteStudent = async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        // Delete associated exam results
        await ExamResult.deleteMany({ student: req.params.id });

        await User.deleteOne({ _id: req.params.id });
        res.json({ message: 'Student and associated records removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin)
exports.updateStudent = async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        student.name = req.body.name || student.name;
        student.email = req.body.email || student.email;
        student.course = req.body.course || student.course;
        student.batch = req.body.batch || student.batch;
        // student.currentSemester = req.body.currentSemester || student.currentSemester; // Removed

        const updatedStudent = await student.save();
        res.json(updatedStudent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
