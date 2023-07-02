const express = require('express')
const {
    createSkilledDate,
    getAllSkilledDate,
    getOneSkilledDate,
    
} = require('../controllers/skilledDateController')

const {requireAuth} = require('../middleware/requireAuth')

//instance of router
router = express.Router()

router.post('/post', requireAuth, createSkilledDate)
router.get('/getAll', requireAuth, getAllSkilledDate)
router.get('/getOne/:id', requireAuth, getOneSkilledDate)
// router.patch('/update/:id', adminAuth, adminControlAdmin, updateRole)
// router.patch('/delete/:id', adminAuth, adminControlAdmin, deleteRole)

//export
module.exports = router