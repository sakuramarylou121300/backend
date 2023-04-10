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
    adminGetAllSkill,
    adminGetAllExpSkilledDetail,
    adminGetAllCertSkilledDetail,
    adminGetAllBClearanceSkilledDetail,
    adminGetAllNClearanceSkilledDetail,
    adminGetAllSkilledExpDetail,
    adminGetAllSkilledCertDetail,
    adminGetAllSkilledBarangayDetail,
    adminGetAllSkilledNbiDetail,
    adminUpdateExperience,
    adminUpdateCertificate,
    adminUpdateBarangay,
    adminUpdateNbi,
    adminGetAllSkilledBill,
    adminGetAllSkilledBillDetail,
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
    getOneExp,
    deleteExp
} = require('../controllers/skilledExpController')

const{
    getOneCertificate,
    deleteCertificate
} = require('../controllers/skillCertController')

const{
    getOneSkilledBClearance,
    deleteSkilledBClearance
} = require('../controllers/skilledBClearanceController')

const{
    getOneSkilledNClearance,
    deleteSkilledNClearance
} = require('../controllers/skilledNClearanceController')

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
router.get('/getAll/Skilled/detail', adminAuth, adminControlSkilled, adminGetAllCertSkilledDetail)
router.get('/getAll/Skilled/detail/exp', adminAuth, adminControlSkilled, adminGetAllExpSkilledDetail)
router.get('/getAll/Skilled/detail/bclearance', adminAuth, adminControlSkilled, adminGetAllBClearanceSkilledDetail)
router.get('/getAll/Skilled/detail/nclearance', adminAuth, adminControlSkilled, adminGetAllNClearanceSkilledDetail)
router.get('/getOne/Skilled/:id', adminAuth, adminControlSkilled, adminGetOneSkilled)
router.patch('/update/Skilled/:id', adminAuth, adminControlSkilled, adminUpdateSkilled)
router.patch('/delete/Skilled/:id', adminAuth, adminControlSkilled, adminDeleteSkilled)

//SKILLED WORKER SKILL
router.get('/getAll/skill', adminAuth, adminControlSkilled, adminGetAllSkill)
router.get('/getOne/skill/:id', adminAuth, adminControlSkilled, getOneSkill)
router.patch('/update/skill/:id', adminAuth, adminControlSkilled, updateSkill)
router.delete('/delete/skill/:id', adminAuth, adminControlSkilled, deleteSkill)

//SKILLED EXP   
router.get('/getAll/SkilledExp/detail/:username', adminAuth, adminControlSkilled, adminGetAllSkilledExpDetail)
router.get('/getOne/SkilledExp/:id', adminAuth, adminControlSkilled, getOneExp)
router.patch('/update/SkilledExp/:id', adminAuth, adminControlSkilled, adminUpdateExperience)
router.patch('/delete/SkilledExp/:id', adminAuth, adminControlSkilled, deleteExp)

//SKILLED CERT
router.get('/getAll/Cert/detail/:username', adminAuth, adminControlSkilled, adminGetAllSkilledCertDetail)
router.get('/getOne/Cert/:id', adminAuth, adminControlSkilled, getOneCertificate)
router.patch('/update/Cert/:id', adminAuth, adminControlSkilled, adminUpdateCertificate)
router.patch('/delete/Cert/:id', adminAuth, adminControlSkilled, deleteCertificate)

//SKILLED BARANGAY CLEARANCE
router.get('/getAll/Barangay/detail/:username', adminAuth, adminControlSkilled, adminGetAllSkilledBarangayDetail)
router.get('/getOne/Barangay/:id', adminAuth, adminControlSkilled, getOneSkilledBClearance)
router.patch('/update/Barangay/:id', adminAuth, adminControlSkilled, adminUpdateBarangay)
router.patch('/delete/Barangay/:id', adminAuth, adminControlSkilled, deleteSkilledBClearance)

//SKILLED NBI CLEARANCE
router.get('/getAll/Nbi/detail/:username', adminAuth, adminControlSkilled, adminGetAllSkilledNbiDetail)
router.get('/getOne/Nbi/:id', adminAuth, adminControlSkilled, getOneSkilledNClearance)
router.patch('/update/Nbi/:id', adminAuth, adminControlSkilled, adminUpdateNbi)
router.patch('/delete/Nbi/:id', adminAuth, adminControlSkilled, deleteSkilledNClearance)

router.get('/getAll/skilledBill', adminAuth, adminControlSkilled, adminGetAllSkilledBill)
router.get('/getAll/skilledBill/detail', adminAuth, adminControlSkilled, adminGetAllSkilledBillDetail)
router.get('/getOne/skilledBill/:id', adminAuth, adminControlSkilled, getOneSkilledBill)
router.patch('/update/skilledBill/:id', adminAuth, adminControlSkilled, adminEditSkilledBill)
router.delete('/delete/skilledBill/:id', adminAuth, adminControlSkilled, deleteSkilledBill)

router.put('/update/skilled/billing', adminAuth, adminControlAdmin, adminUpdateSkilledBill)
router.put('/update/skilled/account', adminAuth, adminControlAdmin, adminUpdateSkilledAccount)
router.put('/update/skilled/account/not', adminAuth, adminControlAdmin, adminUpdateSkilledAccountNot)

router.patch('/update/skilled/address/:id', adminAuth, adminControlAdmin, adminEditSkilledAddress)

module.exports = router