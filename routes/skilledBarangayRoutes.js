const express = require('express') 
const cloudinary = require("../utils/cloudinary")
const upload = require("../utils/multer")
const {
    createBarangay,
    getAllBarangay,
    updateBarangay, 
    deleteBarangay
} = require('../controllers/skilledBarangayController')
const requireAuth = require('../middleware/requireAuth')

//instance of router
router = express.Router()

router.use(requireAuth)

router.post('/post/', upload.single("barangayPhoto"), createBarangay)
router.get('/get/', getAllBarangay)
router.put('/update/:id', upload.array("barangayPhoto"), updateBarangay)
router.patch('/delete/:id', deleteBarangay)

//export
module.exports = router