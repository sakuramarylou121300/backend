//motor to handle uploading images to upload folder
const multer = require('multer')

//set storage
const  storage = multer.diskStorage({
    //destination
    destination: function(req, res, cb){
        cb(null, './uploads/')//cb means callback not comeback
    },
    //filename
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + file.originalname)
    }
})

const filterFilter = (req, file, cb) =>{
    cb(null, true)//will use own filter
}

let upload = multer({
    storage: storage,
    filterFilter: filterFilter,
})

module.exports = upload.single('avatar')