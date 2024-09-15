const express = require("express");
const router = express.Router();
const isSupervisor = require("../middleware/checkToken");
const checkToken = require("../middleware/checkToken");
const customError = require("../errorHandler/customError");
const connection = require("../utils/dbconnection");


// Route to delete a worker
router.delete("/deleteWorker/:id", checkToken, isSupervisor, (req, res, next) => {
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

// module.exports = router;


// Route to get workers
router.get("/getWorkers", checkToken, isSupervisor, (req, res, next) => {
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


module.exports = router;
