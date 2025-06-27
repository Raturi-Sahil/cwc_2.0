import mongoose from 'mongoose'

const hospitalSchema = new mongoose.Schema({
    hospital: {type: mongoose.Schema.Type.ObjectId, required: true},
    hours: {type: Number, required: true},
});

const doctorSchema = new mongoose.Schema({
    name: {type: String, required: true},
    salary: {type: String, required: true},
    qualifications: {type: String, required: true},
    experienceInYears: {type: Number, required: true},
    worksInHospitals: [hospitalSchema] 
}, {timestamps: true});

export const Doctor = mongoose.model('Doctor', doctorSchema);