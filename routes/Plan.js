const express = require("express");
const router = express.Router();
const UserRequireController = require("../Controllers/UserRequireController");
const PlanController = require("../Controllers/PlanController");

router.post("/", UserRequireController.createUserRequire);
router.post("/create/:id", PlanController.createPlan);
router.post("/save-schedule", PlanController.saveSchedule);
// router.get("/schedules", PlanController.getUserSchedules);
// router.get("/schedules/:id", PlanController.getScheduleById);
// router.delete("/schedules/:id", PlanController.deleteSchedule);

module.exports = router;
