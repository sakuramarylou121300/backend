const express = require('express') 
const cloudinary = require("../utils/cloudinary")
const upload = require("../utils/multer")

const {
    createCertificate, 
    getAllCertificate,
    getAllExpiredCert,
    getOneCertificate,
    updateCertificate,
    deleteCertificate
} = require('../controllers/skillCertController')
const requireAuth = require('../middleware/requireAuth')

//instance of router
router = express.Router()

router.use(requireAuth)

router.post('/post/',  upload.single("photo"), requireAuth, createCertificate)
router.get('/getAll/', requireAuth, getAllCertificate)
router.get('/getOne/:id', requireAuth, getOneCertificate)
router.patch('/update/:id', upload.single("photo"), requireAuth, updateCertificate)
router.patch('/delete/:id', requireAuth, deleteCertificate)

//export
module.exports = router