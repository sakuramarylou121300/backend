const express = require('express')

//controller functions
const{
    createProvince,
    getAllProvince,
    getOneProvince,
    updateProvince,
    deleteProvince
} = require('../controllers/adminProvinceController')

const router = express.Router()

// //log in route
// router.post('/login', adminLogIn)

//sign up route
router.post('/post', createProvince)

// //get all route
router.get('/getAll', getAllProvince)//i have removed the authentication for this to test the dropdown

//get one route
router.get('/getOne/:id', getOneProvince)

//update route
router.patch('/update/:id', updateProvince)

//update route
router.delete('/delete/:id', deleteProvince)

module.exports = router