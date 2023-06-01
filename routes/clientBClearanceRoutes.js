const express = require('express')
const upload = require("../utils/multer")

const {
    createClientBClearance,
    getAllClientBClearance,
    getAllClientExpiredBClearance, 
    getOneClientBClearance,
    updateClientBClearance,
    deleteClientBClearance
} = require('../controllers/clientBClearanceController')
const {clientRequireAuth} = require('../middleware/clientRequireAuth')

//instance of router
router = express.Router()

router.post('/post', clientRequireAuth, upload.single("photo"), createClientBClearance)
router.get('/getAll/', clientRequireAuth, getAllClientBClearance)
router.get('/getAll/expired', clientRequireAuth, getAllClientExpiredBClearance)
router.get('/getOne/:id', clientRequireAuth, getOneClientBClearance)
router.patch('/update/:id', clientRequireAuth, upload.single("photo"), updateClientBClearance)
router.patch('/delete/:id', clientRequireAuth, deleteClientBClearance)

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