const express = require('express')
const {
    createRoleCapability, 
    getAllRoleCapability,
    getOneRoleCapability,
    updateRoleCapability,
    deleteRoleCapability
} = require('../controllers/roleCapabilityController')

const adminControlAdmin = require('../middleware/adminControlAdmin')
const adminAuth = require('../middleware/adminAuth')
//instance of router
router = express.Router()
 
router.post('/post/', adminAuth, createRoleCapability)
router.get('/getAll/', adminAuth, getAllRoleCapability)
router.get('/getOne/:id', adminAuth, getOneRoleCapability)
router.patch('/update/:id', adminAuth, updateRoleCapability)
router.patch('/delete/:id', adminAuth, deleteRoleCapability)

//export
module.exports = router