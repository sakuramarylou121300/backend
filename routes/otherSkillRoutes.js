const express = require('express')
const {
    createOtherSkills,
    getAllOtherSkill,
    getAllOtherSkillTrue, 
    getAllOtherSkillFalse,
    updateOtherSkillAccepted,
    updateOtherSkill
} = require('../controllers/otherSkillController')

const adminControlSkilled = require('../middleware/adminControlSkilled')
const adminAuth = require('../middleware/adminAuth')
const {clientRequireAuth} = require('../middleware/clientRequireAuth')

//instance of router
router = express.Router()

router.post('/post/', clientRequireAuth, createOtherSkills)
router.get('/getAll/', adminAuth, adminControlSkilled, getAllOtherSkill)
router.get('/getAll/approved', adminAuth, adminControlSkilled, getAllOtherSkillTrue)
router.get('/getAll/disapproved', adminAuth, adminControlSkilled, getAllOtherSkillFalse)
router.patch('/update/accepted/:id', adminAuth, adminControlSkilled, updateOtherSkillAccepted)
router.patch('/update/:id', adminAuth, adminControlSkilled, updateOtherSkill)
//export
module.exports = router