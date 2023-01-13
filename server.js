require('dotenv').config()//secret
const express = require('express')
const mongoose = require('mongoose')
// const multer = require('multer')
//ADMIN
const adminInfoRoutes = require('./routes/adminInfoRoutes')
const adminSkillRoutes = require('./routes/adminSkillRoutes')
const adminAddressRoutes = require('./routes/adminAddressRoutes')
const adminProvinceRoutes = require('./routes/adminProvinceRoutes')
const adminCityRoutes = require('./routes/adminCityRoutes')
const adminBarangayRoutes = require('./routes/adminBarangayRoutes')
const roleRoutes = require('./routes/roleRoutes')

//SKILLED
const uploadRoutes = require('./routes/uploadRoutes')
const skilledInfoRoutes = require('./routes/skilledInfoRoutes')
const skilledContactRoutes = require('./routes/skilledContactRoutes')
const skilledAddressRoutes = require('./routes/skilledAddressRoutes')
const skillCertRoutes = require('./routes/skillCertRoutes')
const experienceRoutes = require('./routes/experienceRoutes')
const skillRoutes = require('./routes/skillRoutes')

//CLIENT
const clientInfoRoutes = require('./routes/clientInfoRoutes')
const clientContactRoutes = require('./routes/clientContactRoutes')
const clientAddressRoutes = require('./routes/clientAddressRoutes')
const jobRoutes = require('./routes/jobRoutes')

//instance
const app = express()

//middleware
app.use(express.json())
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})
//upload picture
app.use('/uploads', express.static('uploads'))

//routes
//ADMIN
app.use('/api/admin', adminInfoRoutes)
app.use('/api/adminSkill', adminSkillRoutes)
app.use('/api/province', adminProvinceRoutes)
app.use('/api/city', adminCityRoutes)
app.use('/api/barangay', adminBarangayRoutes)
app.use('/api/admin', adminAddressRoutes)
app.use('/api/role', roleRoutes)

//SKILLED
app.use('/api/skilledInfo', skilledInfoRoutes)
app.use('/api/skilledContact', skilledContactRoutes)
app.use('/api/skilledAddress', skilledAddressRoutes)
app.use('/api/skill', skillRoutes)
app.use('/api/skillCert', skillCertRoutes)
app.use('/api/experience', experienceRoutes)

//CLIENT
app.use('/api/clientInfo', clientInfoRoutes)
app.use('/api/clientContact', clientContactRoutes)
app.use('/api/clientAddress', clientAddressRoutes)
app.use('/api/jobs', jobRoutes)
app.use(uploadRoutes)

//connect to db
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        //listen for request
        app.listen(process.env.PORT, () => {
            console.log('connected to db and listening on port', process.env.PORT)
        })
    })
    .catch((error) => {
        console.log(error) 
    })

// //storage
// const Storage= multer.diskStorage({
//     destination:'uploads',
//     filename:(req,file,cb)=>{
//         cb(null, file.originalname)
//     }
// })

// const upload = multer({
//     storage:Storage
// }).single('testImage')
