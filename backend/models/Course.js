const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    creditHours: { type: Number, default: 3 },
    fullMarks: { type: Number, default: 100 },
    passMarks: { type: Number, default: 40 }
});

const semesterSchema = new mongoose.Schema({
    semester: { type: Number, required: true }, // 1, 2, 3...
    subjects: [subjectSchema]
});

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // e.g., "BIM"
    code: { type: String, required: true }, // e.g., "BIM"
    totalSemesters: { type: Number, default: 8 },
    curriculum: [semesterSchema] // Array of semesters with subjects
});

module.exports = mongoose.model('Course', courseSchema);
