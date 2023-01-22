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
    adminGetAllCertificate,
    adminGetAllSkill,
    adminGetAllSkilledBill,
    adminEditSkilledAddress,
    adminUpdateBillVer,
} = require('../controllers/adminInfoController')

const{
    createAdminRoleCapability,
    getAllAdminRoleCapability,
    getOneAdminRoleCapability,
    updateAdminRoleCapability,
    deleteAdminRoleCapability
} = require('../controllers/adminRoleCapabilityController')

const{
    getOneSkill,
    updateSkill,
    deleteSkill
} = require('../controllers/skillController')

const{
    getOneExperience,
    updateExperience,
    deleteExperience
} = require('../controllers/experienceController')

const{
    getOneCertificate,
    updateCertificate,
    deleteCertificate
} = require('../controllers/skillCertController')

const{
    getOneSkilledBill,
    updateSkilledBill,
    deleteSkilledBill
} = require('../controllers/skilledBillController')

const adminControlAdmin = require('../middleware/adminControlAdmin')
const adminAuth = require('../middleware/adminAuth')
const adminControlSkilled = require('../middleware/adminControlSkilled')

const router = express.Router()

//log in route
router.post('/login', adminLogIn)

//ONLY SUPER ADMIN CAN ACCESS
router.post('/signup', adminSignUp)
router.get('/getAll/admin', adminAuth, adminControlAdmin, adminGetAllAdmin)
router.get('/getOne/admin/:id', adminAuth, adminControlAdmin, adminGetOneAdmin)
router.patch('/update/adminUserName/:id', adminAuth, adminControlAdmin, adminUpdateUserName)
router.patch('/update/adminPass/:id', adminAuth, adminControlAdmin, adminUpdatePass)
router.patch('/update/adminInfo/:id', adminAuth, adminControlAdmin, adminUpdateInfo)
router.delete('/delete/adminInfo/:id', adminAuth, adminControlAdmin, adminDeleteInfo)


router.post('/post/adminRoleCap', adminAuth, adminControlAdmin, createAdminRoleCapability)
router.get('/getAll/adminRoleCap', adminAuth, adminControlAdmin, getAllAdminRoleCapability) 
router.get('/getOne/adminRoleCap/:id', adminAuth, adminControlAdmin, getOneAdminRoleCapability)
router.patch('/update/adminRoleCap/:id', adminAuth, adminControlAdmin, updateAdminRoleCapability)
router.delete('/delete/adminRoleCap/:id', adminAuth, adminControlAdmin, deleteAdminRoleCapability)

//ALL ADMIN CAN ACCESS THIS
router.patch('/update/adminUserNamee/:id', adminAuth, adminUpdateUserName)
router.patch('/update/adminPasss/:id', adminAuth, adminUpdatePass)
router.patch('/update/adminInfoo/:id', adminAuth, adminUpdateInfo)

//DEPENDING ON THE ROLES
//SKILLED WORKER
router.get('/getAll/Skilled', adminAuth, adminControlSkilled, adminGetAllSkilled)
router.get('/getOne/Skilled/:id', adminAuth, adminControlSkilled, adminGetOneSkilled)
router.patch('/update/Skilled/:id', adminAuth, adminControlSkilled, adminUpdateSkilled)
router.delete('/delete/Skilled/:id', adminAuth, adminControlSkilled, adminDeleteSkilled)

router.get('/getAll/skilledBill', adminAuth, adminControlSkilled, adminGetAllSkilledBill)
router.get('/getOne/skilledBill/:id', adminAuth, adminControlSkilled, getOneSkilledBill)
router.patch('/update/skilledBill/:id', adminAuth, adminControlSkilled, updateSkilledBill)
router.delete('/delete/skilledBill/:id', adminAuth, adminControlSkilled, deleteSkilledBill)

router.patch('/update/skilled/billVer', adminAuth, adminControlAdmin, adminUpdateBillVer)
router.patch('/update/skilled/address/:id', adminAuth, adminControlAdmin, adminEditSkilledAddress)

//SKILLED WORKER SKILL
router.get('/getAll/skill', adminAuth, adminControlSkilled, adminGetAllSkill)
router.get('/getOne/skill/:id', adminAuth, adminControlSkilled, getOneSkill)
router.patch('/update/skill/:id', adminAuth, adminControlSkilled, updateSkill)
router.delete('/delete/skill/:id', adminAuth, adminControlSkilled, deleteSkill)

//SKILLED WORKER WORK EXP
router.get('/getAll/SkilledExp', adminAuth, adminControlSkilled, adminGetAllExperience)
router.get('/getOne/SkilledExp/:id', adminAuth, adminControlSkilled, getOneExperience)
router.patch('/update/SkilledExp/:id', adminAuth, adminControlSkilled, updateExperience)
router.delete('/delete/SkilledExp/:id', adminAuth, adminControlSkilled, deleteExperience)

//SKILLED CERT
router.get('/getAll/Cert', adminAuth, adminControlSkilled, adminGetAllCertificate)
router.get('/getOne/Cert/:id', adminAuth, adminControlSkilled, getOneCertificate)
router.patch('/update/Cert/:id', adminAuth, adminControlSkilled, updateCertificate)
router.delete('/delete/Cert/:id', adminAuth, adminControlSkilled, deleteCertificate)

module.exports = router