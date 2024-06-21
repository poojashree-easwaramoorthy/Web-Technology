const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
    companyName: String,
    contactPerson: String,
    email: String,
    phone: String,
    jobPositions: String
});

const Recruiter = mongoose.model('Recruiter', recruiterSchema);

module.exports = Recruiter;
