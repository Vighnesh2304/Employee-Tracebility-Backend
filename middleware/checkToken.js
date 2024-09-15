const jwt = require("jsonwebtoken");
const connection = require("../utils/dbconnection");
const customError = require("../errorHandler/customError");


const isSupervisor = (req, res, next) => {
    if (req.user.role !== 'supervisor') {
        return res.status(403).json({ message: 'Unauthorized: User is not a supervisor' });
    }
    
    next();
};


const isManager = (req, res, next) => {
    if (req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Unauthorized: User is not a supervisor' });
    }
    
    next();
};



const checkToken = (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new customError(401, "Please Login to access this resource"));
    }

    const decodeData = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decodeData.user_id;
    const employee_id = decodeData.employee_id;

    const query = `SELECT user_id, employee_id, role FROM user_tbl WHERE employee_id = ? OR user_id = ?`;

connection.query(query, [employee_id, user_id], (err, results) => {
    if (err) {
        return next(new customError(500, `Database query error: ${err}`))
    }
    if (results.length === 0) {
        return next(new customError(401, "Unauthorized access login again to access this resource"))
    }
    req.user = results[0];
    next();
})

}


module.exports = checkToken,isSupervisor,isManager