import mongoose from 'mongoose'


const orderItemsSchema = new mongoose.Schema({product: {type: mongoose.Schema.Types.ObjectId}, quantity: {type: Number, required: true}});

const orderSchema = new mongoose.Schema({
    orderPrice: {type: Number, required: true},
    customer: {type: mongoose.Schema.Type.ObjectId, required: true},
    orderItems: [orderItemsSchema],
    address: {type: String, required: true},
    status: {type: String, enum: ["PENDING", "CANCELLED", "DELIVERED"], default: "PENDING"},
}, {timestamps: true});

export const Order = mongoose.model('Order', orderSchema);