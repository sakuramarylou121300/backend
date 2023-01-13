const express = require('express')
const {
    createRole, 
    getAllRole,
    // getOneCertificate,
    // updateCertificate,
    // deleteCertificate
} = require('../controllers/roleController')

//instance of router
router = express.Router()

//POST role cert
router.post('/post/', createRole)

//GET all role cert
router.get('/getAll/', getAllRole)

// //GET single skill cert
// router.get('/getOne/:id', getOneCertificate)

// //UPDATE skill cert
// router.patch('/update/:id', updateCertificate)

// //delete skill cert
// router.delete('/delete/:id', deleteCertificate)

//export
module.exports = router