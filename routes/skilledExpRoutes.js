const express = require('express') 
const cloudinary = require("../utils/cloudinary")
const upload = require("../utils/multer")
const {
    createExp,
    getAllExp,
    getOneExp, 
    updateExp,
    deleteExp
} = require('../controllers/skilledExpController')
const requireAuth = require('../middleware/requireAuth')

//instance of router
router = express.Router()

router.use(requireAuth)

router.post('/post/', upload.array("photo"), createExp)
router.get('/getAll/', getAllExp)
router.get('/getOne/:id', getOneExp)
router.put('/update/:id', upload.array("photo"), updateExp)
router.patch('/delete/:id', deleteExp)

//export
module.exports = router