const express = require('express')
const {
    createRoleCapability, 
    getAllRoleCapability,
    createCapability,
    getAllCapability,
    getOneAdminCapability,
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

//USED
router.post('/post/:_id', adminAuth, adminControlAdmin, createCapability)
router.get('/getAll/:_id', adminAuth, adminControlAdmin, getAllCapability)
router.get('/getOne/admin/:id', adminAuth, adminControlAdmin, getOneAdminCapability)
router.get('/getOne/:id', adminAuth, adminControlAdmin, getOneRoleCapability)
router.patch('/update/:id', adminAuth, adminControlAdmin, updateRoleCapability)
router.patch('/delete/:id', adminAuth, adminControlAdmin, deleteRoleCapability)

//export
module.exports = router