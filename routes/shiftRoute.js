const express = require('express');
const router = express.Router();
const customError = require("../errorHandler/customError");
const connection = require("../utils/dbconnection");
const checkToken = require("../middleware/checkToken");


// (1) shift/addshift

router.post("/addshift", (req, res, next) => {
    const {shift_name, start_time, end_time} = req.body;

    if(!shift_name || !start_time || !end_time){
        return next(new customError(400, "Missing required fields"));
    }

    const timeFormat = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

    if (!timeFormat.test(start_time) || !timeFormat.test(end_time)) {
        return next(new customError(400, "Invalid time format. Expected format is HH:MM:SS"));
    }

    const query = `INSERT INTO shifts_tbl (shift_name, start_time, end_time) VALUES (?, ?, ?)`;

    connection.query(query, [shift_name, start_time, end_time], (err, results) => {
        if (err) {
          return next(new customError(500, `Database query error: ${err}`));
        }
        res.status(201).json({
          success: true,
          message: "Shift added successfully"
        });
      });
})

// (2) shift/updateshift/:shift_id

router.put("/updateshift/:shift_id", (req, res, next) => {
    const { shift_id } = req.params;
    const { shift_name, start_time, end_time } = req.body;
  
    if (!shift_id) {
      return next(new customError(400, "Missing required field: shift_id"));
    }
  
    if (!shift_name && !start_time && !end_time) {
      return next(new customError(400, "At least one field is required to update"));
    }
  
    const timeFormat = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  
    if (start_time && !timeFormat.test(start_time) || end_time && !timeFormat.test(end_time)) {
      return next(new customError(400, "Invalid start time format. Expected format is HH:MM:SS"));
    }
    
    const query = `UPDATE shifts_tbl SET ? WHERE shift_id = ?`;
  
    const updateData = {};
  
    if (shift_name) {
      updateData.shift_name = shift_name;
    }
  
    if (start_time) {
      updateData.start_time = start_time;
    }
  
    if (end_time) {
      updateData.end_time = end_time;
    }
  
    connection.query(query, [updateData, shift_id], (err, results) => {
      if (err) {
        return next(new customError(500, `Database query error: ${err}`));
      }
      res.status(200).json({
        success: true,
        message: "Shift updated successfully"
      });
    });
  });


// (3) shift/get/:shift_id

router.get("/get/:shift_id", (req, res, next) => {
    const { shift_id } = req.params; // Extract shift_id from URL parameters

    if (!shift_id) {
        return next(new customError(400, "Missing shift_id"));
    }

    const query = "SELECT * FROM shifts_tbl WHERE shift_id = ?";

    connection.query(query, [shift_id], (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err}`));
        }
        
        if (results.length === 0) {
            return next(new customError(404, "Shift not found"));
        }

        res.status(200).json({
            success: true,
            data: results[0] 
        });
    });
});

// (3) shift/getall

router.get("/getall", (req, res, next) => {
    
    const query = "SELECT * FROM shifts_tbl";

    connection.query(query, (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err}`));
        }
        
        if (results.length === 0) {
            return next(new customError(404, "Shifts not found"));
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });
});


module.exports = router;