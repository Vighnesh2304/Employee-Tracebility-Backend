const express = require('express');
const router = express.Router();
const customError = require("../errorHandler/customError");
const connection = require("../utils/dbconnection");
const checkToken = require("../middleware/checkToken");


// (1) line/addline

router.post("/addline", (req, res, next) => {
    const {line_name, line_description} = req.body;

    if(!line_name){
        return next(new customError(400, "Missing required fields"));
    }

    const query = `INSERT INTO lines_tbl (line_name, line_description) VALUES ( ?, ?)`;

    connection.query(query, [line_name, line_description], (err, results) => {
        if (err) {
          return next(new customError(500, `Database query error: ${err}`));
        }
        res.status(201).json({
          success: true,
          message: "line added successfully"
        });
      });
})

// (2) line/getall

router.get("/getall", (req, res, next) => {
    
    const query = "SELECT * FROM lines_tbl";

    connection.query(query, (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err}`));
        }
        
        if (results.length === 0) {
            return next(new customError(404, "lines not found"));
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });
});

// (2) line/updateline/:line_id

router.put("/updateline/:line_id", (req, res, next) => {
    const { line_id } = req.params;
    const {line_name, line_description } = req.body;
  
    if (!line_id) {
      return next(new customError(400, "Line ID is required"));
    }
  
    if (!line_name && !line_description) {
      return next(new customError(400, "At least one field is required to update"));
    }
  
    const query = `UPDATE lines_tbl SET ? WHERE line_id = ?`;
  
    const updates = {};
    if (line_name) updates.line_name = line_name;
    if (line_description) updates.line_description = line_description;
  
    connection.query(query, [updates, line_id], (err, results) => {
      if (err) {
        return next(new customError(500, `Database query error: ${err}`));
      }
      res.status(200).json({
        success: true,
        message: "Line updated successfully"
      });
    });
  });

  // (3) line/get/:line_id
router.get("/get/:line_id", (req, res, next) => {
  const { line_id } = req.params;

  if (!line_id) {
      return next(new customError(400, "Line ID is required"));
  }

  const query = "SELECT * FROM lines_tbl WHERE line_id = ?";

  connection.query(query, [line_id], (err, results) => {
      if (err) {
          return next(new customError(500, `Database query error: ${err}`));
      }

      if (results.length === 0) {
          return next(new customError(404, "Line not found"));
      }

      res.status(200).json({
          success: true,
          data: results[0] // Send the first (and should be only) line object
      });
  });
});



router.delete("/deleteline/:line_id", (req, res, next) => {
  const { line_id } = req.params;

  if (!line_id) {
      return next(new customError(400, "Line ID is required"));
  }

  const query = `DELETE FROM lines_tbl WHERE line_id = ?`;

  connection.query(query, [line_id], (err, results) => {
      if (err) {
          return next(new customError(500, `Database query error: ${err}`));
      }

      if (results.affectedRows === 0) {
          return next(new customError(404, "Line not found"));
      }

      res.status(200).json({
          success: true,
          message: "Line deleted successfully"
      });
  });
});


module.exports = router;

