const express = require('express')

//controller functions
const{
    skilledLogIn,
    skilledSignUp,
    getSkilledInfo,
    updateSkilledUserName,
    updateSkilledPass,
    updateSkilledInfo,
    editAddress,
    editBill,
    deleteSkilledInfo,
    generateOTP,
    verifyOTP,
    skilledUpdateSkilledAccount,
    skilledUpdateNotVerifiedUsers,
    skilledUpdateBill,
    updateSkilledAccount,
    pushAddress,
    updateAddress,
    pullAddress,
    pushContact,
    updateContact,
    pullContact
   
} = require('../controllers/skilledInfoController')

const{ 
    getAllNotification,
    deleteNotification 
} = require('../controllers/skilledNotificationController')

const {requireAuth, localVariables} = require('../middleware/requireAuth')

const router = express.Router()

router.post('/login', skilledLogIn)
router.post('/signup', skilledSignUp)
router.get('/get', requireAuth, getSkilledInfo)
router.patch('/update/username', requireAuth, updateSkilledUserName)
router.patch('/update/password', requireAuth, updateSkilledPass)
router.patch('/update', requireAuth, updateSkilledInfo)
router.put('/edit/address', requireAuth, editAddress)
router.put('/edit/bill', requireAuth, editBill)
router.patch('/delete', requireAuth, deleteSkilledInfo)

// this is for the address
router.get('/generateOTP', localVariables, requireAuth, generateOTP)
router.get('/verifyOTP', requireAuth, verifyOTP)

router.put('/update/account', requireAuth, skilledUpdateSkilledAccount)
router.put('/update/account/not', requireAuth, skilledUpdateNotVerifiedUsers)
router.put('/update/bill', requireAuth, skilledUpdateBill)
router.put('/update/skilled/account', requireAuth, updateSkilledAccount)
router.patch('/push/address', requireAuth, pushAddress)
router.put('/update/address/:arrayId', requireAuth, updateAddress)
router.delete('/pull/address/:arrayId', requireAuth, pullAddress)
router.patch('/push/contact', requireAuth, pushContact)
router.put('/update/contact/:arrayId', requireAuth, updateContact)
router.delete('/pull/contact/:arrayId', requireAuth, pullContact)

//this is for the notification
router.get('/get/notification', requireAuth, getAllNotification)
router.patch('/delete/notification/:id', requireAuth, deleteNotification)

module.exports = router