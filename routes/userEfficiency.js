const express = require('express');
const router = express.Router();
const customError = require("../errorHandler/customError");
const connection = require("../utils/dbconnection");
const moment = require('moment');
const checkToken = require("../middleware/checkToken");

router.get("/getefficiency", (req, res, next) => {
    const { user_id } = req.body; // Retrieve user_id from the request body

    const query = `
        SELECT 
            j.job_id,
            j.user_id,
            j.line_id,
            cf.family_name,
            TIMESTAMPDIFF(SECOND, j.start_time, j.end_time) AS actual_time_seconds,
            TIME_TO_SEC(cf.production_time) AS expected_time_seconds,
            TIMESTAMPDIFF(SECOND, j.start_time, j.end_time) / 60 AS actual_time_minutes,
            TIME_TO_SEC(cf.production_time) / 60 AS expected_time_minutes
        FROM 
            jobs_tbl j
        JOIN 
            line_controller_family_link lcfl ON j.line_id = lcfl.line_id
        JOIN 
            controller_family_tbl cf ON lcfl.controller_family_id = cf.controller_family_id
        WHERE 
            lcfl.start_date <= j.job_date 
            AND (lcfl.end_date IS NULL OR lcfl.end_date >= j.job_date)
            AND j.user_id = ?
            AND j.status = 'completed'    
            AND j.end_date IS NOT NULL;       
    `;

    connection.query(query, [user_id], (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err}`));
        }

        // Optional: Format the job times or other fields as needed (e.g., format as minutes or seconds)
        results.forEach((job) => {
            job.actual_time_minutes = parseFloat(job.actual_time_minutes).toFixed(2);
            job.expected_time_minutes = parseFloat(job.expected_time_minutes).toFixed(2);
        });

        res.status(200).json({
            success: true,
            message: "Efficiency data retrieved successfully",
            data: results
        });
    });
});


module.exports = router;