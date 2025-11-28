const User = require('../models/User');
const Course = require('../models/Course');
const ExamResult = require('../models/ExamResult');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
    try {
        const [
            totalStudents,
            totalCourses,
            studentsPerCourse,
            avgMarksPerCourse,
            batchDistribution,
            examPerformance
        ] = await Promise.all([
            // 1. Total Counts
            User.countDocuments({ role: 'student' }),
            Course.countDocuments(),

            // 2. Students per Course
            User.aggregate([
                { $match: { role: 'student' } },
                {
                    $group: {
                        _id: '$course',
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'courses',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'courseDetails'
                    }
                },
                {
                    $project: {
                        name: { $arrayElemAt: ['$courseDetails.name', 0] },
                        count: 1
                    }
                }
            ]),

            // 3. Average Marks per Course
            ExamResult.aggregate([
                { $unwind: '$results' },
                {
                    $group: {
                        _id: '$course',
                        avgMarks: { $avg: '$results.marksObtained' }
                    }
                },
                {
                    $lookup: {
                        from: 'courses',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'courseDetails'
                    }
                },
                {
                    $project: {
                        name: { $arrayElemAt: ['$courseDetails.name', 0] },
                        avgMarks: { $round: ['$avgMarks', 1] }
                    }
                }
            ]),

            // 4. Batch Distribution
            User.aggregate([
                { $match: { role: 'student' } },
                {
                    $group: {
                        _id: '$batch',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: -1 } }
            ]),

            // 5. Exam Type Distribution
            ExamResult.aggregate([
                {
                    $group: {
                        _id: '$examType',
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        res.json({
            totalStudents,
            totalCourses,
            studentsPerCourse: studentsPerCourse.map(item => ({
                name: item.name || 'Unassigned',
                count: item.count
            })),
            avgMarksPerCourse: avgMarksPerCourse.map(item => ({
                name: item.name || 'Unknown',
                avgMarks: item.avgMarks
            })),
            batchDistribution: batchDistribution.map(item => ({
                batch: item._id || 'Unknown',
                count: item.count
            })),
            examPerformance: examPerformance.map(item => ({
                name: item._id === 'pre-board' ? 'Pre-Board' : 'Board',
                value: item.count
            }))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
