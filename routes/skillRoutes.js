const express = require('express')
const {
    createSkills,
    createSkill, 
    getAllSkill,
    getOneSkill,
    updateSkill,
    deleteSkill,
    rating
} = require('../controllers/skillController')
const {requireAuth} = require('../middleware/requireAuth')
const {clientRequireAuth} = require('../middleware/clientRequireAuth')

//instance of router
router = express.Router()

router.post('/post/', requireAuth, createSkills)
router.post('/post/skill', requireAuth, createSkill)
router.get('/getAll/', requireAuth ,getAllSkill)
router.get('/getOne/:id', requireAuth, getOneSkill)
router.patch('/update/:id', requireAuth, updateSkill)
router.patch('/delete/:id', requireAuth, deleteSkill)

//this is for the rating
router.patch('/rating/:skill_id', clientRequireAuth, rating)

//export
module.exports = router