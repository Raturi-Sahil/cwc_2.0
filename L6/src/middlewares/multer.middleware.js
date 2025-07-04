import multer from "multer"


// We will use upload as a middleware, that will run before the controller of that endpoint runs and will add .fields to the req. 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

export const upload = multer({
    storage,
})