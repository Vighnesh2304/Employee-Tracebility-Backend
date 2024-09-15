class customError extends Error {
    constructor(statusCode, message){
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, constructor);
    }
}

module.exports = customError;