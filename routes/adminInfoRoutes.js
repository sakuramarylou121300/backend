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
    getAdminInfo, 
    updateAdminUserName,
    updateAdminPass,
    updateAdminInfo,
    deleteAdminInfo,
    adminGetAllSkilled,
    adminGetOneSkilled,
    adminUpdateSkilled,
    adminDeleteSkilled,
    adminGetAllExperience,
    adminGetAllCertificate,
    adminGetAllSkill,
    adminGetAllSkilledBill,
    adminGetAllSkilledDetail,
    adminGetAllSkilledExpDetail,
    adminGetAllSkilledCertDetail,
    adminGetAllSkilledBillDetail,
    adminUpdateExperience,
    adminUpdateCertificate,
    adminEditSkilledBill,
    adminUpdateSkilledBill,
    adminUpdateSkilledAccount,
    adminUpdateSkilledAccountNot, 
    adminEditSkilledAddress,
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
    deleteExperience
} = require('../controllers/experienceController')

const{
    getOneCertificate,
    deleteCertificate
} = require('../controllers/skillCertController')

const{
    getOneSkilledBill,
    deleteSkilledBill
} = require('../controllers/skilledBillController')

const adminControlAdmin = require('../middleware/adminControlAdmin')
const adminAuth = require('../middleware/adminAuth')
const adminControlSkilled = require('../middleware/adminControlSkilled')

const router = express.Router()

//log in route
router.post('/login', adminLogIn)

//ONLY SUPER ADMIN CAN ACCESS
router.post('/signup', adminAuth, adminControlAdmin, adminSignUp)
router.get('/getAll/admin', adminAuth, adminControlAdmin, adminGetAllAdmin)
router.get('/getOne/admin/:id', adminAuth, adminControlAdmin, adminGetOneAdmin)
router.patch('/update/adminUserName/:id', adminAuth, adminControlAdmin, adminUpdateUserName)
router.patch('/update/adminPass/:id', adminAuth, adminControlAdmin, adminUpdatePass)
router.patch('/update/adminInfo/:id', adminAuth, adminControlAdmin, adminUpdateInfo)
router.patch('/delete/adminInfo/:id', adminAuth, adminControlAdmin, adminDeleteInfo)


router.post('/post/adminRoleCap', adminAuth, adminControlAdmin, createAdminRoleCapability)
router.get('/getAll/adminRoleCap', adminAuth, adminControlAdmin, getAllAdminRoleCapability) 
router.get('/getOne/adminRoleCap/:id', adminAuth, adminControlAdmin, getOneAdminRoleCapability)
router.patch('/update/adminRoleCap/:id', adminAuth, adminControlAdmin, updateAdminRoleCapability)
router.delete('/delete/adminRoleCap/:id', adminAuth, adminControlAdmin, deleteAdminRoleCapability)

//ALL ADMIN CAN ACCESS THIS
router.get('/get/oneAdminInfo', adminAuth, getAdminInfo)
router.patch('/update/oneAdminUserName', adminAuth, updateAdminUserName)
router.patch('/update/oneAdminPass', adminAuth, updateAdminPass)
router.patch('/update/oneAdminInfo', adminAuth, updateAdminInfo)
router.patch('/delete/oneAdminInfo', adminAuth, deleteAdminInfo)

//DEPENDING ON THE ROLES
//SKILLED WORKER
router.get('/getAll/Skilled', adminAuth, adminControlSkilled, adminGetAllSkilled)
router.get('/getAll/Skilled/detail', adminAuth, adminControlSkilled, adminGetAllSkilledDetail)
router.get('/getOne/Skilled/:id', adminAuth, adminControlSkilled, adminGetOneSkilled)
router.patch('/update/Skilled/:id', adminAuth, adminControlSkilled, adminUpdateSkilled)
router.patch('/delete/Skilled/:id', adminAuth, adminControlSkilled, adminDeleteSkilled)

router.get('/getAll/skilledBill', adminAuth, adminControlSkilled, adminGetAllSkilledBill)
router.get('/getAll/skilledBill/detail', adminAuth, adminControlSkilled, adminGetAllSkilledBillDetail)
router.get('/getOne/skilledBill/:id', adminAuth, adminControlSkilled, getOneSkilledBill)
router.patch('/update/skilledBill/:id', adminAuth, adminControlSkilled, adminEditSkilledBill)
router.delete('/delete/skilledBill/:id', adminAuth, adminControlSkilled, deleteSkilledBill)

router.put('/update/skilled/billing', adminAuth, adminControlAdmin, adminUpdateSkilledBill)
router.put('/update/skilled/account', adminAuth, adminControlAdmin, adminUpdateSkilledAccount)
router.put('/update/skilled/account/not', adminAuth, adminControlAdmin, adminUpdateSkilledAccountNot)

router.patch('/update/skilled/address/:id', adminAuth, adminControlAdmin, adminEditSkilledAddress)

//SKILLED WORKER SKILL
router.get('/getAll/skill', adminAuth, adminControlSkilled, adminGetAllSkill)
router.get('/getOne/skill/:id', adminAuth, adminControlSkilled, getOneSkill)
router.patch('/update/skill/:id', adminAuth, adminControlSkilled, updateSkill)
router.delete('/delete/skill/:id', adminAuth, adminControlSkilled, deleteSkill)

//SKILLED WORKER WORK EXP   
router.get('/getAll/SkilledExp', adminAuth, adminControlSkilled, adminGetAllExperience)
router.get('/getAll/SkilledExp/detail/:username', adminAuth, adminControlSkilled, adminGetAllSkilledExpDetail)
router.get('/getOne/SkilledExp/:id', adminAuth, adminControlSkilled, getOneExperience)
router.patch('/update/SkilledExp/:id', adminAuth, adminControlSkilled, adminUpdateExperience)
router.delete('/delete/SkilledExp/:id', adminAuth, adminControlSkilled, deleteExperience)

//SKILLED CERT
router.get('/getAll/Cert', adminAuth, adminControlSkilled, adminGetAllCertificate)
router.get('/getAll/Cert/detail/:username', adminAuth, adminControlSkilled, adminGetAllSkilledCertDetail)
router.get('/getOne/Cert/:id', adminAuth, adminControlSkilled, getOneCertificate)
router.patch('/update/Cert/:id', adminAuth, adminControlSkilled, adminUpdateCertificate)
router.delete('/delete/Cert/:id', adminAuth, adminControlSkilled, deleteCertificate)

module.exports = router