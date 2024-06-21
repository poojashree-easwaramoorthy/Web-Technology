const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    degree: { type: String, required: true },
    year: { type: String, required: true },
    resume: { type: String, required: true }
});

module.exports = mongoose.model('Student', studentSchema);
