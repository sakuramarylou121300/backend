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
    getClientSkilledSkillUsernameDesc
} = require('../controllers/clientInfoController')

const{
    getAllNotification,
    deleteNotification 
} = require('../controllers/clientNotificationController')


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

//notification
router.get('/getAll/notification', clientRequireAuth, getAllNotification)
router.patch('/delete/notification/:id', clientRequireAuth, deleteNotification)
module.exports = router