const express = require('express')
const {
    createReasonSkill,
    createReasonTitle,
    getAllReasonSkill,
    getAllReasonTitle,
    getOneReasonSkill,
    updateReasonSkill,
    updateReasonSkillTitle,
    deleteReasonSkill
} = require('../controllers/reasonSkillController')

const adminControlAdmin = require('../middleware/adminControlAdmin')
const adminControlSkilled = require('../middleware/adminControlSkilled')
const adminAuth = require('../middleware/adminAuth')

//instance of router
router = express.Router()

router.post('/post/', adminAuth, adminControlAdmin, createReasonSkill)
router.post('/post/title', adminAuth, adminControlAdmin, createReasonTitle)
router.get('/getAll/', adminAuth, adminControlAdmin, getAllReasonSkill)
router.get('/getAll/title', adminAuth, adminControlAdmin, getAllReasonTitle)
router.get('/getOne/:id', adminAuth, adminControlAdmin, getOneReasonSkill)
router.patch('/update/:id', adminAuth, adminControlAdmin, updateReasonSkill)
router.patch('/update/title/:id', adminAuth, adminControlAdmin, updateReasonSkillTitle)
router.patch('/delete/:id', adminAuth, adminControlAdmin, deleteReasonSkill)


//this is to load for admin with access to skilled and client
router.get('/getAll/subAdmin', adminAuth, adminControlSkilled, getAllReasonSkill)
router.get('/getAll/title/subAdmin', adminAuth, adminControlSkilled, getAllReasonTitle)
//export
module.exports = router