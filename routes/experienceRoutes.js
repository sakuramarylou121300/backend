const express = require('express') 
const {
    createExperience, 
    getAllExperience,
    getOneExperience,
    updateExperience,
    editRefName,
    deleteExperience
} = require('../controllers/experienceController')
const {requireAuth} = require('../middleware/requireAuth')

//this is for the multiple uploads
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const storage = multer.diskStorage({
    destination: function(req, file, cb){
    //     if(!fs.existsSync('public')){
    //         fs.mkdirSync('public')
    //     }
    //     if(!fs.existsSync('public/media')){
    //         fs.mkdirSync('public/media')
    //     }
    //     cb(null, "public/media")
    // },
    // filename: function(req, file, cb){
    //     cb(null, Date.now() + file.originalname + path.extname(file.originalname))
    //     }
    if(!fs.existsSync("public/resources")){
        fs.mkdirSync("public/resources")
    }
    cb(null, "public/resources")
},
    filename: function(req, file, cb){
        cb(null, Date.now() + file.originalname + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb){
        var ext = path.extname(file.originalname)
        
        if(ext !== '.png' && ext !== '.jpeg' && ext !== '.gif'){
            return cb(new Error('Only Images are allowed!'))
        }
        cb(null, true)
    }
})
//instance of router
router = express.Router()

router.use(requireAuth)

router.post('/post/', upload.fields([{name:'photo', maxCount: 5}]), createExperience)
router.get('/getAll/', getAllExperience)
router.get('/getOne/:id', getOneExperience)
router.patch('/update/:id', upload.fields([{name:'photo', maxCount: 5}]), updateExperience)
router.put('/edit/refName/:id', editRefName)
router.patch('/delete/:id', deleteExperience)

//export
module.exports = router