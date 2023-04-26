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
const requireAuth = require('../middleware/requireAuth')

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

//export
module.exports = router