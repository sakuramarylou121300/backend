const express = require('express')
const {
    createSkill,
    getAllSkill,
    getOneSkill,
    updateSkill,
    deleteSkill
} = require('../controllers/adminSkillController')

const adminAuth = require('../middleware/adminAuth')
const adminControlAdminSkill = require('../middleware/adminControlAdminSkill')

//instance of router
router = express.Router()

//only admin role can post, update and delete skill
router.post('/post/', adminAuth, adminControlAdminSkill, createSkill)
router.get('/getAll/', adminAuth, adminControlAdminSkill, getAllSkill)
router.get('/getAll/skilledSkill', getAllSkill)
router.get('/getOne/:id', adminAuth, adminControlAdminSkill, getOneSkill)
router.put('/update/:id', adminAuth, adminControlAdminSkill, updateSkill)
router.delete('/delete/:id', adminAuth, adminControlAdminSkill, deleteSkill)

//export
module.exports = router