const express = require('express');
const router = express.Router();
const customError = require("../errorHandler/customError");
const connection = require("../utils/dbconnection");
const moment = require('moment');
const checkToken = require("../middleware/checkToken");


// (1) job/addjob

router.post("/addjob", (req, res, next) => {
    const { line_id, user_id, shift_id, job_date } = req.body;

    if (!line_id || !user_id || !shift_id) {
        return next(new customError(400, "Missing required fields"));
    }

    let jobDateValue = null;

    if (job_date) {
        jobDateValue = moment(job_date, 'MM/DD/YYYY, h:mm A').format('YYYY-MM-DD HH:mm:ss');
    } else {
        jobDateValue = new Date(); // set current timestamp if job_date is not provided
    }

    const query = `INSERT INTO jobs_tbl (line_id, user_id, shift_id, job_date) VALUES (?, ?, ?, ?)`;

    connection.query(query, [line_id, user_id, shift_id, jobDateValue], (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err}`));
        }
        res.status(201).json({
            success: true,
            message: "Job created successfully"
        });
    });
});


// (2) job/getall

router.get("/getall", (req, res, next) => {
    const query = `
    SELECT 
      j.job_id,
      l.line_name AS line_name,
      u.employee_id AS employee_id,
      s.shift_name AS shift_name,
      j.job_date
    FROM 
      jobs_tbl j
      INNER JOIN lines_tbl l ON j.line_id = l.line_id
      INNER JOIN users_tbl u ON j.user_id = u.user_id
      INNER JOIN shifts_tbl s ON j.shift_id = s.shift_id
  `;

    connection.query(query, (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err}`));
        }

        // Convert the job_date to the original format
        results.forEach((job) => {
            job.job_date = moment(job.job_date).format('MM/DD/YYYY, h:mm A');
        });

        res.status(200).json({
            success: true,
            message: "Jobs retrieved successfully",
            data: results
        });
    });
});


// (3) job/updatejob/:job_id

router.put("/updatejob/:job_id", (req, res, next) => {
    const job_id = req.params.job_id;
    const { line_id, user_id, shift_id, job_date } = req.body;

    if (!job_id) {
        return next(new customError(400, "Invalid job ID"));
    }

    if (!line_id || !user_id || !shift_id) {
        return next(new customError(400, "Missing required fields"));
    }

    let jobDateValue = null;

    if (job_date) {
        jobDateValue = moment(job_date, 'MM/DD/YYYY, h:mm A').format('YYYY-MM-DD HH:mm:ss');
    } else {
        jobDateValue = new Date();
    }

    const query = `
      UPDATE jobs_tbl
      SET line_id = ?, user_id = ?, shift_id = ?, job_date = ?
      WHERE job_id = ?
    `;

    connection.query(query, [line_id, user_id, shift_id, jobDateValue, job_id], (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err}`));
        }

        if (results.affectedRows === 0) {
            return next(new customError(404, "Job not found"));
        }

        res.status(200).json({
            success: true,
            message: "Job updated successfully"
        });
    });
});


// (4) job/updatejob/:job_id

router.delete("/delete/:job_id", (req, res, next) => {
    const job_id = req.params.job_id;

    if (!job_id) {
        return next(new customError(400, "Invalid job ID"));
    }

    const query = `
      DELETE FROM jobs_tbl
      WHERE job_id = ?
    `;

    connection.query(query, [job_id], (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err}`));
        }

        if (results.affectedRows === 0) {
            return next(new customError(404, "Job not found"));
        }

        res.status(200).json({
            success: true,
            message: "Job deleted successfully"
        });
    });
});

module.exports = router;