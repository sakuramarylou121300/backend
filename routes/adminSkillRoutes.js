const express = require('express')
const {
    createSkill,
    getAllSkill,
    getOneSkill,
    updateSkill,
    deleteSkill
} = require('../controllers/adminSkillController')

const adminAuth = require('../middleware/adminAuth')

//instance of router
router = express.Router()

//only admin can post, update and delete skill
//POST skill
router.post('/post/', adminAuth, createSkill)

//GET all skill
router.get('/getAll/', adminAuth, getAllSkill)

//UPDATE skill
router.get('/getOne/:id', adminAuth, getOneSkill)

//UPDATE skill
router.put('/update/:id', adminAuth, updateSkill)

//DELETE skill
router.delete('/delete/:id', adminAuth, deleteSkill)

//export
module.exports = router