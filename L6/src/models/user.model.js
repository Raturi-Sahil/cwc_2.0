import mongoose, { Schema } from "mongoose"; // another format to import mongoose and schema.
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username: {type: String, unique: true, required: true, lowercase: true, trim: true, index: true}, // index: true provides faster lookups in the db.
    email: {type: String, unique: true, required: true, lowercase: true, trim: true},
    fullName: {type: String, required: true, lowercase: true, trim: true, index: true},
    avatar: {type: String , required: true}, // cloudinary 
    coverImage: {type: String}, // cloudinary 
    watchHistory: [{type: Schema.Types.ObjectId, ref: "Video"}],
    password: {type: String, required: [true, "Password is required"]},
    refreshToken: {type: String}
}, {timestamps: true}); 

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next(); 
    // if we don't check whether password is modified or not, then we would end up updating the password eveytime something is saved in the database even if it's some other filed and not password.

    this.password = await bcrypt.hash(this.password, 10);// 10 is the number of rounds.
    next(); 
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password); // gotta await on this compare function.
}

userSchema.methods.generateAccessToken = function() { // No need to write async await cuz this .sign function is fast.  
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName,
            username: this.username,

        }, 
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function() { // No need to write async await cuz this .sign function is fast.  
    return jwt.sign(
        {
            _id: this._id, // refresh toke doesn't contain all that much info in it.

        }, 
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema);