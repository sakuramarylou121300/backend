const express = require('express')
const {
    getAllOtherTitle,
    getAllOtherTitleTrue,
    getAllOtherTitleFalse,
    updateOtherTitleAccepted,
    updateOtherTitle
} = require('../controllers/otherTitleController')

const adminControlSkilled = require('../middleware/adminControlSkilled')
const adminAuth = require('../middleware/adminAuth')

//instance of router
router = express.Router()

router.get('/getAll/', adminAuth, adminControlSkilled, getAllOtherTitle)
router.get('/getAll/approved', adminAuth, adminControlSkilled, getAllOtherTitleTrue)
router.get('/getAll/disapproved', adminAuth, adminControlSkilled, getAllOtherTitleFalse)
router.patch('/update/accepted/:id', adminAuth, adminControlSkilled, updateOtherTitleAccepted)
router.patch('/update/:id', adminAuth, adminControlSkilled, updateOtherTitle)
//export
module.exports = router