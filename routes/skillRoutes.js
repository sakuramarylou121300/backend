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

router.use(requireAuth)

//POST skill
router.post('/post/', createSkill)

//GET all skill
router.get('/getAll/', getAllSkill)

//GET single skill
router.get('/getOne/:id', getOneSkill)

//UPDATE skill
router.patch('/update/:id', updateSkill)

//delete skill
router.delete('/delete/:id', deleteSkill)

//export
module.exports = router