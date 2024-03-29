const express = require('express')
const upload = require("../utils/multer")

//controller functions
const{
    clientLogIn,
    clientSignUp,
    getClientInfo,
    updateClientUsername,
    updateClientPass,
    updateClientInfo,
    deleteClientInfo,
    updateClientAddress,
    generateOTP,
    verifyOTP,
    updateClientAccount
} = require('../controllers/clientInfoController')

//client notification 
const{
    getAllNotification,
    deleteNotification 
} = require('../controllers/clientNotificationController')

//filtering skilled worker
const{
    getFilterSkilled,
    getFilterSkilledSkillDesc,
    getFilterSkilledSkillAsc,
    getFilterSkilledSkillTopRate,
    getFilterSkilledSkill,
    getClientSkilledInfo,
    getClientSkilledSkill,
    getClientSkilledCert,
    getClientSkilledExp,
    getClientSkilledDate
} = require('../controllers/clientFilterSkilledController')

//get all skill for client
const {
    getAllSkill,
    getOneSkill
} = require('../controllers/adminSkillController')

//authentication
const {clientRequireAuth,localVariables} = require('../middleware/clientRequireAuth')
//only virified client can view skilled worker
const clientVerified = require('../middleware/clientVerified')
const { updateAddress } = require('../controllers/skilledInfoController')

const router = express.Router()
router.post('/login', clientLogIn)
// router.post('/signup', upload.single('profilePicture'), clientSignUp)
router.post('/signup', upload.single('profilePicture'), clientSignUp);

router.get('/get', clientRequireAuth, getClientInfo)
router.patch('/update/username', clientRequireAuth, updateClientUsername)
router.patch('/update/password', clientRequireAuth, updateClientPass)
router.patch('/update', clientRequireAuth, upload.single('profilePicture'), updateClientInfo)
router.delete('/delete', clientRequireAuth, deleteClientInfo)
router.patch('/update/address', clientRequireAuth, updateClientAddress)
router.get('/generateOTP', localVariables, clientRequireAuth, generateOTP)
router.patch('/verifyOTP', clientRequireAuth, verifyOTP)
router.patch('/update/client/account', clientRequireAuth, updateClientAccount)

//notification
router.get('/getAll/notification', clientRequireAuth, getAllNotification)
router.patch('/delete/notification/:id', clientRequireAuth, deleteNotification)

//final filtering
router.get('/filter/skilled/all', clientRequireAuth, clientVerified, getFilterSkilled)
router.get('/filter/skilled/skill/desc/:_id', clientRequireAuth, clientVerified, getFilterSkilledSkillDesc)
router.get('/filter/skilled/skill/asc/:_id', clientRequireAuth, clientVerified, getFilterSkilledSkillAsc)
router.get('/filter/skilled/skill/toprate/:_id', clientRequireAuth, clientVerified, getFilterSkilledSkillTopRate)
router.get('/filter/skilled/:_id', clientRequireAuth, clientVerified, getFilterSkilledSkill);
//all get one
router.get('/getOne/skilledInfo/:id', clientRequireAuth, clientVerified, getClientSkilledInfo)
router.get('/getOne/skilledInfo/skill/:_id', clientRequireAuth, clientVerified, getClientSkilledSkill)
router.get('/getOne/skilledInfo/skillCert/:_id/:skillId', clientRequireAuth, getClientSkilledCert)
router.get('/getOne/skilledInfo/skilledExp/:_id/:skillId', clientRequireAuth, getClientSkilledExp)
router.get('/getOne/skilledInfo/skilledDate/:_id', clientRequireAuth, getClientSkilledDate)

//get all skill, admin
router.get('/getAll/client/skilledskill', clientRequireAuth, getAllSkill)
router.get('/getOne/client/skilledskill/:id', clientRequireAuth, getOneSkill)

module.exports = router