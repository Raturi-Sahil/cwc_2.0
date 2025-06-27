import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    email: {type: String, unique: true, required: true},
    password: {type: String, unique: true, required: true, min: [5, "Password should be of minimum 5 characters"], max: 50},
    isActive: Boolean
}, {timestamps: true});


export const User = mongoose.model('User', userSchema);