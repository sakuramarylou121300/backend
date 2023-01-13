const express = require('express')

//controller functions
const{
    createCity,
    getAllCity,
    getOneCity,
    updateCity,
    deleteCity
} = require('../controllers/adminCityController')

const router = express.Router()

//sign up route
router.post('/post', createCity)

// //get all route
router.get('/getAll', getAllCity)//i have removed the authentication for this to test the dropdown

//get one route
router.get('/getOne/:id', getOneCity)

//update route
router.patch('/update/:id', updateCity)

//update route
router.delete('/delete/:id', deleteCity)

module.exports = router