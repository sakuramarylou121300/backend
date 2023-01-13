const express = require('express')
const {
    createContact, 
    getAllContact,
    getOneContact,
    updateContact,
    deleteContact
} = require('../controllers/clientContactController')
const clientRequireAuth = require('../middleware/clientRequireAuth')

//instance of router
router = express.Router()

router.use(clientRequireAuth)

//POST contact
router.post('/post/', createContact)

//GET contact
router.get('/get/', getAllContact)

//GET single contact
router.get('/getOne/:id', getOneContact)

//UPDATE single contact
router.patch('/update/:id', updateContact)

//DELETE contact
router.delete('/delete/:id', deleteContact)

//export
module.exports = router