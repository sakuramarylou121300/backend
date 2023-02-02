const express = require('express')
const {
    createSkilledBill, 
    getAllSkilledBill,
    getOneSkilledBill,
    updateSkilledBill,
    deleteSkilledBill,
} = require('../controllers/skilledBillController')
const requireAuth = require('../middleware/requireAuth')

//instance of router
router = express.Router()

router.use(requireAuth)

router.post('/post/', createSkilledBill)
router.get('/getAll/', getAllSkilledBill)
router.get('/getOne/:id', getOneSkilledBill)
router.patch('/update/:id', updateSkilledBill)
router.patch('/delete/:id', deleteSkilledBill)

//export
module.exports = router