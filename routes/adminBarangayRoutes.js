const express = require('express')

//controller functions
const{
    createBarangay,
    getCityBarangay,
    getAllBarangay,
    getOneBarangay,
    updateBarangay,
    deleteBarangay
} = require('../controllers/adminBarangayController')


const adminAuth = require('../middleware/adminAuth')
const adminControlAdminAddress = require('../middleware/adminControlAdminAddress')

const router = express.Router()

router.post('/post', adminAuth, adminControlAdminAddress, createBarangay)
router.get('/getAll/cityBarangay/:city_id', adminAuth, adminControlAdminAddress, getCityBarangay)
router.get('/getAll', adminAuth, adminControlAdminAddress, getAllBarangay)
router.get('/getOne/:id', adminAuth, adminControlAdminAddress, getOneBarangay)
router.patch('/update/:id', adminAuth, adminControlAdminAddress, updateBarangay)
router.delete('/delete/:id', adminAuth, adminControlAdminAddress, deleteBarangay)

module.exports = router