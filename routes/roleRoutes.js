const express = require('express')
const {
    createRole, 
    getAllRole,
    getOneRole,
    updateRole,
    deleteRole
} = require('../controllers/roleController')

const adminControlAdmin = require('../middleware/adminControlAdmin')
const adminAuth = require('../middleware/adminAuth')

//instance of router
router = express.Router()

router.post('/post/', adminAuth, adminControlAdmin, createRole)
router.get('/getAll/', adminAuth, adminControlAdmin, getAllRole)
router.get('/getOne/:id', adminAuth, adminControlAdmin, getOneRole)
router.patch('/update/:id', adminAuth, adminControlAdmin, updateRole)
router.patch('/delete/:id', adminAuth, adminControlAdmin, deleteRole)

//export
module.exports = router