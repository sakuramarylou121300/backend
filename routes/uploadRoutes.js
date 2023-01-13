const route = require('express').Router()
const upload = require('../middleware/upload')
const uploadImage = require('../middleware/uploadImage')
const requireAuth = require('../middleware/requireAuth')
const uploadController = require('../controllers/uploadController')

route.post('/api/upload', uploadImage, upload, requireAuth, uploadController.uploadAvatar)

module.exports = route