const express = require('express')
const {
    createRoleCapability, 
    getAllRoleCapability,
    getAllCapability,
    getOneRoleCapability,
    updateRoleCapability,
    deleteRoleCapability
} = require('../controllers/roleCapabilityController')

const adminControlAdmin = require('../middleware/adminControlAdmin')
const adminAuth = require('../middleware/adminAuth')
//instance of router
router = express.Router()
 
router.post('/post/', adminAuth, adminControlAdmin, createRoleCapability)
router.get('/getAll/', adminAuth, adminControlAdmin, getAllRoleCapability)
router.get('/getAll/:username', adminAuth, adminControlAdmin, getAllCapability)
router.get('/getOne/:id', adminAuth, adminControlAdmin, getOneRoleCapability)
router.patch('/update/:id', adminAuth, adminControlAdmin, updateRoleCapability)
router.patch('/delete/:id', adminAuth, adminControlAdmin, deleteRoleCapability)

//export
module.exports = router