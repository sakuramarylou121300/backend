require('dotenv').config()//secret 
const express = require('express')
const mongoose = require('mongoose')
mongoose.set('strictQuery', true);
const cors = require('cors')
const bodyParser = require('body-parser');

// const multer = require('multer')

//ADMIN
const adminInfoRoutes = require('./routes/adminInfoRoutes')
const adminSkillRoutes = require('./routes/adminSkillRoutes')
const adminAddressRoutes = require('./routes/adminAddressRoutes')
const adminProvinceRoutes = require('./routes/adminProvinceRoutes')
const adminCityRoutes = require('./routes/adminCityRoutes')
const adminBarangayRoutes = require('./routes/adminBarangayRoutes')
const roleRoutes = require('./routes/roleRoutes')
const capabilityRoutes = require('./routes/capabilityRoutes')
const roleCapabilityRoutes = require('./routes/roleCapabilityRoutes')
//SKILLED
const skilledInfoRoutes = require('./routes/skilledInfoRoutes')
const skilledBarangayRoutes = require('./routes/skilledBarangayRoutes')
const skilledBClearanceRoutes = require('./routes/skilledBClearanceRoutes')
const skilledContactRoutes = require('./routes/skilledContactRoutes')
const skilledAddressRoutes = require('./routes/skilledAddressRoutes')
const skillCertRoutes = require('./routes/skillCertRoutes')
const experienceRoutes = require('./routes/experienceRoutes')
const skillRoutes = require('./routes/skillRoutes')
const skilledBillRoutes = require('./routes/skilledBillRoutes')

//CLIENT
const clientInfoRoutes = require('./routes/clientInfoRoutes')
const clientContactRoutes = require('./routes/clientContactRoutes')
const clientAddressRoutes = require('./routes/clientAddressRoutes')
const jobRoutes = require('./routes/jobRoutes')
const roleCapability = require('./models/roleCapability')

//instance
const app = express()
app.use(
    cors({
      origin: '*',
      credentials: true,
    })
  );
  
  app.use(
    cors({
      origin: '*',
    }),
    (req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'Content-Type',
        'Authorization'
      );
      next();
    }
  );

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

//middleware
app.use(express.json())
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})
//upload picture
// app.use('/uploads', express.static('uploads'))

//routes

//ADMIN
app.use('/api/admin', adminInfoRoutes)
app.use('/api/adminSkill', adminSkillRoutes)
app.use('/api/province', adminProvinceRoutes)
app.use('/api/city', adminCityRoutes)
app.use('/api/barangay', adminBarangayRoutes)
app.use('/api/admin', adminAddressRoutes)
app.use('/api/role', roleRoutes)
app.use('/api/capability', capabilityRoutes)
app.use('/api/roleCapability', roleCapabilityRoutes)

//SKILLED
app.use('/api/skilledInfo', skilledInfoRoutes)
app.use('/api/skilledBarangay', skilledBarangayRoutes)
app.use('/api/skilledBClearance', skilledBClearanceRoutes)
app.use('/api/skilledContact', skilledContactRoutes)
app.use('/api/skilledAddress', skilledAddressRoutes)
app.use('/api/skill', skillRoutes)
app.use('/api/skillCert', skillCertRoutes)
app.use('/api/experience', experienceRoutes)
app.use('/api/experience', experienceRoutes)
app.use('/api/skilledBill', skilledBillRoutes)

//CLIENT
app.use('/api/clientInfo', clientInfoRoutes)
app.use('/api/clientContact', clientContactRoutes)
app.use('/api/clientAddress', clientAddressRoutes)
app.use('/api/jobs', jobRoutes)
// app.use(uploadRoutes)

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
