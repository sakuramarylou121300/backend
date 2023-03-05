const express = require('express')
const {
    createSkilledBClearance,
    getAllSkilledBClearance,
    getOneSkilledBClearance,
    updateSkilledBClearance,
    deleteSkilledBClearance
} = require('../controllers/skilledBClearanceController')
const requireAuth = require('../middleware/requireAuth')

//instance of router
router = express.Router()

router.post('/post', requireAuth, createSkilledBClearance)
router.get('/getAll/', requireAuth, getAllSkilledBClearance)
router.get('/getOne/:id', requireAuth, getOneSkilledBClearance)
router.patch('/update/:id', requireAuth, updateSkilledBClearance)
router.patch('/delete/:id', requireAuth, deleteSkilledBClearance)

//export
module.exports = router