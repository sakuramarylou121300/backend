const express = require('express')
const {
    createSkilledDates,
    createSkilledDate,
    getAllSkilledDate,
    getOneSkilledDate,
    updateSkilledDate,
    deleteSkilledDate
} = require('../controllers/skilledDateController')

const {requireAuth} = require('../middleware/requireAuth')

//instance of router
router = express.Router()

router.post('/posts', requireAuth, createSkilledDates)
router.post('/post', requireAuth, createSkilledDate)
router.get('/getAll', requireAuth, getAllSkilledDate)
router.get('/getOne/:id', requireAuth, getOneSkilledDate)
router.patch('/update/:id', requireAuth, updateSkilledDate)
router.patch('/delete/:id', requireAuth, deleteSkilledDate
)

//export
module.exports = router