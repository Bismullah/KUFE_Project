const Announcement = require("../models/Announcement")
const asyncHandler = require("../middleware/asyncHandler")
const ErrorResponse = require("../utils/errorResponse")

// @desc    Get all announcements
// @route   GET /api/v1/announcements
// @access  Public
exports.getAnnouncements = asyncHandler(async (req, res, next) => {
  let query

  // Copy req.query
  const reqQuery = { ...req.query }

  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"]

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param])

  // Create query string
  let queryStr = JSON.stringify(reqQuery)

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`)

  // Finding resource
  query = Announcement.find(JSON.parse(queryStr))

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ")
    query = query.select(fields)
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ")
    query = query.sort(sortBy)
  } else {
    query = query.sort("-createdAt")
  }

  // Pagination
  const page = Number.parseInt(req.query.page, 10) || 1
  const limit = Number.parseInt(req.query.limit, 10) || 10
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = await Announcement.countDocuments()

  query = query.skip(startIndex).limit(limit)

  // Executing query
  const announcements = await query

  // Pagination result
  const pagination = {}

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    }
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    }
  }

  res.status(200).json({
    success: true,
    count: announcements.length,
    pagination,
    data: announcements,
  })
})

// @desc    Get single announcement
// @route   GET /api/v1/announcements/:id
// @access  Public
exports.getAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id)

  if (!announcement) {
    return next(new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404))
  }

  res.status(200).json({
    success: true,
    data: announcement,
  })
})

// @desc    Create new announcement
// @route   POST /api/v1/announcements
// @access  Private
exports.createAnnouncement = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  if (req.user) {
    req.body.user = req.user.id
  }

  const announcement = await Announcement.create(req.body)

  res.status(201).json({
    success: true,
    data: announcement,
  })
})

// @desc    Update announcement
// @route   PUT /api/v1/announcements/:id
// @access  Private
exports.updateAnnouncement = asyncHandler(async (req, res, next) => {
  let announcement = await Announcement.findById(req.params.id)

  if (!announcement) {
    return next(new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404))
  }

  // Make sure user is announcement owner or admin
  if (req.user && req.user.role !== "admin" && announcement.user && announcement.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this announcement`, 401))
  }

  announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: announcement,
  })
})

// @desc    Delete announcement
// @route   DELETE /api/v1/announcements/:id
// @access  Private
exports.deleteAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id)

  if (!announcement) {
    return next(new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404))
  }

  // Make sure user is announcement owner or admin
  if (req.user && req.user.role !== "admin" && announcement.user && announcement.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this announcement`, 401))
  }

  await announcement.deleteOne()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Get featured announcements
// @route   GET /api/v1/announcements/featured
// @access  Public
exports.getFeaturedAnnouncements = asyncHandler(async (req, res, next) => {
  const announcements = await Announcement.find({ is_featured: true }).sort("-createdAt").limit(5)

  res.status(200).json({
    success: true,
    count: announcements.length,
    data: announcements,
  })
})
