const express = require('express')
const {
    createCapability, 
    getAllCapability,
    getOneCapability,
    updateCapability,
    deleteCapability
} = require('../controllers/capabilityController')

const adminControlAdmin = require('../middleware/adminControlAdmin')
const adminAuth = require('../middleware/adminAuth')

//instance of router
router = express.Router()

router.post('/post/', adminAuth, adminControlAdmin, createCapability)
router.get('/getAll/', adminAuth, adminControlAdmin, getAllCapability)
router.get('/getOne/:id', adminAuth, adminControlAdmin, getOneCapability)
router.patch('/update/:id', adminAuth, adminControlAdmin, updateCapability)
router.delete('/delete/:id', adminAuth, adminControlAdmin, deleteCapability)

//export
module.exports = router