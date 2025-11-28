const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/bulk', protect, admin, examController.saveBulkMarks);
router.get('/subject-marks', protect, admin, examController.getSubjectMarks);
router.get('/student/:studentId', protect, examController.getStudentResults);

module.exports = router;
