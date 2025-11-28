const express = require('express');
const router = express.Router();
const { getStudents, deleteStudent, updateStudent, getStudentById, getBatches } = require('../controllers/studentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getStudents);

router.get('/batches', protect, getBatches);

router.route('/:id')
    .get(protect, getStudentById)
    .delete(protect, admin, deleteStudent)
    .put(protect, admin, updateStudent);

module.exports = router;
