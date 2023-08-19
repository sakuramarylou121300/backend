const express = require('express')
const {
    createReasonSkill,
    createReasonTitle,
    getAllReasonSkill,
    getAllReasonTitle,
    getOneReasonSkill,
    updateReasonSkill,
    deleteReasonSkill
} = require('../controllers/reasonSkillController')

const adminControlAdmin = require('../middleware/adminControlAdmin')
const adminAuth = require('../middleware/adminAuth')

//instance of router
router = express.Router()

router.post('/post/', adminAuth, adminControlAdmin, createReasonSkill)
router.post('/post/title', adminAuth, adminControlAdmin, createReasonTitle)
router.get('/getAll/', adminAuth, adminControlAdmin, getAllReasonSkill)
router.get('/getAll/title', adminAuth, adminControlAdmin, getAllReasonTitle)
router.get('/getOne/:id', adminAuth, adminControlAdmin, getOneReasonSkill)
router.patch('/update/:id', adminAuth, adminControlAdmin, updateReasonSkill)
router.patch('/delete/:id', adminAuth, adminControlAdmin, deleteReasonSkill)

//export
module.exports = router