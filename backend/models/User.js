const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'student'],
        default: 'student'
    },
    // Academic Info (For Students)
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    batch: {
        type: String // e.g., "2078"
    },
    // currentSemester: { type: Number }, // Deprecated: Calculated dynamically or irrelevant for static record
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

// Add indexes for performance
userSchema.index({ role: 1 });
userSchema.index({ course: 1 });
userSchema.index({ batch: 1 });

module.exports = mongoose.model('User', userSchema);
