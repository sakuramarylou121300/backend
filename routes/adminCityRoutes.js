const express = require('express')

//controller functions
const{
    createCity,
    getAllCity,
    getAllProvCity,
    getOneCity,
    updateCity,
    deleteCity
} = require('../controllers/adminCityController')

const adminAuth = require('../middleware/adminAuth')
const adminControlAdminAddress = require('../middleware/adminControlAdminAddress')

const router = express.Router()

router.post('/post', adminAuth, adminControlAdminAddress, createCity)
router.get('/getAll', adminAuth, adminControlAdminAddress, getAllCity)
router.get('/getAll/provCity/:province_id', adminAuth, adminControlAdminAddress, getAllProvCity)
router.get('/getOne/:id', adminAuth, adminControlAdminAddress, getOneCity)
router.patch('/update/:id', adminAuth, adminControlAdminAddress, updateCity)
router.patch('/delete/:id', adminAuth, adminControlAdminAddress, deleteCity) 

router.get('/getAll/skilled', getAllCity)
router.get('/getAll/provCity/skilled/:province_id', getAllProvCity)

module.exports = router