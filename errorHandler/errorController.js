// this is global error handeling controller or a middleware

const globalErrorMiddleware = (error, req, res, next) => {

    error.statusCode = error.statusCode || 500 ; 

    res.status(error.statusCode).json({
        success: false,
        message: error.message
    })

}

module.exports = globalErrorMiddleware;