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

router.post('/post/', adminAuth, createRole)
router.get('/getAll/', adminAuth, getAllRole)
router.get('/getOne/:id', adminAuth, getOneRole)
router.patch('/update/:id', adminAuth, updateRole)
router.patch('/delete/:id', adminAuth, deleteRole)

//export
module.exports = router