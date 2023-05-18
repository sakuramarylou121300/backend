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

const {requireAuth} = require('../middleware/requireAuth')

//instance of router
router = express.Router()

router.use(requireAuth)

router.post('/post/',  upload.single("photo"), requireAuth, createCertificate)
router.get('/getAll/', requireAuth, getAllCertificate)
router.get('/getAll/skillCert/:skill', requireAuth, getAllCertSkill)
router.get('/getAll/expired', requireAuth, getAllExpiredCert)
router.get('/getOne/:id', requireAuth, getOneCertificate)
router.patch('/update/:id', upload.single("photo"), requireAuth, updateCertificate)
router.patch('/delete/:id', requireAuth, deleteCertificate)
router.get('/getAll/CertTitle/:skillName', requireAuth, getAllSkillCertTitle)


router.get('/getAll/public/skillTitle/:skill_id', requireAuth, getAllSkillTitle)

// Error handling middleware
router.use((err, req, res, next) => {
    if (err.statusCode && err.statusCode === 400) {
      return res.status(400).json({ error: err.message });
    }
    // Handle other errors
    return res.status(500).json({ error: 'File is not supported. Please upload a photo with JPEG, JPG, PNG format only.' });
});
  

//export
module.exports = router