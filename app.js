const express = require("express");
const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");
const cors = require("cors");
const { corsOptions } = require("./utils/utils");

const customError = require("./errorHandler/customError");
const globalErrorMiddleware = require("./errorHandler/errorController")

require("dotenv").config();

// importing the Routes
const userRoute = require('./routes/userRoute')
const supervisorRoute = require('./routes/SupervisorRoutes')
const managerRoute = require('./routes/ManagerRoutes')

const app = express();
app.use(cors({
    credentials:true,
    origin:'http://localhost:5173'
}))

// middle-ware for the req.body
app.use(express.json());
// app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cookieparser());


// useing the routes
app.use('/user',userRoute)
app.use('/supervisor',supervisorRoute)
app.use('/manager',managerRoute)


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