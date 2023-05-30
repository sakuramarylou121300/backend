const express = require('express')
const upload = require("../utils/multer")

const {
    createSkilledNClearance,
    getAllSkilledNClearance,
    getAllExpiredNClearance,
    getOneSkilledNClearance,
    updateSkilledNClearance,
    deleteSkilledNClearance
} = require('../controllers/skilledNClearanceController')
const {requireAuth} = require('../middleware/requireAuth')

//instance of router
router = express.Router()

router.post('/post', requireAuth, upload.array("photo"), createSkilledNClearance)
router.get('/getAll/', requireAuth, getAllSkilledNClearance)
router.get('/getAll/expired', requireAuth, getAllExpiredNClearance)
router.get('/getOne/:id', requireAuth, getOneSkilledNClearance)
router.patch('/update/:id', requireAuth, upload.array("photo"), updateSkilledNClearance)
router.patch('/delete/:id', requireAuth, deleteSkilledNClearance)

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