const express = require('express') 
const cloudinary = require("../utils/cloudinary")
const upload = require("../utils/multer")
const {
    createExp,
    getAllExp,
    getAllExpSkill,
    getAllExpiredExp,
    getOneExp, 
    updateExp,
    deleteExp
} = require('../controllers/skilledExpController')
const {requireAuth} = require('../middleware/requireAuth')

//instance of router
router = express.Router()

router.use(requireAuth)

router.post('/post/', upload.array("photo"), requireAuth, createExp)
router.get('/getAll/', requireAuth, getAllExp)
router.get('/getAll/skillexp/:skill', requireAuth, getAllExpSkill)
router.get('/getAll/expired', requireAuth, getAllExpiredExp)
router.get('/getOne/:id', requireAuth, getOneExp)
router.put('/update/:id', upload.array("photo"), requireAuth, updateExp)
router.patch('/delete/:id', requireAuth, deleteExp)

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