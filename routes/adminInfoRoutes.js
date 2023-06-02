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
    adminGetAllClient,
    adminGetOneClient,
    adminUpdateClient,
    adminDeleteClient,
    adminGetAllSkill,
    adminGetAllExpSkilledDetail,
    adminGetAllCertSkilledDetail,
    adminGetAllBClearanceSkilledDetail,
    adminGetAllNClearanceSkilledDetail,
    adminGetAllSkilledExpDetail,
    adminGetAllSkilledCertDetail,
    adminGetAllSkilledBarangayDetail,
    adminGetAllSkilledNbiDetail,
    adminGetAllBClearanceClientDetail,
    adminGetAllNClearanceClientDetail,
    adminUpdateExperience,
    adminUpdateCertificate,
    adminUpdateBarangay,
    adminUpdateNbi,
    adminUpdateBarangayClient,
    adminUpdateNbiClient,
    updateExpIsRead,
    adminGetAllSkilledDeact, 
    adminGetAllSkilledCertDetailExpired,
    adminGetAllSkilledBarangayDetailExpired,
    adminGetAllSkilledNbiDetailExpired,
    adminGetAllSkilledExpDeleted,
    adminGetAllSkilledCertDeleted,
    adminGetAllSkilledBarangayDeleted,
    adminGetAllSkilledNbiDeleted,
    adminGetAllClientBarangayDetail,
    adminGetAllClientNbiDetail,
    reactivateSkilledInfo,
    reactivateClientInfo,
    adminGetAllSkilledBill,
    adminGetAllSkilledBillDetail,
    adminEditSkilledBill,
    adminUpdateSkilledBill,
    adminUpdateSkilledAccount,
    adminUpdateSkilledAccountNot, 
    adminEditSkilledAddress
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
    createTitle,
    getAllTitle,
    getAllSkillTitle,
    getOneTitle,
    updateSkillTitle,
    deleteTitle,
    getAllSkillDeleted,
    restoreSkill
} = require('../controllers/skillTitleController')

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
    getAllNotification,
    deleteNotification
} = require('../controllers/adminNotificationController')


const{
    getOneSkilledBill,
    deleteSkilledBill
} = require('../controllers/skilledBillController')

const{
    createReason,
    getAllReason,
    getOneReason,
    updateReason,
    deleteReason
} = require('../controllers/reasonController')

const{
    createReasonDeact,
    getAllReasonDeact,
    getOneReasonDeact,
    updateReasonDeact,
    deleteReasonDeact
} = require('../controllers/reasonDeactController')

const adminControlAdmin = require('../middleware/adminControlAdmin')
const adminAuth = require('../middleware/adminAuth')
const adminControlSkilled = require('../middleware/adminControlSkilled')
const {requireAuth} = require('../middleware/requireAuth')

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
router.patch('/reactivate/Skilled/:username', adminAuth, adminControlSkilled, reactivateSkilledInfo)

//SKILLED WORKER SKILL
router.get('/getAll/skill', adminAuth, adminControlSkilled, adminGetAllSkill)
router.get('/getOne/skill/:id', adminAuth, adminControlSkilled, getOneSkill)
router.patch('/update/skill/:id', adminAuth, adminControlSkilled, updateSkill)
// router.delete('/delete/skill/:id', adminAuth, adminControlSkilled, deleteSkill)

//SKILLED WORKER SKILL TITLE
router.post('/post/title', adminAuth, adminControlSkilled, createTitle)
router.get('/getAll/title', adminAuth, adminControlSkilled, getAllTitle)
router.get('/getAll/skillTitle/:skill_id', adminAuth, adminControlSkilled, getAllSkillTitle)
router.get('/getOne/title/:id', adminAuth, adminControlSkilled, getOneTitle)
router.patch('/update/title/:id', adminAuth, adminControlSkilled, updateSkillTitle)
router.patch('/delete/title/:id', adminAuth, adminControlSkilled, deleteTitle)
router.get('/deleted/title/:skill_id/:title', adminAuth, adminControlAdmin, getAllSkillDeleted)
router.patch('/restore/title/:id', adminAuth, adminControlAdmin, restoreSkill)
//public
router.get('/getAll/skillTitle/:skill_id', requireAuth, getAllSkillTitle)

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

//CLIENT INFO
router.get('/getAll/Client', adminAuth, adminControlSkilled, adminGetAllClient)
router.get('/getOne/Client/:id', adminAuth, adminControlSkilled, adminGetOneClient)
router.patch('/update/Client/:id', adminAuth, adminControlSkilled, adminUpdateClient)
router.patch('/delete/Client/:id', adminAuth, adminControlSkilled, adminDeleteClient)
router.patch('/reactivate/Client/:username', adminAuth, adminControlSkilled, reactivateClientInfo)
//SORT CLIENT
router.get('/getAll/Client/Bclearance/sort', adminAuth, adminControlSkilled, adminGetAllBClearanceClientDetail)
router.get('/getAll/Client/NClearance/sort', adminAuth, adminControlSkilled, adminGetAllNClearanceClientDetail)

//GET CLIENT USERNAME
router.get('/getAll/Client/Bclearance/:username', adminAuth, adminControlSkilled, adminGetAllClientBarangayDetail)
router.get('/getAll/Client/Nclearance/:username', adminAuth, adminControlSkilled, adminGetAllClientNbiDetail)

//UPDATE INFO CLIENT
router.patch('/update/Client/Barangay/:id', adminAuth, adminControlSkilled, adminUpdateBarangayClient)
router.patch('/update/Client/Nbi/:id', adminAuth, adminControlSkilled, adminUpdateNbiClient)
//NOTIFICATION
router.get('/getAll/Notification/', adminAuth, getAllNotification)
router.patch('/delete/Notification/:id', adminAuth, adminControlSkilled, deleteNotification)

//TABLES
router.get('/getAll/skilledDeact', adminAuth, adminControlSkilled, adminGetAllSkilledDeact)
router.get('/getAll/cert/expired/:username', adminAuth, adminControlSkilled, adminGetAllSkilledCertDetailExpired)
router.get('/getAll/barangay/expired/:username', adminAuth, adminControlSkilled, adminGetAllSkilledBarangayDetailExpired)
router.get('/getAll/nbi/expired/:username', adminAuth, adminControlSkilled, adminGetAllSkilledNbiDetailExpired)
router.get('/getAll/exp/deleted/:username', adminAuth, adminControlSkilled, adminGetAllSkilledExpDeleted)
router.get('/getAll/cert/deleted/:username', adminAuth, adminControlSkilled, adminGetAllSkilledCertDeleted)
router.get('/getAll/barangay/deleted/:username', adminAuth, adminControlSkilled, adminGetAllSkilledBarangayDeleted)
router.get('/getAll/nbi/deleted/:username', adminAuth, adminControlSkilled, adminGetAllSkilledNbiDeleted)

//REASON FOR REQ
router.post('/post/reason', adminAuth, adminControlSkilled, createReason)
router.get('/getAll/reason', adminAuth, adminControlSkilled, getAllReason)
router.get('/getOne/reason/:id', adminAuth, adminControlSkilled, getOneReason)
router.patch('/update/reason/:id', adminAuth, adminControlSkilled, updateReason)
router.patch('/delete/reason/:id', adminAuth, adminControlSkilled, deleteReason)

//REASON FOR DEACT
router.post('/post/reasonDeact', adminAuth, adminControlSkilled, createReasonDeact)
router.get('/getAll/reasonDeact', adminAuth, adminControlSkilled, getAllReasonDeact)
router.get('/getOne/reasonDeact/:id', adminAuth, adminControlSkilled, getOneReasonDeact)
router.patch('/update/reasonDeact/:id', adminAuth, adminControlSkilled, updateReasonDeact)
router.patch('/delete/reasonDeact/:id', adminAuth, adminControlSkilled, deleteReasonDeact)


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