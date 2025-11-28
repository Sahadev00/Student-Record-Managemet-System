const express = require('express');
const router = express.Router();
const { createCourse, getCourses, addSubject } = require('../controllers/courseController');

// Middleware to protect routes (we'll add this later properly, for now open)
// In real app: router.use(protect); router.use(admin);

router.route('/')
    .post(createCourse)
    .get(getCourses);

router.route('/:id/subjects')
    .post(addSubject);

module.exports = router;
