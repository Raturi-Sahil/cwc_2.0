import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-Aggregate-Paginate-v2";

const videoSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    videoFile: { 
        type: String,// cloudinary URL
        required: true
    },
    thumbnail: {
        type: String,// cloudinary URL
        required: true
    },
    duration: {
        type: Number,// even this will also be received from the cloudinary URL
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        required: true,
        default: Date.now()
    }

}, {timestamps: true});

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);