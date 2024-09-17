const express = require('express');
const router = express.Router();
const customError = require("../errorHandler/customError");
const connection = require("../utils/dbconnection");
const checkToken = require("../middleware/checkToken");


// (1) line/addline

router.post("/addline", (req, res, next) => {
    const {line_number, line_name, line_description} = req.body;

    if(!line_number || !line_name){
        return next(new customError(400, "Missing required fields"));
    }

    const query = `INSERT INTO lines_tbl (line_number, line_name, line_description) VALUES (?, ?, ?)`;

    connection.query(query, [line_number, line_name, line_description], (err, results) => {
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


module.exports = router;

