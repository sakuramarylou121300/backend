const express = require('express')
const upload = require("../utils/multer")

const {
    createClientNClearance,
    getAllClientNClearance,
    getAllExpiredNClearance,
    getOneClientNClearance,
    updateClientNClearance,
    deleteClientNClearance
} = require('../controllers/clientNClearanceController')
const {clientRequireAuth} = require('../middleware/clientRequireAuth')

//instance of router
router = express.Router()

router.post('/post', clientRequireAuth, upload.array("photo"), createClientNClearance)
router.get('/getAll/', clientRequireAuth, getAllClientNClearance)
router.get('/getAll/expired', clientRequireAuth, getAllExpiredNClearance)
router.get('/getOne/:id', clientRequireAuth, getOneClientNClearance)
router.patch('/update/:id', clientRequireAuth, upload.array("photo"), updateClientNClearance)
router.patch('/delete/:id', clientRequireAuth, deleteClientNClearance)

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