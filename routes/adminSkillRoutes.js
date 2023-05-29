const express = require('express')
const {
    createSkill,
    getAllSkill,
    getOneSkill,
    updateSkill,
    deleteSkill,
    getAllSkillDeleted,
    restoreSkill
} = require('../controllers/adminSkillController')

const adminAuth = require('../middleware/adminAuth')
const adminControlAdmin = require('../middleware/adminControlAdmin')

//instance of router
router = express.Router()

//only admin role can post, update and delete skill
router.post('/post/', adminAuth, adminControlAdmin, createSkill)
router.get('/getAll/', adminAuth, adminControlAdmin, getAllSkill)
router.get('/getAll/skilledSkill', getAllSkill)
router.get('/getOne/:id', adminAuth, adminControlAdmin, getOneSkill)
router.put('/update/:id', adminAuth, adminControlAdmin, updateSkill)
router.patch('/delete/:id', adminAuth, adminControlAdmin, deleteSkill)
router.get('/deleted/:skill', adminAuth, adminControlAdmin, getAllSkillDeleted)
router.patch('/restore/:id', adminAuth, adminControlAdmin, restoreSkill)
//export
module.exports = router