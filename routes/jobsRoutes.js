const express = require('express');
const router = express.Router();
const customError = require("../errorHandler/customError");
const connection = require("../utils/dbconnection");
const moment = require('moment');
const checkToken = require("../middleware/checkToken");


// (1) job/addjob

router.post("/addjob", (req, res, next) => {
    const { station_id, line_id, user_id, shift_id, job_date } = req.body;

    if (!station_id || !line_id || !user_id || !shift_id) {
        return next(new customError(400, "Missing required fields"));
    }

    console.log(station_id, line_id, user_id, shift_id);

    let jobDateValue = null;

    if (job_date) {
        jobDateValue = moment(job_date, 'YYYY-MM-DDTHH:mm').format('YYYY-MM-DD HH:mm:ss');
    } else {
        jobDateValue = new Date(); // set current timestamp if job_date is not provided
    }

    const query = `INSERT INTO jobs_tbl (station_id, line_id, user_id, shift_id, job_date) VALUES (?, ?, ?, ?, ?)`;

    connection.query(query, [station_id, line_id, user_id, shift_id, jobDateValue], (err, results) => {
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
      u.employee_id,
      u.employee_name,
      st.station_name,
      l.line_name,
      s.shift_name,
      j.job_date,
      j.status
    FROM 
      jobs_tbl j
      INNER JOIN stations_tbl st ON j.station_id = st.station_id
      INNER JOIN lines_tbl l ON j.line_id = l.line_id
      INNER JOIN users_tbl u ON j.user_id = u.user_id
      INNER JOIN shifts_tbl s ON j.shift_id = s.shift_id
    WHERE
      j.end_date IS null
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
    const { station_id, line_id, user_id, shift_id, job_date } = req.body;

    if (!job_id) {
        return next(new customError(400, "Invalid job ID"));
    }

    // Check if at least one field has been provided for update
    if (!station_id && !line_id && !user_id && !shift_id && !job_date) {
        return next(new customError(400, "No fields to update"));
    }

    console.log(job_date);

    let jobDateValue = null;

    if (job_date) {
        jobDateValue = moment(job_date, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
    }

    // Only update fields that are present in the request
    const updates = [];
    const values = [];

    if (station_id) {
        updates.push("station_id = ?");
        values.push(station_id);
    }
    if (line_id) {
        updates.push("line_id = ?");
        values.push(line_id);
    }
    if (user_id) {
        updates.push("user_id = ?");
        values.push(user_id);
    }
    if (shift_id) {
        updates.push("shift_id = ?");
        values.push(shift_id);
    }
    if (job_date) {
        updates.push("job_date = ?");
        values.push(jobDateValue);
    }

    // If there are no fields to update, skip the query
    if (updates.length === 0) {
        return next(new customError(400, "No valid fields to update"));
    }

    // Prepare the final query
    const query = `
      UPDATE jobs_tbl
      SET ${updates.join(', ')}
      WHERE job_id = ?
    `;
    values.push(job_id);

    connection.query(query, values, (err, results) => {
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

// job/delete/

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


// (5) job/get/:job_id

router.get("/get/:job_id", (req, res, next) => {

    const { job_id } = req.params;

    if (!job_id) {
        return next(new customError(400, "job ID Missing from params"));
    }

    const query = `
    SELECT 
      j.job_id,
      j.station_id,
      j.line_id,
      j.user_id,
      j.shift_id,
      j.job_date,
      u.employee_id,
      u.employee_name,
      st.station_name,
      l.line_name,
      s.shift_name,
      j.job_date
    FROM 
      jobs_tbl j
      INNER JOIN stations_tbl st ON j.station_id = st.station_id
      INNER JOIN lines_tbl l ON j.line_id = l.line_id
      INNER JOIN users_tbl u ON j.user_id = u.user_id
      INNER JOIN shifts_tbl s ON j.shift_id = s.shift_id
    WHERE
      j.job_id = ?
  `;

    connection.query(query, [job_id], (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err}`));
        }

        // Convert the job_date to the original format
        results.forEach((job) => {
            job.job_date = moment(job.job_date, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DDTHH:mm:ss');
        });

        res.status(200).json({
            success: true,
            message: "Jobs retrieved successfully",
            data: results[0]
        });
    });
});

module.exports = router;