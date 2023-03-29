const express = require('express')
const cloudinary = require("../utils/cloudinary")
const upload = require("../utils/multer")

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

router.post('/post/',  upload.single("photo"), createCertificate)
router.get('/getAll/', getAllCertificate)
router.get('/getOne/:id', getOneCertificate)
router.patch('/update/:id', upload.single("photo"), updateCertificate)
router.patch('/delete/:id', deleteCertificate)

//export
module.exports = router