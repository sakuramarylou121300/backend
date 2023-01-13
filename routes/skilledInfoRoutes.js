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
    pushAddress,
    updateAddress,
    pullAddress,
    pushContact,
    updateContact,
    pullContact
   
} = require('../controllers/skilledInfoController')

const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

//log in route
router.post('/login', skilledLogIn)

//sign up route
router.post('/signup', skilledSignUp)

//GET skilled info for update
router.get('/get', requireAuth, getSkilledInfo)

//UPDATE skilled email 
router.patch('/update/username', requireAuth, updateSkilledUserName)

//UPDATE skilled password 
router.patch('/update/password', requireAuth, updateSkilledPass)

//UPDATE skilled info 
router.patch('/update', requireAuth, updateSkilledInfo)

//UPDATE skilled info  add
router.put('/edit/address', requireAuth, editAddress)

//UPDATE skilled info nclearance
router.put('/edit/bill', requireAuth, editBill)

//DELETE skilled info 
router.delete('/delete', requireAuth, deleteSkilledInfo)

//PUSH address for update
router.patch('/push/address', requireAuth, pushAddress)

//UPDATE skilled address 
router.put('/update/address/:arrayId', requireAuth, updateAddress)

//PULL skilled address 
router.delete('/pull/address/:arrayId', requireAuth, pullAddress)

//PUSH contact for update
router.patch('/push/contact', requireAuth, pushContact)

//UPDATE skilled contact 
router.put('/update/contact/:arrayId', requireAuth, updateContact)

//PULL skilled contact 
router.delete('/pull/contact/:arrayId', requireAuth, pullContact)

module.exports = router