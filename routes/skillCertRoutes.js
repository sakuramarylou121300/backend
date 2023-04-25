const express = require('express') 
const cloudinary = require("../utils/cloudinary")
const upload = require("../utils/multer")

const {
    createCertificate, 
    getAllCertificate,
    getAllCertSkill,
    getAllExpiredCert,
    getOneCertificate,
    updateCertificate,
    deleteCertificate,
    getAllSkillCertTitle
} = require('../controllers/skillCertController')

const{
    getAllSkillTitle
} = require('../controllers/skillTitleController')

const requireAuth = require('../middleware/requireAuth')

//instance of router
router = express.Router()

router.use(requireAuth)

router.post('/post/',  upload.single("photo"), requireAuth, createCertificate)
router.get('/getAll/', requireAuth, getAllCertificate)
router.get('/getAll/skillCert/:categorySkill', requireAuth, getAllCertSkill)
router.get('/getAll/expired', requireAuth, getAllExpiredCert)
router.get('/getOne/:id', requireAuth, getOneCertificate)
router.patch('/update/:id', upload.single("photo"), requireAuth, updateCertificate)
router.patch('/delete/:id', requireAuth, deleteCertificate)
router.get('/getAll/CertTitle/:skillName', requireAuth, getAllSkillCertTitle)


router.get('/getAll/public/skillTitle/:skill_id', requireAuth, getAllSkillTitle)

//export
module.exports = router