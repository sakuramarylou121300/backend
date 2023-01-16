const express = require('express')

//controller functions
const{
    createCity,
    getAllCity,
    getOneCity,
    updateCity,
    deleteCity
} = require('../controllers/adminCityController')

const adminAuth = require('../middleware/adminAuth')
const adminControlAdminAddress = require('../middleware/adminControlAdminAddress')

const router = express.Router()

router.post('/post', adminAuth, adminControlAdminAddress, createCity)
router.get('/getAll', adminAuth, adminControlAdminAddress, getAllCity)
router.get('/getOne/:id', adminAuth, adminControlAdminAddress, getOneCity)
router.patch('/update/:id', adminAuth, adminControlAdminAddress, updateCity)
router.delete('/delete/:id', adminAuth, adminControlAdminAddress, deleteCity)

module.exports = router