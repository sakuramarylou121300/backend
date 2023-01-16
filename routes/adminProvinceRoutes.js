const express = require('express')

//controller functions
const{
    createProvince,
    getAllProvince,
    getOneProvince,
    updateProvince,
    deleteProvince
} = require('../controllers/adminProvinceController')

const adminAuth = require('../middleware/adminAuth')
const adminControlAdminAddress = require('../middleware/adminControlAdminAddress')

const router = express.Router()

router.post('/post', adminAuth, adminControlAdminAddress, createProvince)
router.get('/getAll', adminAuth, adminControlAdminAddress, getAllProvince)
router.get('/getOne/:id', adminAuth, adminControlAdminAddress, getOneProvince)
router.patch('/update/:id', adminAuth, adminControlAdminAddress, updateProvince)
router.delete('/delete/:id', adminAuth, adminControlAdminAddress, deleteProvince)

module.exports = router