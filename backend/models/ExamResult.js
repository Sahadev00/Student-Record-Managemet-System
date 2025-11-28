const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    semester: { type: Number, required: true },
    examType: { type: String, enum: ['pre-board', 'board'], required: true },
    results: [{
        subject: { type: String, required: true }, // Subject Name
        marksObtained: { type: Number, required: true },
        fullMarks: { type: Number, default: 100 },
        passMarks: { type: Number, default: 40 },
        status: { type: String, enum: ['pass', 'fail'], default: 'pass' }
    }],
    totalMarks: Number,
    percentage: Number,
    gpa: Number,
    remarks: String
}, { timestamps: true });

// Add indexes for performance
examResultSchema.index({ student: 1 });
examResultSchema.index({ course: 1, semester: 1, examType: 1 });

module.exports = mongoose.model('ExamResult', examResultSchema);
