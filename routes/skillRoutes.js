const express = require('express')
const {
    createSkill, 
    getAllSkill,
    getOneSkill,
    updateSkill,
    deleteSkill
} = require('../controllers/skillController')
const requireAuth = require('../middleware/requireAuth')

//instance of router
router = express.Router()

router.post('/post/', requireAuth, createSkill)
router.get('/getAll/', requireAuth ,getAllSkill)
router.get('/getOne/:id', requireAuth, getOneSkill)
router.patch('/update/:id', requireAuth, updateSkill)
router.delete('/delete/:id', requireAuth, deleteSkill)

//export
module.exports = router