import mongoose from 'mongoose';


const subTodoSchema = new mongoose.Schema({
    title: {type: String, required: true},
    complete: {type: Boolean, default: false},
    createdBy: {type: mongoose.Schema.Types.Objectid, ref: 'User'}
}, {timestamps: true});


export const SubTodo = mongoose.model('SubTodo', subTodoSchema);