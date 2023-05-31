const express = require('express')
const {
    createJob, 
    getAllJob,
    getOneJob,
    updateJob,
    deleteJob
   
} = require('../controllers/jobController')
const {clientRequireAuth} = require('../middleware/clientRequireAuth')

//instance of router
router = express.Router()

router.use(clientRequireAuth)

router.post('/post/', createJob)
router.get('/getAll/', getAllJob)
router.get('/getOne/:id', getOneJob)
router.patch('/update/:id', updateJob)
router.delete('/delete/:id', deleteJob)

//export
module.exports = router