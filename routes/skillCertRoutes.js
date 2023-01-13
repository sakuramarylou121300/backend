const express = require('express')
const {
    createCertificate, 
    getAllCertificate,
    getOneCertificate,
    updateCertificate,
    deleteCertificate
} = require('../controllers/skillCertController')
const requireAuth = require('../middleware/requireAuth')

//instance of router
router = express.Router()

router.use(requireAuth)

//POST skill cert
router.post('/post/', createCertificate)

//GET all skill cert
router.get('/getAll/', getAllCertificate)

//GET single skill cert
router.get('/getOne/:id', getOneCertificate)

//UPDATE skill cert
router.patch('/update/:id', updateCertificate)

//delete skill cert
router.delete('/delete/:id', deleteCertificate)

//export
module.exports = router