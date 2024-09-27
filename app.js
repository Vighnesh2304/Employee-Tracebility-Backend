const express = require("express");
const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");
const cors = require("cors");
const customError = require("./errorHandler/customError");
const globalErrorMiddleware = require("./errorHandler/errorController");

require("dotenv").config();

const app = express();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173',  // Allow requests from your Vite frontend
    credentials: true,                // Allow credentials (cookies, auth tokens)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allow the necessary methods
}));

// importing the Routes
const userRoute = require('./routes/userRoute');
const shiftRoute = require('./routes/shiftRoute');
const linesRoute = require('./routes/linesRoute');
const jobsRoute = require('./routes/jobsRoutes');

// middle-ware for the req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cookieparser());

// using the routes
app.use('/user', userRoute);
app.use('/shift', shiftRoute);
app.use('/line', linesRoute);
app.use('/job', jobsRoute);

// default route  
app.all("*", (req, res, next) => {
    return next(new customError(404, `url ${req.originalUrl} not found on the server!`));
});

// using global error handling middleware
app.use(globalErrorMiddleware);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is listening on port http://localhost:${PORT}`);
});