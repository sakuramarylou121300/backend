const express = require('express')
const cloudinary = require("../utils/cloudinary")
const upload = require("../utils/multer")
const {
    createSkills,
    createSkill, 
    getAllSkill,
    getOneSkill,
    updateSkill,
    deleteSkill,
    rating,
    createClientComment,
    getAllClientComment,
    getAllClientOneComment,
    updateClientComment,
    deleteClientComment
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
//this is for the comment
router.post('/post/comment/:skill_id', upload.array("photo"), clientRequireAuth, createClientComment)
router.get('/getAll/comment/:skill_id', clientRequireAuth, getAllClientComment)
router.get('/getAll/clientone/comment', clientRequireAuth, getAllClientOneComment)
router.patch('/update/comment/:id', upload.array("photo"), clientRequireAuth, updateClientComment)
router.patch('/delete/comment/:id', clientRequireAuth, deleteClientComment)

//export
module.exports = router