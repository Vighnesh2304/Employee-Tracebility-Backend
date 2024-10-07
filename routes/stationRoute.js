const express = require('express');
const router = express.Router();
const customError = require("../errorHandler/customError");
const connection = require("../utils/dbconnection");
const checkToken = require("../middleware/checkToken");

// (1) station/addstation

router.post("/addsation", (req, res, next) => {
    const { station_name, station_description } = req.body;

    if (!station_name) {
        return next(customError(400, "Missing required fields"));
    }

    const query = `INSERT INTO stations_tbl (station_name, station_description) VALUES ( ?, ?)`;

    connection.query(query, [station_name, station_description], (err, results) => {
        if (err) {
            return next(customError(500, `Database query error: ${err}`));
        }
        res.status(201).json({
            success: true,
            message: "station added successfully"
        });
    });
})

// (2) station/getall

router.get("/getall", (req, res, next) => {

    const query = "SELECT * FROM stations_tbl";

    connection.query(query, (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err}`));
        }

        if (results.length === 0) {
            return next(new customError(404, "stations not found"));
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });
});

// (3) station/updatestation/:station_id

router.put("/updatestation/:station_id", (req, res, next) => {
    const { station_id } = req.params;
    const { station_name, station_description } = req.body;

    if (!station_id) {
        return next(new customError(400, "Line ID is required"));
    }

    if (!station_name && !station_description) {
        return next(new customError(400, "At least one field is required to update"));
    }

    const query = `UPDATE stations_tbl SET ? WHERE station_id = ?`;

    const updates = {};
    if (station_name) updates.station_name = station_name;
    if (station_description) updates.station_description = station_description;

    connection.query(query, [updates, station_id], (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err}`));
        }
        res.status(200).json({
            success: true,
            message: "Station updated successfully"
        });
    });
});


// (4) sttion/get/:station_id

router.get("/get/:station_id", (req, res, next) => {
    const { station_id } = req.params;

    if (!station_id) {
        return next(new customError(400, "Station ID is required"));
    }

    const query = "SELECT * FROM stations_tbl WHERE station_id = ?";

    connection.query(query, [station_id], (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err}`));
        }

        if (results.length === 0) {
            return next(new customError(404, "Station not found"));
        }

        res.status(200).json({
            success: true,
            data: results[0]
        });
    });
});


// (5) sttion/delete/:station_id

router.delete("/delete/:station_id", (req, res, next) => {
    const { station_id } = req.params;

    if (!station_id) {
        return next(new customError(400, "Station ID is required"));
    }

    const query = `DELETE FROM stations_tbl WHERE station_id = ?`;

    connection.query(query, [station_id], (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err}`));
        }

        if (results.affectedRows === 0) {
            return next(new customError(404, "Staion not found"));
        }

        res.status(200).json({
            success: true,
            message: "Staion deleted successfully"
        });
    });
});

// (6) station/assignStation

router.post("/assignStation", (req, res, next) => {
    const { line_id, station_id, start_date, end_date } = req.body;

    if (!line_id || !station_id) {
        return next(new customError(400, "Missing required fields: line_id or station_id"));
    }

    let startDateValue = null;
    let endDateValue = null;

    if (start_date) {
        startDateValue = moment(start_date, 'MM/DD/YYYY, h:mm A').format('YYYY-MM-DD HH:mm:ss');
    } else {
        startDateValue = new Date(); 
    }

    if (end_date) {
        endDateValue = moment(end_date, 'MM/DD/YYYY, h:mm A').format('YYYY-MM-DD HH:mm:ss');
    } else {
        endDateValue = null; 
    }

    // Step 1: Update the existing record by setting the end_date to NOW() if the station is already assigned
    const updateQuery = `
        UPDATE line_station_link 
        SET end_date = NOW()
        WHERE station_id = ? AND end_date IS NULL
    `;
    
    connection.query(updateQuery, [station_id], (err, updateResults) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err}`));
        }

        // Step 2: Insert the new assignment into the line_station_link table
        const insertQuery = `
            INSERT INTO line_station_link (line_id, station_id, start_date, end_date)
            VALUES (?, ?, ?, ?)
        `;

        connection.query(insertQuery, [line_id, station_id, startDateValue, endDateValue], (err, insertResults) => {
            if (err) {
                return next(new customError(500, `Database query error: ${err}`));
            }

            res.status(201).json({
                success: true,
                message: "Station assigned to line successfully"
            });
        });
    });
});


// (7) station/get station for a line

router.get("/getStationsByLine/:line_id", (req, res, next) => {
    const { line_id } = req.params;

    if (!line_id) {
        return next(new customError(400, "Missing required parameter: line_id"));
    }

    // Query to fetch all stations allocated to the given line where end_date is NULL
    const query = `
        SELECT s.station_id, s.station_name, s.station_description 
        FROM stations_tbl s
        JOIN line_station_link lsl ON s.station_id = lsl.station_id
        WHERE lsl.line_id = ? AND lsl.end_date IS NULL
    `;

    connection.query(query, [line_id], (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err}`));
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No stations currently allocated to this line"
            });
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });
});


router.get("/getAllStations", (req, res, next) => {
    // Query to get all allocated stations
    const allocatedQuery = `
        SELECT s.station_id, s.station_name, s.station_description, lsl.line_id, l.line_name
        FROM stations_tbl s
        JOIN line_station_link lsl ON s.station_id = lsl.station_id
        JOIN lines_tbl l ON lsl.line_id = l.line_id
        WHERE lsl.end_date IS NULL
    `;

    // Query to get all free stations (not allocated)
    const freeQuery = `
        SELECT s.station_id, s.station_name, s.station_description
        FROM stations_tbl s
        WHERE s.station_id NOT IN (SELECT station_id FROM line_station_link WHERE end_date IS NULL)
    `;

    // Execute both queries simultaneously
    connection.query(allocatedQuery, (errAllocated, allocatedResults) => {
        if (errAllocated) {
            return next(new customError(500, `Database query error: ${errAllocated}`));
        }

        connection.query(freeQuery, (errFree, freeResults) => {
            if (errFree) {
                return next(new customError(500, `Database query error: ${errFree}`));
            }

            // Combine the results and send response
            res.status(200).json({
                success: true,
                free: freeResults,
                allocated: allocatedResults
            });
        });
    });
});



module.exports = router;