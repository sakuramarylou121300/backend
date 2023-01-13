const express = require('express')
const {
    createContact, 
    getAllContact,
    getOneContact,
    updateContact,
    deleteContact
} = require('../controllers/skilledContactController')
const requireAuth = require('../middleware/requireAuth')

//instance of router
router = express.Router()

router.use(requireAuth)

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