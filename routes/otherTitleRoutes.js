const express = require('express')
const {
    getAllOtherTitle,
    getAllOtherTitleTrue,
    getAllOtherTitleFalse,
    updateOtherTitleAccepted,
    updateOtherTitle
} = require('../controllers/otherTitleController')

const adminControlAdmin = require('../middleware/adminControlAdmin')
const adminAuth = require('../middleware/adminAuth')

//instance of router
router = express.Router()

router.get('/getAll/', adminAuth, adminControlAdmin, getAllOtherTitle)
router.get('/getAll/approved', adminAuth, adminControlAdmin, getAllOtherTitleTrue)
router.get('/getAll/disapproved', adminAuth, adminControlAdmin, getAllOtherTitleFalse)
router.patch('/update/accepted/:id', adminAuth, adminControlAdmin, updateOtherTitleAccepted)
router.patch('/update/:id', adminAuth, adminControlAdmin, updateOtherTitle)
//export
module.exports = router