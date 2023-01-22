const express = require('express')

//controller functions
const{
    clientLogIn,
    clientSignUp,
    getClientInfo,
    updateClientusername,
    updateClientPass,
    updateClientInfo,
    deleteClientInfo,
    pushAddress,
    updateAddress,
    pullAddress,
    pushContact,
    updateContact,
    pullContact
} = require('../controllers/clientInfoController')

const clientRequireAuth = require('../middleware/clientRequireAuth')

const router = express.Router()

//log in route
router.post('/login', clientLogIn)

//sign up route
router.post('/signup', clientSignUp)

//GET client info for update
router.get('/get', clientRequireAuth, getClientInfo)

//UPDATE client username 
router.patch('/update/username', clientRequireAuth, updateClientusername)

//UPDATE client password 
router.patch('/update/password', clientRequireAuth, updateClientPass)

//UPDATE client info 
router.patch('/update', clientRequireAuth, updateClientInfo)

//DELETE client info 
router.delete('/delete', clientRequireAuth, deleteClientInfo)

//PUSH address for update
router.patch('/push/address', clientRequireAuth, pushAddress)

//UPDATE client address 
router.put('/update/address/:arrayId', clientRequireAuth, updateAddress)

//PULL client address 
router.delete('/pull/address/:arrayId', clientRequireAuth, pullAddress)

//PUSH contact for update
router.patch('/push/contact', clientRequireAuth, pushContact)

//UPDATE client contact 
router.put('/update/contact/:arrayId', clientRequireAuth, updateContact)

//PULL client contact 
router.delete('/pull/contact/:arrayId', clientRequireAuth, pullContact)

module.exports = router