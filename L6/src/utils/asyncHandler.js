const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);// Here gpt says i also have to provide an error handler for this, express doens't automatically do it. 
}

export {asyncHandler}
/**
 * Refer to CWB8 for more info
 * 
 * 
 * This is similar to the function aboved
 * const asyncHandler = (fn) => {
 *      return function(req, res, next) {
 *          return Promise.resolve(fn(req, res, next)).catch(next);
 *      }
 *  }
 * 
 * 
 * Another way to write the same above function using try-catch
 * 
 * const asyncHandler = (fn) => (req, res, next) => {
 *      try {
 *        await fn(req, res, next);
 *      
 *      } catch(error) {
 *          res.status(error.code || 500).json({success: false, message: error.message});
 *      }
 *  }
 */