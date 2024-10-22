const express = require('express');
const router = express.Router();
const customError = require("../errorHandler/customError");
const connection = require("../utils/dbconnection");
const checkToken = require("../middleware/checkToken");
const moment = require("moment")

// Add a controller family

router.post("/add", (req, res, next) => {

    const { family_name, description, production_time } = req.body;

    if (!family_name || !production_time) {
        return next(new customError(400, "Missing required fields: family_name or production_time"));
    }

    const formattedProductionTime = moment(production_time, 'HH:mm:ss').format('HH:mm:ss');

    if (!formattedProductionTime) {
        return next(new customError(400, "Invalid production_time format. Please use HH:mm:ss"));
    }

    const query = `INSERT INTO controller_family_tbl (family_name, description, production_time) VALUES (?, ?, ?)`;

    connection.query(query, [family_name, description, production_time], (err, results) => {
        if (err) {
            return next(customError(500, `Database query error: ${err}`));
        }

        res.status(200).json({
            success: true,
            message: "New Controller Family Added"
        })
    })
});

// Get all controller families 

router.get("/getall", (req, res, next) => {

    const query = `
        SELECT * 
        FROM controller_family_tbl`;

    connection.query(query, (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err}`));
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No Controller Families found"
            });
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });
});

// Update Controller Family 

router.put("/update/:controller_family_id", (req, res, next) => {
    const { family_name, description, production_time } = req.body;
    const { controller_family_id } = req.params;

    if (!family_name && !description && !production_time) {
        return next(new customError(400, "At least one of the fields must be provided: family_name, description, or production_time"));
    }

    const updates = [];
    const values = [];

    if (family_name) {
        updates.push("family_name = ?");
        values.push(family_name);
    }

    if (description) {
        updates.push("description = ?");
        values.push(description);
    }

    if (production_time) {

        const formattedProductionTime = moment(production_time, 'HH:mm:ss').format('HH:mm:ss');

        if (!moment(production_time, 'HH:mm:ss', true).isValid()) {
            return next(new customError(400, "Invalid production_time format. Please use HH:mm:ss"));
        }

        updates.push("production_time = ?");
        values.push(formattedProductionTime);
    }

    values.push(controller_family_id);

    const query = `
        UPDATE controller_family_tbl 
        SET ${updates.join(', ')} 
        WHERE controller_family_id = ?
    `;

    connection.query(query, values, (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err}`));
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Controller Family not found for the given controller_family_id"
            });
        }

        res.status(200).json({
            success: true,
            message: "Controller Family updated successfully"
        });
    });
});

// Get a (Sinlgle) Controller Family

router.get("/get/:controller_family_id", (req, res, next) => {
    const { controller_family_id } = req.params;

    const query = `SELECT * FROM controller_family_tbl WHERE controller_family_id = ?`

    connection.query(query, [controller_family_id], (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err}`));
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Controller Family not found for the given controller_family_id"
            });
        }

        res.status(200).json({
            success: true,
            data: results[0]
        });
    });
});

// Delete a Controller Family

router.delete("/delete/:controller_family_id", (req, res, next) => {
    const { controller_family_id } = req.params;

    const query = `DELETE FROM controller_family_tbl WHERE controller_family_id = ?`;

    connection.query(query, [controller_family_id], (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err}`));
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Controller Family not found for the given line_id"
            });
        }

        res.status(200).json({
            success: true,
            message: "Controller Family deleted successfully"
        });
    });
});


// Assign a Controller_Family to a Line 

router.post("/assign", (req, res, next) => {
    const { line_id, controller_family_id, start_date, end_date } = req.body;

    // Check for required fields
    if (!line_id || !controller_family_id || !start_date || !end_date) {
        return next(new customError(400, "Missing required fields: line_id, controller_family_id, start_date, or end_date"));
    }

    // Validate and format start_date and end_date using Moment.js
    const formattedStartDate = moment(start_date).format('YYYY-MM-DD HH:mm:ss');
    const formattedEndDate = moment(end_date).format('YYYY-MM-DD HH:mm:ss');

    // Check if the dates are valid
    if (!moment(start_date, moment.ISO_8601, true).isValid() || !moment(end_date, moment.ISO_8601, true).isValid()) {
        return next(new customError(400, "Invalid date format. Please use a valid date format (e.g., YYYY-MM-DD HH:mm:ss)"));
    }

    // Check if the family is already assigned to a line
    const query = `
        SELECT line_id 
        FROM line_controller_family_link 
        WHERE controller_family_id = ? AND (end_date IS NULL OR end_date > NOW())
    `;

    connection.query(query, [controller_family_id], (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err}`));
        }

        if (results.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Controller Family ${controller_family_id} is already assigned to Line ${results[0].line_id}`,
                data: null
            });
        }

        // SQL query to insert the assignment
        const insertQuery = `
            INSERT INTO line_controller_family_link (line_id, controller_family_id, start_date, end_date) 
            VALUES (?, ?, ?, ?)
        `;

        connection.query(insertQuery, [line_id, controller_family_id, formattedStartDate, formattedEndDate], (err, results) => {
            if (err) {
                return next(new customError(500, `Database query error: ${err}`));
            }

            res.status(201).json({
                success: true,
                message: "Controller Family assigned to Line successfully",
                data: {
                    line_id,
                    controller_family_id,
                    start_date: formattedStartDate,
                    end_date: formattedEndDate
                }
            });
        });
    });
});




module.exports = router;