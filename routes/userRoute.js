const express = require("express");
const router = express.Router();
const customError = require("../errorHandler/customError");
const connection = require("../utils/dbconnection");
const sendToken = require("../utils/jwtToken");
const checkToken = require("../middleware/checkToken")



// (1) user/adduser

router.post("/adduser", (req, res, next) => {
  const { employee_id, first_name, last_name, email, password, phone_number, address, date_of_joining, role, department, other_info, documents } = req.body;

  if (!employee_id || !first_name || !last_name || !email || !date_of_joining || !role) {
    return next(new customError(400, "Missing required fields"));
  }

  const query = `INSERT INTO user_tbl (employee_id, first_name, last_name, email, password, phone_number, address, date_of_joining, role, department, other_info, documents) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  connection.query(query, [employee_id, first_name, last_name, email, password, phone_number, address, date_of_joining, role, department, other_info, documents], (err, results) => {
    if (err) {
      return next(new customError(500, `Database query error: ${err}`));
    }
    res.status(201).json({
      success: true,
      message: "User registered successfully"
    });
  });
});


// (2) user/login

const login = (req, res, next, role) => {
  const { employee_id, email, password } = req.body;

  if (!password) return next(new Error("Please enter password"));
  if (!employee_id && !email) return next(new Error('Employee ID or email required.'));
  if (!['supervisor', 'manager', 'worker'].includes(role)) return next(new Error('Invalid role.'));

  const query = `SELECT user_id, employee_id, first_name, password, role FROM user_tbl WHERE role = ? AND (employee_id = ? OR email = ?)`;

  connection.query(query, [role, employee_id, email], (err, results) => {
    if (err) return next(new Error(`Database query error: ${err}`));
    if (results.length === 0) return next(new Error("User not found"));

    const user = results[0];
    if (user.password !== password) return next(new Error("Invalid password, please try again"));

    sendToken(user, 200, res);
  });
};



router.post("/login/:role", (req, res, next) => {
  const role = req.params.role;
  if (!role) {
    return next(new customError(400, `Missing required params`))
  }
  login(req, res, next, role);
})

// (3) user/logout
router.get('/logout', (req, res, next) => {

  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });

});

// (4) user/getuser/

router.get("/getuser", checkToken, (req, res, next) => {
  const user_id = req.user.user_id;
  const employee_id = req.user.employee_id;

  const query = `SELECT * FROM user_tbl WHERE employee_id = ? OR user_id = ?`;

  connection.query(query, [employee_id, user_id], (err, results) => {
    if (err) {
      return next(new customError(500, `Database query error: ${err}`))
    }
    if (results.length === 0) {
      return next(new customError(401, "User data not found"))
    }
    userData = results[0];

    res.status(200).json({
      success: true,
      user: userData
    })
  })

})



module.exports = router;
