const express = require('express')
const upload = require("../utils/multer")

const {
    createSkilledBClearance,
    getAllSkilledBClearance,
    getAllSkilledExpiredBClearance, 
    getOneSkilledBClearance,
    updateSkilledBClearance,
    deleteSkilledBClearance
} = require('../controllers/skilledBClearanceController')
const requireAuth = require('../middleware/requireAuth')

//instance of router
router = express.Router()

router.post('/post', requireAuth, upload.single("photo"), createSkilledBClearance)
router.get('/getAll/', requireAuth, getAllSkilledBClearance)
router.get('/getAll/expired', requireAuth, getAllSkilledExpiredBClearance)
router.get('/getOne/:id', requireAuth, getOneSkilledBClearance)
router.patch('/update/:id', requireAuth, upload.single("photo"), updateSkilledBClearance)
router.patch('/delete/:id', requireAuth, deleteSkilledBClearance)

//export
module.exports = router