const express = require('express')

//controller functions
const{
    adminLogIn,
    adminSignUp,  
    adminGetAllAdmin,
    adminGetOneAdmin,
    adminUpdateUserName,
    adminUpdatePass,
    adminUpdateInfo,
    adminDeleteInfo,
    adminGetAllSkilled,
    adminGetOneSkilled,
    adminUpdateSkilled,
    adminDeleteSkilled,
    adminGetAllExperience
} = require('../controllers/adminInfoController')

const adminAuth = require('../middleware/adminAuth')
const adminAuth2 = require('../middleware/adminAuth2')

const router = express.Router()

//log in route
router.post('/login', adminLogIn)

//ONLY SUPER ADMIN CAN ACCESS
//sign up route
router.post('/signup', adminAuth, adminAuth2, adminSignUp)

//get all route
router.get('/getAll/admin', adminAuth, adminAuth2, adminGetAllAdmin)

//get one route
router.get('/getOne/admin/:id', adminAuth, adminAuth2, adminGetOneAdmin)

//update route
router.patch('/update/adminUserName/:id', adminAuth, adminAuth2, adminUpdateUserName)

//update route
router.patch('/update/adminPass/:id', adminAuth, adminAuth2, adminUpdatePass)

//update route
router.patch('/update/adminInfo/:id', adminAuth, adminAuth2, adminUpdateInfo)

//delete route
router.delete('/delete/adminInfo/:id', adminAuth, adminAuth2, adminDeleteInfo)

//DEPENDING ON THE ROLES
//SKILLED WORKER EXPERIENCE
//get all route
router.get('/getAll/Skilled', adminAuth, adminGetAllSkilled)

//get one route
router.get('/getOne/Skilled/:id', adminAuth, adminGetOneSkilled)

//update route
router.patch('/update/Skilled/:id', adminAuth, adminUpdateSkilled)

//update route
router.delete('/delete/Skilled/:id', adminAuth, adminDeleteSkilled)

//get all route
router.get('/getAll/SkilledExp', adminAuth, adminGetAllExperience)
module.exports = router