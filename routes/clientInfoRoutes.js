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
    getClientSkilledCreatedAtDesc,
    getClientSkilledCreatedAtAsc,
    getClientSkilledUserNameDesc,
    getClientSkilledUserNameAsc,
    getClientSkilledFNameDesc,
    getClientSkilledFNameAsc,
    getClientSkilledLNameDesc,
    getClientSkilledLNameAsc,
    getClientSkilledSkillCreatedAtDesc,
    getClientSkilledSkillCreatedAtAsc,
    getClientSkilledSkillUsernameAsc,
    getClientSkilledSkillUsernameDesc,
    getFilterSkilled,
    getFilterSkilledSkillDesc,
    getFilterSkilledSkillAsc

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

//FILTERING
router.get('/skilled/createdAt/desc', clientRequireAuth, getClientSkilledCreatedAtDesc)
router.get('/skilled/createdAt/asc', clientRequireAuth, getClientSkilledCreatedAtAsc)
router.get('/skilled/username/desc', clientRequireAuth, getClientSkilledUserNameDesc)
router.get('/skilled/username/asc', clientRequireAuth, getClientSkilledUserNameAsc)
router.get('/skilled/fname/desc', clientRequireAuth, getClientSkilledFNameDesc)
router.get('/skilled/fname/asc', clientRequireAuth, getClientSkilledFNameAsc)
router.get('/skilled/lname/desc', clientRequireAuth, getClientSkilledLNameDesc)
router.get('/skilled/lname/asc', clientRequireAuth, getClientSkilledLNameAsc)
router.get('/skilled/skill/desc/:_id', clientRequireAuth, getClientSkilledSkillCreatedAtDesc)
router.get('/skilled/skill/asc/:_id', clientRequireAuth, getClientSkilledSkillCreatedAtAsc)
router.get('/skilled/skill/username/asc/:_id', clientRequireAuth, getClientSkilledSkillUsernameAsc)
router.get('/skilled/skill/username/desc/:_id', clientRequireAuth, getClientSkilledSkillUsernameDesc)

//final filtering
router.get('/filter/skilled', clientRequireAuth, getFilterSkilled)
router.get('/filter/skilled/skill/desc/:_id', clientRequireAuth, getFilterSkilledSkillDesc)
router.get('/filter/skilled/skill/asc/:_id', clientRequireAuth, getFilterSkilledSkillAsc)

module.exports = router