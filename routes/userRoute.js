const express = require("express");
const router = express.Router();
const customError = require("../errorHandler/customError");
const connection = require("../utils/dbconnection");
const sendToken = require("../utils/jwtToken");
const checkToken = require("../middleware/checkToken")



// (1) user/adduser

router.post("/adduser", (req, res, next) => {
  const { employee_id, email, password, phone_number, qualification, experience, role } = req.body;

  if (!employee_id || !email || !role) {
    return next(new customError(400, "Missing required fields"));
  }

  const query = `INSERT INTO users_tbl (employee_id, email, password, phone_number, qualification, experience, role) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  connection.query(query, [employee_id, email, password, phone_number, qualification, experience, role], (err, results) => {
    if (err) {
      return next(new customError(500, `Database query error: ${err}`));
    }
    res.status(201).json({
      success: true,
      message: "User registered successfully"
    });
  });
},);


// (2) user/update

router.put("/updateuser/:employee_id", (req, res, next) => {

  const { employee_id } = req.params;
  const { email, password, phone_number, qualification, experience, role } = req.body;

  if (!employee_id) {
    return next(new customError(400, "Invalid employee ID"));
  }

  if (!email && !password && !phone_number && !qualification && !experience && !role) {
    return next(new customError(400, "At least one field is required for update"));
  }

  const query = `UPDATE users_tbl SET ? WHERE employee_id = ?`;

  const updates = {};

  if (email) updates.email = email;
  if (password) updates.password = password;
  if (phone_number) updates.phone_number = phone_number;
  if (qualification) updates.qualification = qualification;
  if (experience) updates.experience = experience;
  if (role) updates.role = role;

  connection.query(query, [updates, employee_id], (err, results) => {
    if (err) {
      return next(customError(500, `Database query error: ${err}`));
    }
    res.status(200).json({
      success: true,
      message: "User updated successfully"
    })
  })
});



// (3) user/login

router.post("/login", (req, res, next) => {
  const { employee_id, password } = req.body;


  if (!password || !employee_id) {
    return next(new Error("Employee ID and password are required."));
  }

  const query = `
    SELECT user_id, employee_id, email, password, phone_number, qualification, experience, role 
    FROM users_tbl 
    WHERE employee_id = ?
  `;

  connection.query(query, [employee_id], (err, results) => {

    if (err) return next(new customError(500, `Database query error: ${err}`));

    if (results.length === 0) return next(new customError(404, "User not found"));

    const user = results[0];

    if (user.password !== password) return next(new customError(401, "Invalid password, please try again"));

    sendToken(user, 200, res);
  });
});


// router.post("/login/:role", (req, res, next) => {
//   const role = req.params.role;
//   if (!role) {
//     return next(new customError(400, `Missing required params`))
//   }
//   login(req, res, next, role);
// })



// (4) user/logout
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

// (5) user/getuser/

router.get("/getuser", checkToken, (req, res, next) => {
  const user_id = req.user.user_id;
  const employee_id = req.user.employee_id;
  const query = `SELECT * FROM users_tbl WHERE employee_id = ? OR user_id = ?`;

  connection.query(query, [employee_id, user_id], (err, results) => {
    if (err) {
      return next(new customError(500, `Database query error: ${err}`));
    }
    if (results.length === 0) {
      return next(new customError(401, "User data not found"));
    }

    const userData = results[0];
    res.status(200).json({
      success: true,
      user: userData,
    });
  });
});



// (6) user/deleteuser/:employee_id

router.delete("/deleteuser/:employee_id", (req, res, next) => {
  const employee_id = req.params.employee_id;

  // Check if employee_id is valid
  if (!employee_id) {
    return next(new customError(400, "Invalid employee ID"));
  }

  const query = `SELECT * FROM users_tbl WHERE employee_id = ?`;

  connection.query(query, [employee_id], (err, results) => {
    if (err) {
      return next(new customError(500, `Database query error: ${err}`));
    }

    if (results.length === 0) {
      return next(new customError(404, "User  not found"));
    }

    const deleteUserQuery = `DELETE FROM users_tbl WHERE employee_id = ?`;

    connection.query(deleteUserQuery, [employee_id], (err, results) => {
      if (err) {
        return next(new customError(500, `Database query error: ${err}`));
      }
      res.status(200).json({
        success: true,
        message: "User  deleted successfully"
      });
    });
  });
});



// (7) user/getallusers

router.get("/getall", (req, res, next) => {
  
  const query = `SELECT * FROM users_tbl`;

  connection.query(query, (err, results) => {
    if (err) {
      return next(new customError(500, `Database query error: ${err}`));
    }

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: results
    });
  });
});




module.exports = router;
