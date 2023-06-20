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
    deleteClientComment,
    getOneSkilledSkill,
    getOneSkilledSkillClient,
    createClientReq,
    getAllSkilledReq,
    getAllSkilledReqCompleted,
    getAllSkilledReqAccepted,
    updateSkilledReqCompleted,
    getAllClientReq,
    getAllClientReqAccepted,
    getAllClientReqCompleted,
    getAllClientReqCancelled,
    updateClientSkilledReqCompleted,
    cancelClientSkilledReq,
    deleteClientSkilledReq
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

//to get the req from client for skilled workers
router.get('/getAll/skilled/req', requireAuth ,getAllSkilledReq)
router.get('/getAll/skilled/req/accepted', requireAuth ,getAllSkilledReqAccepted)
router.get('/getAll/skilled/req/completed', requireAuth ,getAllSkilledReqCompleted)
router.patch('/update/skilled/req/:id', requireAuth, updateSkilledReqCompleted)
router.patch('/delete/skilled/req/:id', requireAuth, deleteClientSkilledReq)

//FOR CLIENT
//get skilled skill, cert, exp and comment
router.get('/getOne/client/skilled/skill/:_id/:skillId/:skilledSkill', clientRequireAuth, getOneSkilledSkill)
//this is when sending req
router.get('/getOne/client/skilled/skill/:_id/:skilledSkill', clientRequireAuth, getOneSkilledSkillClient);
//this is for the comment
router.get('/getOne/client/skilled/skill/:id', clientRequireAuth, getOneSkill);

//this is for the rating, this is not included anymore
router.patch('/rating/:skill_id', clientRequireAuth, rating)
//this is for the comment
router.post('/post/comment/:skill_id', upload.array("photo"), clientRequireAuth, createClientComment)
router.get('/getAll/comment/:skill_id', clientRequireAuth, getAllClientComment)
router.get('/getAll/clientone/comment', clientRequireAuth, getAllClientOneComment)
router.patch('/update/comment/:id', upload.array("photo"), clientRequireAuth, updateClientComment)
router.patch('/delete/comment/:id', clientRequireAuth, deleteClientComment)

//this is for the labor req
router.post('/post/req/:skill_id/:skilled_id', clientRequireAuth, createClientReq)
router.get('/getAll/client/req', clientRequireAuth ,getAllClientReq)
router.get('/getAll/client/req/accepted', clientRequireAuth ,getAllClientReqAccepted)
router.get('/getAll/client/req/completed', clientRequireAuth ,getAllClientReqCompleted)
router.get('/getAll/client/req/cancelled', clientRequireAuth ,getAllClientReqCancelled)
router.patch('/update/client/req/:id', clientRequireAuth, updateClientSkilledReqCompleted)
router.patch('/delete/client/req/:id', clientRequireAuth, deleteClientSkilledReq)
//this is for cancelling req for client
router.patch('/cancel/client/req/:id', clientRequireAuth, cancelClientSkilledReq)

//export
module.exports = router