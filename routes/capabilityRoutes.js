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

router.post('/post/', adminAuth, createCapability)
router.get('/getAll/', adminAuth, getAllCapability)
router.get('/getOne/:id', adminAuth, getOneCapability)
router.patch('/update/:id', adminAuth, updateCapability)
router.patch('/delete/:id', adminAuth, deleteCapability)

//export
module.exports = router