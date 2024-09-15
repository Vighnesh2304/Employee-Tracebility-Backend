const express = require("express");
const router = express.Router();
const checkToken = require("../middleware/checkToken");
const isManager = require("../middleware/checkToken");
const customError = require("../errorHandler/customError");
const connection = require("../utils/dbconnection");

// Route to delete a worker
router.delete("/deleteWorker/:id", checkToken, isManager, (req, res, next) => {
    const userId = req.params.id;

    const query = "DELETE FROM user_tbl WHERE user_id = ? AND role = 'worker'";
    connection.query(query, [userId], (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err.message}`));
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Worker not found or cannot be deleted" });
        }

        res.status(200).json({ message: "Worker deleted successfully" });
    });
});

// Route to delete a supervisor
router.delete("/deleteSupervisor/:id", checkToken, isManager, (req, res, next) => {
    const userId = req.params.id;

    const query = "DELETE FROM user_tbl WHERE user_id = ? AND role = 'supervisor'";
    connection.query(query, [userId], (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err.message}`));
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Supervisor not found or cannot be deleted" });
        }

        res.status(200).json({ message: "Supervisor deleted successfully" });
    });
});

// Route to get workers
router.get("/getWorkers", checkToken, isManager, (req, res, next) => {
    const query = "SELECT * FROM user_tbl WHERE role = 'worker'";

    connection.query(query, (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err.message}`));
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "No workers found" });
        }

        res.status(200).json({
            message: "Workers retrieved successfully",
            data: results,
        });
    });
});

// Route to get supervisors
router.get("/getSupervisors", checkToken, isManager, (req, res, next) => {
    const query = "SELECT * FROM user_tbl WHERE role = 'supervisor'";

    connection.query(query, (err, results) => {
        if (err) {
            return next(new customError(500, `Database query error: ${err.message}`));
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "No supervisors found" });
        }

        res.status(200).json({
            message: "Supervisors retrieved successfully",
            data: results,
        });
    });
});

module.exports = router;
