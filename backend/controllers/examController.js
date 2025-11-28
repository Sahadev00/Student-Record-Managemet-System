const ExamResult = require('../models/ExamResult');
const Course = require('../models/Course');

// Save bulk marks for a specific subject
exports.saveBulkMarks = async (req, res) => {
    const { courseId, semester, examType, subjectName, marksData, fullMarks = 100, passMarks = 40 } = req.body;

    try {
        // marksData is array of { studentId, marks }
        const updates = marksData.map(async (entry) => {
            const { studentId, marks } = entry;

            // Find existing exam record for this student/sem/examType
            let examRecord = await ExamResult.findOne({
                student: studentId,
                course: courseId,
                semester: semester,
                examType: examType
            });

            if (!examRecord) {
                examRecord = new ExamResult({
                    student: studentId,
                    course: courseId,
                    semester: semester,
                    examType: examType,
                    results: []
                });
            }

            // Check if subject already exists in results
            const subjectIndex = examRecord.results.findIndex(r => r.subject === subjectName);
            
            // Determine pass/fail
            const status = marks >= passMarks ? 'pass' : 'fail';

            if (subjectIndex > -1) {
                // Update existing
                examRecord.results[subjectIndex].marksObtained = marks;
                examRecord.results[subjectIndex].fullMarks = fullMarks;
                examRecord.results[subjectIndex].passMarks = passMarks;
                examRecord.results[subjectIndex].status = status;
            } else {
                // Add new
                examRecord.results.push({
                    subject: subjectName,
                    marksObtained: marks,
                    fullMarks: fullMarks,
                    passMarks: passMarks,
                    status: status
                });
            }

            return examRecord.save();
        });

        await Promise.all(updates);
        res.status(200).json({ message: 'Marks updated successfully' });

    } catch (error) {
        console.error('Error saving marks:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get marks for a specific subject (to pre-fill the table)
exports.getSubjectMarks = async (req, res) => {
    const { courseId, semester, examType, subjectName } = req.query;

    try {
        const results = await ExamResult.find({
            course: courseId,
            semester: semester,
            examType: examType,
            "results.subject": subjectName
        })
        .populate('student', 'name email')
        .lean();

        // Transform to simple map: studentId -> marks
        const marksMap = {};
        let meta = { fullMarks: 100, passMarks: 40 }; // Default
        
        if (results.length > 0) {
             // Get meta from the first record
             const firstRecord = results[0].results.find(r => r.subject === subjectName);
             if (firstRecord) {
                 meta.fullMarks = firstRecord.fullMarks;
                 meta.passMarks = firstRecord.passMarks;
             }
        }

        results.forEach(record => {
            if (!record.student) return; // Skip if student deleted
            const subjectResult = record.results.find(r => r.subject === subjectName);
            if (subjectResult) {
                marksMap[record.student._id] = subjectResult.marksObtained;
            }
        });

        res.json({ marks: marksMap, meta });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all exam results for a specific student
exports.getStudentResults = async (req, res) => {
    try {
        // Check if user is admin or the student themselves
        if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.studentId) {
            return res.status(403).json({ message: 'Not authorized to view these results' });
        }

        const results = await ExamResult.find({ student: req.params.studentId })
            .populate('course', 'name code')
            .sort({ semester: 1, examType: 1 })
            .lean();
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
