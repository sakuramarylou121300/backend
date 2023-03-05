const express = require('express')
const {
    createSkilledNClearance,
    getAllSkilledNClearance,
    getOneSkilledNClearance,
    updateSkilledNClearance,
    deleteSkilledNClearance
} = require('../controllers/skilledNClearanceController')
const requireAuth = require('../middleware/requireAuth')

//instance of router
router = express.Router()

router.post('/post', requireAuth, createSkilledNClearance)
router.get('/getAll/', requireAuth, getAllSkilledNClearance)
router.get('/getOne/:id', requireAuth, getOneSkilledNClearance)
router.patch('/update/:id', requireAuth, updateSkilledNClearance)
router.patch('/delete/:id', requireAuth, deleteSkilledNClearance)

//export
module.exports = router