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
    getAllSkilledOneComment,
    getOneClientComment,
    updateClientComment,
    deleteClientComment,
    createClientReply,
    getOneClientReply,
    updateClientReply,
    deleteClientReply,
    createSkilledReply,
    updateSkilledReply,
    deleteSkilledReply,
    getOneSkilledSkill,
    getOneSkilledSkillClient,
    createClientReq,
    getAllSkilledReq,
    getAllSkilledReqCompleted,
    getAllSkilledReqAccepted,
    getAllSkilledReqCancelled,
    updateSkilledReqCompleted,
    getAllClientReq,
    getAllClientReqAccepted,
    getAllClientReqCompleted,
    getAllClientReqCancelled,
    updateClientSkilledReqDate,
    updateClientSkilledReqCompleted,
    cancelClientSkilledReq,
    deleteClientSkilledReq
} = require('../controllers/skillController')

//get all reason for canceling for client
const{
  getAllReasonReq
} = require('../controllers/clientCancelReqController')
const {requireAuth} = require('../middleware/requireAuth')
const skilledVerified = require('../middleware/skilledVerified')
const {clientRequireAuth} = require('../middleware/clientRequireAuth')
const clientVerified = require('../middleware/clientVerified')

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
router.get('/getAll/skilled/req/cancelled', requireAuth , getAllSkilledReqCancelled)
router.patch('/update/skilled/req/:id', requireAuth, updateSkilledReqCompleted)
router.patch('/delete/skilled/req/:id', requireAuth, deleteClientSkilledReq)

//skilled comment
router.get('/getAll/skilledone/comment', requireAuth, getAllSkilledOneComment)

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
router.post('/post/comment/:skill_id/:skilledId/:_id', upload.array("photo"), clientRequireAuth, createClientComment)
router.get('/getAll/comment/:skill_id', clientRequireAuth, getAllClientComment)
router.get('/getAll/clientone/comment', clientRequireAuth, getAllClientOneComment)
router.get('/getOne/comment/:id', clientRequireAuth, getOneClientComment)
router.patch('/update/comment/:id', upload.array("photo"), clientRequireAuth, updateClientComment)
router.patch('/delete/comment/:id', clientRequireAuth, deleteClientComment)

//this is for reply - client
router.post('/post/reply/:comment_id', clientRequireAuth, createClientReply)
router.get('/getOne/reply/:id/:comment_id', clientRequireAuth, getOneClientReply)
router.patch('/update/reply/:id/:comment_id', clientRequireAuth, updateClientReply)
router.patch('/delete/reply/:id', clientRequireAuth, deleteClientReply)

//this is for reply - skilled
router.post('/post/skilledReply/:comment_id', requireAuth, createSkilledReply)
router.get('/getOne/skilledReply/:id/:comment_id', requireAuth, getOneClientReply)
router.patch('/update/skilledReply/:id/:comment_id', requireAuth, updateSkilledReply)
router.patch('/delete/skilledReply/:id', requireAuth, deleteSkilledReply)

//this is for the labor req
router.post('/post/req/:skill_id/:skilled_id', clientRequireAuth, createClientReq)
router.get('/getAll/client/req', clientRequireAuth, getAllClientReq)
router.get('/getAll/client/req/accepted', clientRequireAuth ,clientVerified, getAllClientReqAccepted)
router.get('/getAll/client/req/completed', clientRequireAuth ,getAllClientReqCompleted)
router.get('/getAll/client/req/cancelled', clientRequireAuth ,getAllClientReqCancelled)
router.patch('/update/client/req/date/:id/:skilled_id', clientRequireAuth, updateClientSkilledReqDate)
router.patch('/update/client/req/:id', clientRequireAuth, updateClientSkilledReqCompleted)
router.patch('/delete/client/req/:id', clientRequireAuth, deleteClientSkilledReq)

//this is for cancelling req for client
router.patch('/cancel/client/req/:id', clientRequireAuth, cancelClientSkilledReq)
//get reason for cancelling for client
router.get('/getAll/cancel/clientReqReason', clientRequireAuth ,getAllReasonReq)

// Error handling middleware
router.use((err, req, res, next) => {
    if (err.statusCode && err.statusCode === 400) {
      return res.status(400).json({ error: err.message });
    }
    // Handle other errors
    return res.status(500).json({ error: 'File is not supported. Please upload a photo with JPEG, JPG, PNG format only.' });
});

//export
module.exports = router