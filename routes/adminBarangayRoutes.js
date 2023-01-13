const express = require('express')

//controller functions
const{
    createBarangay,
    getAllBarangay,
    getOneBarangay,
    updateBarangay,
    deleteBarangay
} = require('../controllers/adminBarangayController')

const router = express.Router()

// //log in route
// router.post('/login', adminLogIn)

//sign up route
router.post('/post', createBarangay)

// //get all route
router.get('/getAll', getAllBarangay)//i have removed the authentication for this to test the dropdown

//get one route
router.get('/getOne/:id', getOneBarangay)

//update route
router.patch('/update/:id', updateBarangay)

//update route
router.delete('/delete/:id', deleteBarangay)

module.exports = router