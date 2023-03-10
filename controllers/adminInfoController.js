const AdminInfo = require('../models/adminInfo')  
const SkilledInfo = require('../models/skilledInfo')
const Experience = require('../models/experience')
const Certificate = require('../models/skillCert')
const Skill = require('../models/skill')
const SkilledBill = require('../models/skilledBill')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const validator = require('validator')

//to generate json webtoken
const adminCreateToken = (_id)=>{
    return jwt.sign({_id}, process.env.SECRET, {expiresIn: '3d'})
}

//ONLY ADMIN CAN ACCESS
//log in user
const adminLogIn = async(req, res) =>{
    const {username, password} = req.body
    try{
        //just call the function from the model
        const adminInfo = await AdminInfo.login(
            username, 
            password
        )

            //create token
            const token = adminCreateToken(adminInfo._id)
        res.status(200).json({username, adminInfo, token})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//sign up user/create new admin
const adminSignUp = async(req, res) =>{
    const {
        username, 
        password,
        lname,
        fname,
        mname,
        contact,
        roleCapability
        } = req.body
        
    try{
        //just call the function from the model
        const adminInfo = await AdminInfo.signup(
            username, 
            password,
            lname,
            fname,
            mname,
            contact,
            roleCapability
        )

            //create token
            const token = adminCreateToken(adminInfo._id)
        res.status(200).json({adminInfo, token})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//get all admin
const adminGetAllAdmin = async(req, res)=>{

    try{
        //get all query
        const adminInfo = await AdminInfo.find({isDeleted: 0}).sort({username: -1})
        .select("-password")
        .populate({path: 'roleCapabality', populate: [{path: 'capability_id'}, {path: 'adminInfo_id'}]})
        // .populate('roleCapabality')
        // .populate('adminRoleCapabality')
        // .populate({path: 'adminRoleCapabality',populate: {path:'roleCapability_id',populate:{path:'capability_id'}}})
        res.status(200).json(adminInfo)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET one skilled
const adminGetOneAdmin = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const adminInfo = await AdminInfo.findById({_id: id})

    //check if not existing
    if (!adminInfo){
        return res.status(404).json({error: 'Admin not found'})
    }

    res.status(200).json(adminInfo)   

}

//update admin info username
const adminUpdateUserName = async(req, res) =>{
    const {id} = req.params 
    try{
        
        //get info
        const {username} = req.body

        //validation
        if (!username){
            throw Error('Please enter your new username.')
        }

        //check if strong password
        if(username.length <8){
            throw Error('Please enter atleast 8 characters in username.')
        }

         //check if email is existing
        const skilledExists = await SkilledInfo.findOne({username})
        if (skilledExists){
            throw Error('Username already in use. Please enter a new unique username.')
        }

        const exists = await AdminInfo.findOne({username})
        if (exists){
            throw Error('Username already in use. Please enter a new unique username.')
        }
        //update info
        const adminInfo = await AdminInfo.findOneAndUpdate(
            {_id:id},
            {username})

        //success
        res.status(200).json({adminInfo})
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}

//update skilled info pass
const adminUpdatePass = async(req, res) =>{
    const {id} = req.params 
    try{
        
        //get info
        const {newpass} = req.body

        //validation
        if (!newpass){
            throw Error('Please enter all blank fields.')
        }

        //check if strong password
        if(newpass.length <8){
            throw Error('Please enter atleast 8 characters in password.')
        }

        //salt for additional security of the system
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(newpass, salt)

        //update info
        const adminInfo = await AdminInfo.findOneAndUpdate(
            {_id:id},
            {password:hash})

        //success
        res.status(200).json(adminInfo)
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}

//update skilled info
const adminUpdateInfo = async(req, res) =>{
    const {id} = req.params 
    try{
        
        //get info
        const {lname,
                fname,
                mname,
                contact} = req.body

        //validation
        if (!lname || !fname || !mname || !contact){
            throw Error('Please fill in all the blank fields.')
        }

        const mobileNumberRegex = /^09\d{9}$|^639\d{9}$/;
        
        if (!mobileNumberRegex.test(contact)) {
            throw new Error('Please check your contact number.');
        }

        //update info
        const adminInfo = await AdminInfo.findOneAndUpdate(
            {_id:id},
            {lname,
            fname,
            mname,
            contact
        })

        //success
        res.status(200).json({messg: 'Successfully updated'})
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}

//delete skilled info
const adminDeleteInfo = async(req, res) =>{
    const {id} = req.params 

    try{
        // const adminInfo = await AdminInfo.findByIdAndDelete(id)
        // res.status(200).json(adminInfo)
        const adminInfo = await AdminInfo.findById(id)
        if(adminInfo.isMainAdmin === 1){
           return res.status(400).json({error: "Cannot delete main admin account"})
        }
        adminInfo.isDeleted = 1;
        await adminInfo.save() 
        res.status(200).json({ message: "Admin account deleted successfully"})
    }
    
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//THIS IS FOR ALL ADMIN ACCESS TO THEIR OWN INFO
//get one to their specific account
const getAdminInfo = async(req, res) =>{

    try{
        const adminInfo = await AdminInfo.findById(req.adminInfo._id)
        .select("-password")

        res.status(200).json(adminInfo)
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}
//update admin info username, to their specific account
const updateAdminUserName = async(req, res) =>{
  
    try{
        
        //get info
        const {username} = req.body

        //validation
        if (!username){
            throw Error('Please enter your new email.')
        }

        //check if strong password
        if(username.length <8){
            throw Error('Please enter atleast 8 characters in email.')
        }

         //check if email is existing
         const skilledExists = await SkilledInfo.findOne({username})
         if (skilledExists){
             throw Error('Username already in use. Please enter a new unique username.')
         }

         //check if email is existing
        const exists = await AdminInfo.findOne({username})
        if (exists){
            throw Error('Email already in use. Please enter a new unique email.')
        }

        //update info
        const adminInfo = await AdminInfo.findOneAndUpdate(
            {_id: req.adminInfo._id},
            {username})

        //success
        res.status(200).json({adminInfo})
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}
//update admin password, to their specific account
const updateAdminPass = async(req, res) =>{
  
    try{
        
        //get info
        const {oldpass, newpass, username} = req.body

        //validation
        if (!oldpass || !newpass || !username){
            throw Error('Please enter all blank fields.')
        }

        if (oldpass===newpass){
            throw Error('Please do not enter the same current and new password.')
        }

        const admin_Info = await AdminInfo.findOne({username})
        if (!admin_Info){
            throw Error('Incorrect email.')
        }
        //check if the password and password hash in match
        const match = await bcrypt.compare(oldpass, admin_Info.password)
        //if not match
        if(!match){
            throw Error('Incorrect password.')
        }

        //check if strong password
        if(newpass.length <8){
            throw Error('Please enter atleast 8 characters in password.')
        }

        //salt for additional security of the system
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(newpass, salt)

        //update info
        const adminInfo = await AdminInfo.findOneAndUpdate(
            {_id: req.adminInfo._id},
            {password:hash})

        //success
        res.status(200).json(adminInfo)
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}
//update admin info, to their specific account
const updateAdminInfo = async(req, res) =>{
  
    try{
        
        //get info
        const {lname,
                fname,
                mname,
                contact} = req.body

        //validation
        if (!lname || !fname || !contact ){
            throw Error('Please fill in all the blank fields.')
        }

        const mobileNumberRegex = /^09\d{9}$|^639\d{9}$/;
        
        if (!mobileNumberRegex.test(contact)) {
            throw new Error('Please check your contact number.');
        }

        //update info
        const adminInfo = await AdminInfo.findOneAndUpdate(
            {_id: req.adminInfo._id},
            {lname,
            fname,
            mname,
            contact
        })

        //success
        res.status(200).json({messg: 'Successfully updated'})
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}

//delete skilled info
const deleteAdminInfo = async(req, res) =>{

    try{
        const adminInfo = await AdminInfo.findById(req.adminInfo._id)
        if(adminInfo.isMainAdmin === 1){
            return res.status(400).json({error: "Cannot delete main admin account"})
        }
        adminInfo.isDeleted = 1;
        await adminInfo.save()
        res.status(200).json({ message: "Admin account deleted successfully"})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}
//DEPENDING ON THE ROLE OF THE ADMIN

//GET all skilled
const adminGetAllSkilled = async(req, res)=>{

    try{
        //get all query
        const skilledInfo = await SkilledInfo.find({isDeleted: 0}).sort({createdAt: -1})
        .select("-password")
        .populate({
            path: 'skills',
            match: { isDeleted: 0} 
        })
        .populate({
            path: 'experience',
            match: { isDeleted: 0} 
        })
        .populate({
            path: 'skillCert',
            match: { isDeleted: 0} 
        })
        .populate({
            path: 'skilledBill',
            match: { isDeleted: 0} 
        })
        res.status(200).json(skilledInfo)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET one skilled
const adminGetOneSkilled = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const skilledInfo = await SkilledInfo.findById({_id: id})

    //check if not existing
    if (!skilledInfo){
        return res.status(404).json({error: 'Skilled Worker not found'})
    }

    res.status(200).json(skilledInfo)   

}

//UPDATE skilled
const adminUpdateSkilled = async(req, res) =>{
    const {id} = req.params    

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

     //delete query
     const skilledInfo = await SkilledInfo.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!skilledInfo){
        return res.status(404).json({error: 'Skilled Worker not found'})
    }

    res.status(200).json(skilledInfo)
}

//DELETE skilled
const adminDeleteSkilled = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const skilledInfo = await SkilledInfo.findOneAndUpdate({_id: id},
        {isDeleted: 1})
    
    //check if not existing
    if (!skilledInfo){
        return res.status(404).json({error: 'Skilled Worker not found'})
    }

    res.status(200).json(skilledInfo)

}

//GET all skill exp
const adminGetAllExperience = async(req, res)=>{

    try{
        //get all query
        const experience = await Experience.find({isDeleted: 0}).sort({createdAt: -1})
        .populate('skilled_id')
        res.status(200).json(experience)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET all skill cert
const adminGetAllCertificate = async(req, res)=>{
    try{
        
        //get all query
        const certificate = await Certificate.find({isDeleted: 0}).sort({createdAt: -1}).populate('skilled_id')
        res.status(200).json(certificate)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET all skill
const adminGetAllSkill = async(req, res)=>{

    try{
        //this is to find skill for specific user
        //get all query
        const skill = await Skill.find({isDeleted: 0}).sort({createdAt: -1}).populate('skilled_id')
        res.status(200).json(skill)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
//GET all skill cert
const adminGetAllSkilledBill = async(req, res)=>{

    try{
        //get all query
        const skilledBill = await SkilledBill.find({isDeleted: 0}).sort({createdAt: -1})
        .populate('skilled_id')
        res.status(200).json(skilledBill)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET all skilled
const adminGetAllSkilledDetail = async(req, res)=>{

    try{
        //get all query
        const skilledInfo = await SkilledInfo
        .find({idIsVerified: 0, isDeleted: 0, 
        })
        .select("-password")
        .populate({
            path: 'skillCert',
            match: { isDeleted: 0},
            options: { sort: { createdAt: -1 } } 
        })
        .lean() // Convert Mongoose Document to JS object
        //count each skilled info skillCert unread
        const skilledInfoWithCountsAndLatestCertTimes  = skilledInfo.map(info => {
            const count = info.skillCert.filter(cert => cert.isRead === 0).length;
            const latestCertTime = info.skillCert.length > 0 ? info.skillCert[0].createdAt : new Date(0);
            return {...info, count, latestCertTime};
        });
      
          const skilledInfoSorted = skilledInfoWithCountsAndLatestCertTimes.sort((a, b) => {
            if (b.latestCertTime.getTime() - a.latestCertTime.getTime() !== 0) {
              // sort by the latest skillCert createdAt time    
              return b.latestCertTime - a.latestCertTime;
            } else {
              // if the latest skillCert createdAt time is the same,
              // sort by the overall updatedAt time of the skilledInfo
              return b.updatedAt - a.updatedAt;
            }
          });
          
        res.status(200).json(skilledInfoSorted);     
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
const adminGetAllSkilledDetailCert = async(req, res)=>{

    try{
        //get all query
        const skilledInfo = await SkilledInfo
        .find({idIsVerified: 0, isDeleted: 0, 
        })
        .select("-password")
        .populate({
            path: 'skillCert',
            match: { isDeleted: 0} 
        })
        .lean() // Convert Mongoose Document to JS object
        .sort({'skillCert.createdAt':-1});
        res.status(200).json({
          success: true,
          skilledInfo,
        });
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
//GET all skill cert
const adminGetAllSkilledExpDetail = async(req, res)=>{
    // const skilled_id = req.params.skilled_id;
    const username = req.params.username;

    try{
        // Find skilled_id document based on username
        const skilledIdDoc = await SkilledInfo.findOne({ username: username });

        // Check if skilled_id exists for the given username
        if (!skilledIdDoc) {
        return res.status(404).json({ error: 'Skilled Worker not found' });
        }

        //get all query
        const skilledExp = await Experience.find({
            skilled_id: skilledIdDoc._id,
            // skilled_id:skilled_id,
            expIsVerified: 0, 
            isDeleted: 0
        })
        .sort({updatedAt: 1})
        .populate('skilled_id')
        res.status(200).json(skilledExp)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET all skill cert
const adminGetAllSkilledCertDetail = async(req, res)=>{
    const username = req.params.username;
    try{
        // Find skilled_id document based on username
        const skilledIdDoc = await SkilledInfo.findOne({ username: username });

        // Check if skilled_id exists for the given username
        if (!skilledIdDoc) {
        return res.status(404).json({ error: 'Skilled Worker not found' });
        }
        //get all query
        const certificate = await Certificate.find({
            skilled_id: skilledIdDoc._id,
            skillIsVerified: "false", 
            isDeleted: 0}).sort({updatedAt: 1})
        .populate('skilled_id')
        res.status(200).json(certificate)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET all skill cert
const adminGetAllSkilledBillDetail = async(req, res)=>{

    try{
        //get all query
        const skilledBill = await SkilledBill.find({billIsVerified: 0, isDeleted: 0}).sort({updatedAt: 1})
        .populate('skilled_id')
        res.status(200).json(skilledBill)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

const adminUpdateExperience = async(req, res) =>{
    const {id} = req.params 

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

     //delete query
     const experience = await Experience.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!experience){
        return res.status(404).json({error: 'Skill Experience not found'})
    }

    res.status(200).json(experience)
}

//UPDATE skill cert
const adminUpdateCertificate = async(req, res) =>{
    const {id} = req.params   

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

     //delete query
     const certificate = await Certificate.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!certificate){
        return res.status(404).json({error: 'Skill Certificate not found'})
    }

    res.status(200).json(certificate)
}

const adminEditSkilledBill = async(req, res) =>{
    const {id} = req.params   

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

     //delete query
     const skilledBill = await SkilledBill.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!skilledBill){
        return res.status(404).json({error: 'Bill not found'})
    }

    res.status(200).json(skilledBill)
}

//THIS IS NOT OFFICIAL
//update or edit address
const adminEditSkilledAddress = async(req,res) =>{
    // const arrayId = req.params.arrayId;
    const {addIsVerified} = req.body
    const {id} = req.params 
    
    try{
        const skilledInfo = await SkilledInfo.findByIdAndUpdate(
        {_id:id},
    {
        $set:{
            "address.addIsVerified":addIsVerified
        }
    })
    res.status(200).json(skilledInfo)
    }catch(error){
        res.status(404).json({error: error.message})
    }
}

//UPDATE UPDATE BILL VERIFICATION
const adminUpdateSkilledBill = async(req, res) =>{
    try {
        var currentDate = new Date();
        const skilledBill = await SkilledBill.updateMany({ billDueDate: {$lt:currentDate}, billIsVerified: 1 }, 
            {$set: 
                { billIsVerified: 0, billMessage: "Please pay your bill" } });
        
                return res.status(200).json(skilledBill);
                // console.log(skilledBill) 
    } catch (error) {
      res.status(500).json({ message: 'Error updating documents', error });
    }
}

//UDPATE SKILLED WORKER USER IS VERIFIED
const adminUpdateSkilledAccount = async(req, res) =>{
    try {
        // update all the documents in the 'skilledInfo' collection that match the specified query
        const skilledInfos = await SkilledInfo.updateMany({
            idIsVerified: 1,
            "address.addIsVerified": 1,
            skilledBill: { $elemMatch: { billIsVerified: 1 } }
        }, { $set: { userIsVerified: 1 } });
        return res.status(200).json(skilledInfos);
    } catch (err) {
        return { statusCode: 500, body: err.toString() };
    }
}

const adminUpdateSkilledAccountNot = async(req, res) =>{
    try {
        // update all the documents in the 'skilledInfo' collection that match the specified query
        const skilledInfos = await SkilledInfo.updateMany({
            $or: [
                { idIsVerified: 0 },
                { "address.addIsVerified": 0},
                { $and: [{ skilledBill: { $exists: true } }, 
                    { skilledBill: { $not: { $elemMatch: { billIsVerified: 1 } } } }] }
            ]
        }, { $set: { userIsVerified: 0 } });
        return res.status(200).json(skilledInfos);
    } catch (err) {
        return { statusCode: 500, body: err.toString() };
    }
}
module.exports = {
    adminLogIn,
    adminSignUp,
    adminGetAllAdmin,
    adminGetOneAdmin,
    adminUpdateUserName,
    adminUpdatePass,
    adminUpdateInfo,
    adminDeleteInfo,
    getAdminInfo, 
    updateAdminUserName,
    updateAdminPass,
    updateAdminInfo,
    deleteAdminInfo,
    adminGetAllSkilled,
    adminGetOneSkilled,
    adminUpdateSkilled,
    adminDeleteSkilled,
    adminGetAllExperience,
    adminGetAllCertificate,
    adminGetAllSkill,
    adminGetAllSkilledBill,
    adminGetAllSkilledDetail,
    adminGetAllSkilledDetailCert,
    adminGetAllSkilledExpDetail,
    adminGetAllSkilledCertDetail,
    adminGetAllSkilledBillDetail,
    adminUpdateExperience,
    adminUpdateCertificate,
    adminEditSkilledBill,
    adminUpdateSkilledBill,
    adminUpdateSkilledAccount,
    adminUpdateSkilledAccountNot,
    adminEditSkilledAddress
}