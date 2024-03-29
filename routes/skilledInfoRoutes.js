const express = require('express')
const upload = require("../utils/multer")

//controller functions
const{
    skilledLogIn,
    skilledSignUp,
    getSkilledInfo,
    updateSkilledUserName,
    updateSkilledPass,
    updateSkilledInfo,
    updateSkilledAddress,
    deleteSkilledInfo,
    generateOTP,
    verifyOTP,
    editAddress,
    editBill,
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

//this is for notifications
const{ 
    getAllNotification,
    deleteNotification 
} = require('../controllers/skilledNotificationController')

const {requireAuth, localVariables} = require('../middleware/requireAuth')

const router = express.Router()

router.post('/login', skilledLogIn)
router.post('/signup', upload.single('profilePicture'), skilledSignUp)
router.get('/get', requireAuth, getSkilledInfo)
router.patch('/update/username', requireAuth, updateSkilledUserName)
router.patch('/update/password', requireAuth, updateSkilledPass)
router.patch('/update', requireAuth, upload.single('profilePicture'), updateSkilledInfo)
router.patch('/update/address', requireAuth, updateSkilledAddress)
router.put('/edit/address', requireAuth, editAddress)
router.put('/edit/bill', requireAuth, editBill)
router.patch('/delete', requireAuth, deleteSkilledInfo)

// this is for the address
router.get('/generateOTP', localVariables, requireAuth, generateOTP)
router.patch('/verifyOTP', requireAuth, verifyOTP)

router.put('/update/account', requireAuth, skilledUpdateSkilledAccount)
router.put('/update/account/not', requireAuth, skilledUpdateNotVerifiedUsers)
router.put('/update/bill', requireAuth, skilledUpdateBill)
router.patch('/update/skilled/account', requireAuth, updateSkilledAccount)
router.patch('/push/address', requireAuth, pushAddress)
router.put('/update/address/:arrayId', requireAuth, updateAddress)
router.delete('/pull/address/:arrayId', requireAuth, pullAddress)
router.patch('/push/contact', requireAuth, pushContact)
router.put('/update/contact/:arrayId', requireAuth, updateContact)
router.delete('/pull/contact/:arrayId', requireAuth, pullContact)

//this is for the notification
router.get('/get/notification', requireAuth, getAllNotification)
router.patch('/delete/notification/:id', requireAuth, deleteNotification)

// Error handling middleware
router.use((err, req, res, next) => {
    if (err.statusCode && err.statusCode === 400) {
      return res.status(400).json({ error: err.message });
    }
    // Handle other errors
    return res.status(500).json({ error: 'File is not supported. Please upload a photo with JPEG, JPG, PNG format only.' });
});
module.exports = router