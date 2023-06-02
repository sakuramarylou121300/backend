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
    verifyOTP
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

//notification
router.get('/getAll/notification', clientRequireAuth, getAllNotification)
router.patch('/delete/notification/:id', clientRequireAuth, deleteNotification)
module.exports = router