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
    adminGetAllExperience,
    adminGetOneExperience,
    adminUpdateExperience,
    adminDeleteExperience,
    adminGetAllCertificate,
    adminGetOneCertificate,
    adminUpdateCertificate,
    adminDeleteCertificate,
    adminGetAllSkill
} = require('../controllers/adminInfoController')

const{
    getOneSkill,
    updateSkill,
    deleteSkill
} = require('../controllers/skillController')

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
//SKILLED WORKER
//get all route
router.get('/getAll/Skilled', adminAuth, adminGetAllSkilled)

//get one route
router.get('/getOne/Skilled/:id', adminAuth, adminGetOneSkilled)

//update route
router.patch('/update/Skilled/:id', adminAuth, adminUpdateSkilled)

//delete route
router.delete('/delete/Skilled/:id', adminAuth, adminDeleteSkilled)

//SKILLED WORKER SKILL
//get all route
router.get('/getAll/skill', adminAuth, adminGetAllSkill)

//get one route
router.get('/getOne/skill/:id', adminAuth, getOneSkill)

//update route
router.patch('/update/skill/:id', adminAuth, updateSkill)

//delete route
router.delete('/delete/skill/:id', adminAuth, deleteSkill)

//SKILLED WORKER WORK EXP
//get all route
router.get('/getAll/SkilledExp', adminAuth, adminGetAllExperience)

//get one route
router.get('/getOne/SkilledExp/:id', adminAuth, adminGetOneExperience)

//update route
router.patch('/update/SkilledExp/:id', adminAuth, adminUpdateExperience)

//delete route
router.delete('/delete/SkilledExp/:id', adminAuth, adminDeleteExperience)

//SKILLED CERT
//get all route
router.get('/getAll/Cert', adminAuth, adminGetAllCertificate)

//get one route
router.get('/getOne/Cert/:id', adminAuth, adminGetOneCertificate)

//update route
router.patch('/update/Cert/:id', adminAuth, adminUpdateCertificate)

//delete route
router.delete('/delete/Cert/:id', adminAuth, adminAuth2, adminDeleteCertificate)

module.exports = router