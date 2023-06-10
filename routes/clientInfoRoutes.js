const express = require('express')

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
    getClientSkilledInfo,
    getClientSkilledSkill,
    getClientSkilledCert,
    getClientSkilledExp
} = require('../controllers/clientFilterSkilledController')

const {clientRequireAuth,localVariables} = require('../middleware/clientRequireAuth')
const { updateAddress } = require('../controllers/skilledInfoController')

const router = express.Router()
router.post('/login', clientLogIn)
router.post('/signup', clientSignUp)
router.get('/get', clientRequireAuth, getClientInfo)
router.patch('/update/username', clientRequireAuth, updateClientUsername)
router.patch('/update/password', clientRequireAuth, updateClientPass)
router.patch('/update', clientRequireAuth, updateClientInfo)
router.delete('/delete', clientRequireAuth, deleteClientInfo)
router.patch('/update/address', clientRequireAuth, updateClientAddress)
router.get('/generateOTP', localVariables, clientRequireAuth, generateOTP)
router.patch('/verifyOTP', clientRequireAuth, verifyOTP)

//notification
router.get('/getAll/notification', clientRequireAuth, getAllNotification)
router.patch('/delete/notification/:id', clientRequireAuth, deleteNotification)

//final filtering
router.get('/filter/skilled', clientRequireAuth, getFilterSkilled)
router.get('/filter/skilled/skill/desc/:_id', clientRequireAuth, getFilterSkilledSkillDesc)
router.get('/filter/skilled/skill/asc/:_id', clientRequireAuth, getFilterSkilledSkillAsc)
//all get one
router.get('/getOne/skilledInfo/:id', clientRequireAuth, getClientSkilledInfo)
router.get('/getOne/skilledInfo/skill/:_id', clientRequireAuth, getClientSkilledSkill)
router.get('/getOne/skilledInfo/skillCert/:_id', clientRequireAuth, getClientSkilledCert)
router.get('/getOne/skilledInfo/skilledExp/:_id/:skillName', clientRequireAuth, getClientSkilledExp)

module.exports = router