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

router.post('/post/', createCertificate)
router.get('/getAll/', getAllCertificate)
router.get('/getOne/:id', getOneCertificate)
router.patch('/update/:id', updateCertificate)
router.patch('/delete/:id', deleteCertificate)

//export
module.exports = router