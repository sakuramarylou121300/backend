const express = require('express')
const {
    createOtherSkills,
    getAllOtherSkill,
    updateOtherSkillAccepted,
    updateOtherSkill
} = require('../controllers/otherSkillController')

const adminControlAdmin = require('../middleware/adminControlAdmin')
const adminAuth = require('../middleware/adminAuth')
const {clientRequireAuth} = require('../middleware/clientRequireAuth')

//instance of router
router = express.Router()

router.post('/post/', clientRequireAuth, createOtherSkills)
router.get('/getAll/', adminAuth, adminControlAdmin, getAllOtherSkill)
router.patch('/update/accepted/:id', adminAuth, adminControlAdmin, updateOtherSkillAccepted)
router.patch('/update/:id', adminAuth, adminControlAdmin, updateOtherSkill)
//export
module.exports = router