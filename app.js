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
  origin: process.env.SERVER_URL, // Allow this origin
  credentials: true, // Allow cookies and credentials
}));

// importing the Routes
const userRoute = require('./routes/userRoute');
const shiftRoute = require('./routes/shiftRoute');
const linesRoute = require('./routes/linesRoute');
const jobsRoute = require('./routes/jobsRoutes');
const stationRoute = require("./routes/stationRoute");
const controllerFamilyRoute = require("./routes/controllerFamilyRoute");

// middle-ware for the req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cookieparser());

// using the routes
app.use('/api/user', userRoute);
app.use('/api/shift', shiftRoute);
app.use('/api/line', linesRoute);
app.use('/api/job', jobsRoute);
app.use('/api/station', stationRoute);
app.use('/api/controller_family', controllerFamilyRoute);


app.get('/api/get',(req,res) => {
    res.send({message:"hello back to nodejs"})
})

// default route  
app.all("*", (req, res, next) => {
    return next(new customError(404, `url ${req.originalUrl} not found on the server!`));
});

// using global error handling middleware
app.use(globalErrorMiddleware);

const PORT = process.env.PORT;

app.listen(PORT,() => {
    console.log(`Server is listening on port http://localhost:${PORT}`);
});
