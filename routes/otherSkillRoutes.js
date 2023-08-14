const express = require('express')
const {
    getAllOtherSkill,
    updateOtherSkillAccepted,
    updateOtherSkill
} = require('../controllers/otherSkillController')

const adminControlAdmin = require('../middleware/adminControlAdmin')
const adminAuth = require('../middleware/adminAuth')

//instance of router
router = express.Router()

router.get('/getAll/', adminAuth, adminControlAdmin, getAllOtherSkill)
router.patch('/update/accepted/:id', adminAuth, adminControlAdmin, updateOtherSkillAccepted)
router.patch('/update/:id', adminAuth, adminControlAdmin, updateOtherSkill)
//export
module.exports = router