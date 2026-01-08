const express = require('express');
const router = express.Router();
const { createCourse, getCourses, addSubject, deleteCourse, deleteSubject, updateCourse, updateSubject } = require('../controllers/courseController');

// Middleware to protect routes (we'll add this later properly, for now open)
// In real app: router.use(protect); router.use(admin);

router.route('/')
    .post(createCourse)
    .get(getCourses);

router.route('/:id')
    .delete(deleteCourse)
    .put(updateCourse);

router.route('/:id/subjects')
    .post(addSubject);

router.route('/:id/subjects/:semester/:subjectCode')
    .delete(deleteSubject)
    .put(updateSubject);

module.exports = router;
