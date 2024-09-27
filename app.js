const express = require("express");
const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");
const cors = require("cors");
const { corsOptions } = require("./utils/utils");

const customError = require("./errorHandler/customError");
const globalErrorMiddleware = require("./errorHandler/errorController")

require("dotenv").config();



const app = express();
app.use(cors());
// app.options('*', cors(corsOptions));

// importing the Routes
const userRoute = require('./routes/userRoute')
const shiftRoute = require('./routes/shiftRoute')
const linesRoute = require('./routes/linesRoute')
const jobsRoute = require('./routes/jobsRoutes')

// middle-ware for the req.body
app.use(express.json());
// app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cookieparser());


// using the routes
app.use('/user', userRoute)
app.use('/shift', shiftRoute)
app.use('/line', linesRoute)
app.use('/job', jobsRoute)



// default route  
app.all("*", (req, res, next)=>{
    return next(new customError(404,`url ${req.originalUrl} not found on the server!`))
})

// using global error handeling middleware
app.use(globalErrorMiddleware);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is listing on port http://localhost:${PORT}`);
})

// below link to invite team on the postman
// https://app.getpostman.com/join-team?invite_code=ea09a2afb2d40f833b500a38cb6ab7f0 


// command to start the XAMPP Terminal for Mysql and Apache Server 
// sudo /opt/lampp/manager-linux-x64.run


