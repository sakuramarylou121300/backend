const express = require('express')
const {
    createExperience, 
    getAllExperience,
    getOneExperience,
    updateExperience,
    editRefName,
    deleteExperience
} = require('../controllers/experienceController')
const requireAuth = require('../middleware/requireAuth')

//instance of router
router = express.Router()

router.use(requireAuth)

//POST skill cert
router.post('/post/', createExperience)

//GET all skill cert
router.get('/getAll/', getAllExperience)

//GET single skill cert
router.get('/getOne/:id', getOneExperience)

//UPDATE skill cert
router.patch('/update/:id', updateExperience)

//UPDATE ref name 
router.put('/edit/refName/:id', editRefName)

//delete skill cert
router.delete('/delete/:id', deleteExperience)

//export
module.exports = router