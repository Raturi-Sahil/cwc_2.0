class ApiError extends Error {// class's name should start with a capital letter. 
    
    // constructor

    constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
            super(message);
            this.statusCode = statusCode;
            this.data = null;
            this.success = false;
            this.message = message;
            this.errors = errors;

            // we'll talk about this if else some other time, but it helps in seperation of the logic i guess. 
            if(stack) {
                this.stack = stack;
            } else {
                Error.captureStackTrace(this, this.constructor);
            }
    }
}

export {ApiError}