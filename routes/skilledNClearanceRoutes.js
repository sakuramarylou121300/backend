const express = require('express')
const upload = require("../utils/multer")

const {
    createSkilledNClearance,
    getAllSkilledNClearance,
    getAllExpiredNClearance,
    getOneSkilledNClearance,
    updateSkilledNClearance,
    deleteSkilledNClearance
} = require('../controllers/skilledNClearanceController')
const {requireAuth} = require('../middleware/requireAuth')

//instance of router
router = express.Router()

router.post('/post', requireAuth, upload.single("photo"), createSkilledNClearance)
router.get('/getAll/', requireAuth, getAllSkilledNClearance)
router.get('/getAll/expired', requireAuth, getAllExpiredNClearance)
router.get('/getOne/:id', requireAuth, getOneSkilledNClearance)
router.patch('/update/:id', requireAuth, upload.single("photo"), updateSkilledNClearance)
router.patch('/delete/:id', requireAuth, deleteSkilledNClearance)

//export
module.exports = router