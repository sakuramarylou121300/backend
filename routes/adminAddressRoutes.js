const express = require('express')
const {
    createProvince,
    getAllProvince,
    getOneProvince,
    updateProvince,
    deleteProvince,
    pushCity,
    editCity,
    pullCity,
    pushBarangay,
    editBarangay
} = require('../controllers/adminAddressController')

// const adminAuth = require('../middleware/adminAuth')

//instance of router
router = express.Router()

//only admin can post, update and delete skill
//POST province
router.post('/post/province', createProvince)

//GET ALL province
router.get('/getAll/province', getAllProvince)

//GET ONE province
router.get('/getOne/province/:id', getOneProvince)

//UPDATE province
router.patch('/update/province/:id', updateProvince)

//DELETE province
router.delete('/delete/province/:id', deleteProvince)

//PUSH city
router.patch('/update/province/pushCity/:id', pushCity)

//UPDATE city
router.patch('/update/province/editCity/:arrayId', editCity)

//PULL city
router.patch('/update/province/pullCity/:arrayId', pullCity)

//PUSH barangay
router.patch('/update/city/pushBarangay/:id', pushBarangay)

//EDIT barangay
router.patch('/update/city/editBarangay/:id', editBarangay)
//export
module.exports = router