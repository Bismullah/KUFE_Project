const express = require("express")
const {
  getFaculties,
  getFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getFacultiesCount,
} = require("../controllers/facultyController")
const { authMiddleware } = require("../middleware/authMiddleware")
const { authorize } = require("../middleware/roleCheck")
const { facultyValidationRules, validate } = require("../utils/validators")
const roles = require("../config/roles")

const router = express.Router()

// Public routes
router.get("/", getFaculties)
router.get("/count",getFacultiesCount)
router.get("/:id", getFaculty)

// Protected routes

router.use(authMiddleware);
router.post("/", facultyValidationRules(), validate, createFaculty)
router.patch("/:id", updateFaculty)
router.delete("/:id", deleteFaculty)

module.exports = router

