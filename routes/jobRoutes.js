const express = require('express')
const {
    createJob, 
    getAllJob,
    getOneJob,
    updateJob,
    deleteJob
   
} = require('../controllers/jobController')
const requireAuth = require('../middleware/clientRequireAuth')

//instance of router
router = express.Router()

router.use(requireAuth)

//POST job
router.post('/post/', createJob)

//GET all jobs
router.get('/getAll/', getAllJob)

//GET single job
router.get('/getOne/:id', getOneJob)

//UPDATE job
router.patch('/update/:id', updateJob)

//DELETE job
router.delete('/delete/:id', deleteJob)


//export
module.exports = router