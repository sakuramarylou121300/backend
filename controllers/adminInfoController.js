const AdminInfo = require('../models/adminInfo')   
const SkilledInfo = require('../models/skilledInfo')
const Experience = require('../models/skilledExp')
const Certificate = require('../models/skillCert')
const Barangay = require('../models/skilledBClearance')
const Nbi = require('../models/skilledNClearance')
const Skill = require('../models/skill')
const AdminSkill = require('../models/adminSkill')
const Notification = require('../models/skilledNotification')
const Reason = require('../models/reason')
const ReasonDeact = require('../models/reasonDeact')
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
            path: 'skillExp',
            match: { isDeleted: 0} 
        })
        .populate({
            path: 'skillCert',
            match: { isDeleted: 0} 
        })
        .populate({
            path: 'skillBarangay',
            match: { isDeleted: 0} 
        })
        .populate({
            path: 'skillNbi',
            match: { isDeleted: 0} 
        })
        res.status(200).json(skilledInfo)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

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

const adminDeleteSkilled = async (req, res) => {
    const { message } = req.body
  
    try {
      await SkilledInfo.updateOne({ _id: req.params.id }, { $unset: { message: 1 } })
      const adminInfo = await SkilledInfo.findOneAndUpdate(
        { _id: req.params.id },
        {
            $push: { message },
            $set: { isDeleted:1 }
        },
        { new: true }
      )
      //notification
      const adminSkilledNotif = await SkilledInfo.findOne({ _id: req.params.id })
    //   .populate('message');
      const messageIds = adminSkilledNotif.message.map(msg => msg.message)
      let messageNotif = '';
      let isDeletedValue;
  
        isDeletedValue = 'deleted';
        
       //validation
       const isEmptyMessage = message.some((obj) => obj.message === "");
       if (isEmptyMessage) {
       return res.status(400).json({ error: 'Please select a reason.' });
       }
   
       // Check for duplicate messages in request body
       const hasDuplicates = message.some((obj, index) => {
           let foundDuplicate = false;
           message.forEach((innerObj, innerIndex) => {
               if (index !== innerIndex && obj.message === innerObj.message) {
                   foundDuplicate = true;
               }
           });
           return foundDuplicate;
       });
       
       if (hasDuplicates) {
           return res.status(400).json({ error: 'Please remove repeating reason.' });
       }
        const messages = await Promise.all(messageIds.map(async (msgId) => {
            const msg = await ReasonDeact.findOne({ _id: msgId });
            return msg.reason;
        }));
            messageNotif = `Your account has been ${isDeletedValue} because of ${messages.join(', ')}.`;
  
    const skilled_id = adminSkilledNotif._id;
    // Create a notification after updating creating barangay
    const notification = await Notification.create({
        skilled_id,
        message: messageNotif,
        urlReact:`/temporary`
    });
      res.status(200).json({ message: 'Skilled Worker deactivated.'})
      } catch (error) {
          res.status(400).json({ error: error.message })
      }
}

//SORT BY RECENTLY ADDED
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

const adminGetAllExpSkilledDetail = async(req, res)=>{

    try{
        //get all query
        const skilledInfo = await SkilledInfo
        .find({idIsVerified: 0, isDeleted: 0, 
        })
        .select("-password")
        .populate({
            path: 'skillExp',
            match: { isDeleted: 0},
            options: { sort: { createdAt: -1 } } 
        })
        .lean() // Convert Mongoose Document to JS object
        //count each skilled info skillCert unread
        const skilledInfoWithCountsAndLatestExpTimes  = skilledInfo.map(info => {
            const count = info.skillExp.filter(exp => exp.isRead === 0).length;
            const latestExpTime = info.skillExp.length > 0 ? info.skillExp[0].createdAt : new Date(0);
            return {...info, count, latestExpTime};
        });
      
          const skilledInfoSorted = skilledInfoWithCountsAndLatestExpTimes.sort((a, b) => {
            if (b.latestExpTime.getTime() - a.latestExpTime.getTime() !== 0) {
              // sort by the latest skillCert createdAt time    
              return b.latestExpTime - a.latestExpTime;
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

const adminGetAllCertSkilledDetail = async(req, res)=>{

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
        .populate({
            path: 'message.message',
            model: 'Reason',
            select: 'reason',
            options: { lean: true },
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

const adminGetAllBClearanceSkilledDetail = async(req, res)=>{

    try{
        //get all query
        const skilledInfo = await SkilledInfo
        .find({idIsVerified: 0, isDeleted: 0, 
        })
        .select("-password")
        .populate({
            path: 'skillBarangay',
            match: { isDeleted: 0},
            options: { sort: { createdAt: -1 } } 
        })
        .lean() // Convert Mongoose Document to JS object
        //count each skilled info skillCert unread
        const skilledInfoWithCountsAndLatestBarangayTimes  = skilledInfo.map(info => {
            const count = info.skillBarangay.filter(barangay => barangay.isRead === 0).length;
            const latestBarangayTime = info.skillBarangay.length > 0 ? info.skillBarangay[0].createdAt : new Date(0);
            return {...info, count, latestBarangayTime};
        });
      
          const skilledInfoSorted = skilledInfoWithCountsAndLatestBarangayTimes.sort((a, b) => {
            if (b.latestBarangayTime.getTime() - a.latestBarangayTime.getTime() !== 0) {
              // sort by the latest skillCert createdAt time    
              return b.latestBarangayTime - a.latestBarangayTime;
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

const adminGetAllNClearanceSkilledDetail = async(req, res)=>{

    try{
        //get all query
        const skilledInfo = await SkilledInfo
        .find({idIsVerified: 0, isDeleted: 0, 
        })
        .select("-password")
        .populate({
            path: 'skillNbi',
            match: { isDeleted: 0},
            options: { sort: { createdAt: -1 } } 
        })
        .lean() // Convert Mongoose Document to JS object
        //count each skilled info skillCert unread
        const skilledInfoWithCountsAndLatestNbiTimes  = skilledInfo.map(info => {
            const count = info.skillNbi.filter(nbi => nbi.isRead === 0).length;
            const latestNbiTime = info.skillNbi.length > 0 ? info.skillNbi[0].createdAt : new Date(0);
            return {...info, count, latestNbiTime};
        });
      
          const skilledInfoSorted = skilledInfoWithCountsAndLatestNbiTimes.sort((a, b) => {
            if (b.latestNbiTime.getTime() - a.latestNbiTime.getTime() !== 0) {
              // sort by the latest skillCert createdAt time    
              return b.latestNbiTime - a.latestNbiTime;
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

//USERNAME GET ALL
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
            isExpired:{$ne: 1}, 
            isDeleted: 0
        })
        .sort({updatedAt: 1})
        .populate('skilled_id')
        .populate('categorySkill')
        .populate({
            path: 'message.message',
            model: 'Reason',
            select: 'reason',
            options: { lean: true },
        })

        await Experience.updateMany({ 
            skilled_id: skilledIdDoc._id,
            isRead:0 }, 
            {$set: { isRead: 1 } });

        res.status(200).json(skilledExp)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

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
            isExpired:{$ne: 1},
            isDeleted: 0})
        .sort({updatedAt: 1})
        .populate('skilled_id')
        .populate({
            path: 'message.message',
            model: 'Reason',
            select: 'reason',
            options: { lean: true },
        })
        
        //update when admin opened then isRead1
        await Certificate.updateMany({ 
            skilled_id: skilledIdDoc._id,
            isRead:0 }, 
            {$set: { isRead: 1 } });

        var currentDate = new Date();//date today
        await Certificate.updateMany({ validUntil: {$lt:currentDate} }, 
            {$set: 
                { skillIsVerified: "false", isExpired: 1 } });
        
        res.status(200).json(certificate)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

const adminGetAllSkilledBarangayDetail = async(req, res)=>{
    const username = req.params.username;
    try{
        // Find skilled_id document based on username
        const skilledIdDoc = await SkilledInfo.findOne({ username: username });

        // Check if skilled_id exists for the given username
        if (!skilledIdDoc) {
        return res.status(404).json({ error: 'Skilled Worker not found' });
        }
        //get all query
        const barangay = await Barangay.find({
            skilled_id: skilledIdDoc._id,
            isExpired:{$ne: 1}, 
            isDeleted: 0})
        .sort({updatedAt: -1})
        .populate('skilled_id')
        .populate({
            path: 'message.message',
            model: 'Reason',
            select: 'reason',
            options: { lean: true },
        })
        await Barangay.updateMany({ 
            skilled_id: skilledIdDoc._id,
            isRead:0 }, 
            {$set: { isRead: 1 } });
        
        var currentDate = new Date();//date today
        await Barangay.updateMany({ bClearanceExp: {$lt:currentDate} }, 
            {$set: 
                { bClearanceIsVerified: "false", isExpired: 1 } });
        
        res.status(200).json(barangay)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

const adminGetAllSkilledNbiDetail = async(req, res)=>{
    const username = req.params.username;
    try{
        // Find skilled_id document based on username
        const skilledIdDoc = await SkilledInfo.findOne({ username: username });

        // Check if skilled_id exists for the given username
        if (!skilledIdDoc) {
        return res.status(404).json({ error: 'Skilled Worker not found' });
        }
        //get all query
        const nbi = await Nbi.find({
            skilled_id: skilledIdDoc._id,
            isExpired:{$ne: 1}, 
            isDeleted: 0})
        .sort({updatedAt: -1})
        .populate('skilled_id')
        .populate({
            path: 'message.message',
            model: 'Reason',
            select: 'reason',
            options: { lean: true },
        })
        await Nbi.updateMany({ 
            skilled_id: skilledIdDoc._id,
            isRead:0 }, 
            {$set: { isRead: 1 } });
        var currentDate = new Date();//date today
        await Nbi.updateMany({ nClearanceExp: {$lt:currentDate} }, 
            {$set: 
                { nClearanceIsVerified: "false", isExpired: 1 } });
        
        res.status(200).json(nbi)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
//UPDATE INFO
const adminUpdateExperience = async (req, res) => {
  const { expIsVerified, message } = req.body

  try {
    await Experience.updateOne({ _id: req.params.id }, { $unset: { message: 1 } })
    const skilledExp = await Experience.findOneAndUpdate(
        { _id: req.params.id },
        {
            $push: { message },
            $set: { expIsVerified }
        },
        { new: true }
    )
    //notification
    const expNotif = await Experience.findOne({ _id: req.params.id })
    .populate('message');
    const messageIds = expNotif.message.map(msg => msg.message)
    let messageNotif = '';
    let isVerified = expNotif.expIsVerified;
    let expIsVerifiedValue;

    if (isVerified === 'true') {
        expIsVerifiedValue = 'approved';
        messageNotif = `Your work experience has been ${expIsVerifiedValue}.`;
    } else if (isVerified === 'false') {
        expIsVerifiedValue = 'disapproved';
        //validation
        const isEmptyMessage = message.some((obj) => obj.message === "");
        if (isEmptyMessage) {
        return res.status(400).json({ error: 'Please select a reason.' });
        }
    
        // Check for duplicate messages in request body
        const hasDuplicates = message.some((obj, index) => {
            let foundDuplicate = false;
            message.forEach((innerObj, innerIndex) => {
                if (index !== innerIndex && obj.message === innerObj.message) {
                    foundDuplicate = true;
                }
            });
            return foundDuplicate;
        });
        
        if (hasDuplicates) {
            return res.status(400).json({ error: 'Please remove repeating reason.' });
        }

        const messages = await Promise.all(messageIds.map(async (msgId) => {
            if (msgId) {
                const msg = await Reason.findOne({ _id: msgId });
                return msg.reason;
            }
        }));
            messageNotif = `Your work experience has been ${expIsVerifiedValue}. Please update your uploaded work experience. Your work experience has ${messages.join(', ')}.`;
    }

    const skilled_id = expNotif.skilled_id;
    const skilledInfo = await SkilledInfo.findOne({ _id: skilled_id });
    const username = skilledInfo.username;
    const contactNo = skilledInfo.contact;
    console.log(contactNo)

    // Create a notification after updating creating barangay
    const notification = await Notification.create({
        skilled_id,
        message: messageNotif,
        urlReact:`/profileSkilled/${username}`
    });
    res.status(200).json({ message: 'Successfully updated.'})
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const adminUpdateCertificate = async (req, res) => {
    const { skillIsVerified, message } = req.body
  
    try {
      await Certificate.updateOne({ _id: req.params.id }, { $unset: { message: 1 } })
      const certificate = await Certificate.findOneAndUpdate(
          { _id: req.params.id },
          {
              $push: { message },
              $set: { skillIsVerified }
          },
          { new: true }
      )
      //notification
      const certNotif = await Certificate.findOne({ _id: req.params.id })
      .populate('message');
      
      const messageIds = certNotif.message.map(msg => msg.message)
      let messageNotif = '';
      let isVerified = certNotif.skillIsVerified;
      let skillIsVerifiedValue;
  
      if (isVerified === 'true') {
        skillIsVerifiedValue = 'approved';
          messageNotif = `Your skill certificate has been ${skillIsVerifiedValue}.`;
      } else if (isVerified === 'false') {
        skillIsVerifiedValue = 'disapproved';

        //validation
        const isEmptyMessage = message.some((obj) => obj.message === "");
        if (isEmptyMessage) {
        return res.status(400).json({ error: 'Please select a reason.' });
        }

        // Check for duplicate messages in the array
        const hasDuplicates = message.some((obj, index) => {
            let foundDuplicate = false;
            message.forEach((innerObj, innerIndex) => {
                if (index !== innerIndex && obj.message === innerObj.message) {
                    foundDuplicate = true;
                }
            });
            return foundDuplicate;
        });
        
        if (hasDuplicates) {
            return res.status(400).json({ error: 'Please remove repeating reason.' });
        }
  
        const messages = await Promise.all(messageIds.map(async (msgId) => {
            const msg = await Reason.findOne({ _id: msgId });
            return msg.reason;
        }));
            messageNotif = `Your skill certificate has been ${skillIsVerifiedValue}. Please update your uploaded skill certificate. Your skill certificate has ${messages.join(', ')}.`;
      }
  
    const skilled_id = certNotif.skilled_id;
    const skilledInfo = await SkilledInfo.findOne({ _id: skilled_id });
    const username = skilledInfo.username;
    
    //   get the skill name of the skill
    const skill = certNotif.categorySkill;
    const adminSkill = await AdminSkill.findOne({ _id: skill });
    const skillName = adminSkill.skill;
      // Create a notification after updating creating barangay
    const notification = await Notification.create({
        skilled_id,
        message: messageNotif,
        urlReact:`/profileSkilledCert/${skillName}/${username}`
    });
      res.status(200).json({ message: 'Successfully updated.'})
      } catch (error) {
          res.status(400).json({ error: error.message })
      }
}

const adminUpdateBarangay = async (req, res) => {
    const { bClearanceIsVerified, message } = req.body
  
    try {
      await Nbi.updateOne({ _id: req.params.id }, { $unset: { message: 1 } })
      const barangay = await Barangay.findOneAndUpdate(
        { _id: req.params.id },
        {
            $push: { message },
            $set: { bClearanceIsVerified }
        },
        { new: true }
      )
      //notification
      const brgyNotif = await Barangay.findOne({ _id: req.params.id })
      .populate('message');
      const messageIds = brgyNotif.message.map(msg => msg.message)
      let messageNotif = '';
      let isVerified = brgyNotif.bClearanceIsVerified;
      let bClearanceIsVerifiedValue;
  
    if (isVerified === 'true') {
        bClearanceIsVerifiedValue = 'approved';
        messageNotif = `Your barangay clearance has been ${bClearanceIsVerifiedValue}.`;
    } else if (isVerified === 'false') {
        bClearanceIsVerifiedValue = 'disapproved';
        //validation
        const isEmptyMessage = message.some((obj) => obj.message === "");
        if (isEmptyMessage) {
        return res.status(400).json({ error: 'Please select a reason.' });
        }
      
        // Check for duplicate messages in the array
        const hasDuplicates = message.some((obj, index) => {
            let foundDuplicate = false;
            message.forEach((innerObj, innerIndex) => {
                if (index !== innerIndex && obj.message === innerObj.message) {
                    foundDuplicate = true;
                }
            });
            return foundDuplicate;
        });
        
        if (hasDuplicates) {
            return res.status(400).json({ error: 'Please remove repeating reason.' });
        }
        const messages = await Promise.all(messageIds.map(async (msgId) => {
            const msg = await Reason.findOne({ _id: msgId });
            return msg.reason;
        }));
            messageNotif = `Your barangay clearance has been ${bClearanceIsVerifiedValue}. Please update your uploaded barangay clearance. Your barangay clearance has ${messages.join(', ')}.`;
      }
  
    const skilled_id = brgyNotif.skilled_id;
    const skilledInfo = await SkilledInfo.findOne({ _id: skilled_id });
    const username = skilledInfo.username;
    const contactNo = skilledInfo.contact;
    // Create a notification after updating creating barangay
    const notification = await Notification.create({
        skilled_id,
        message: messageNotif,
        urlReact:`/profileSkilled`
    });
      res.status(200).json({ message: 'Successfully updated.'})
      } catch (error) {
          res.status(400).json({ error: error.message })
      }
}

const adminUpdateNbi = async (req, res) => {
    const { nClearanceIsVerified, message } = req.body
  
    try {
      await Nbi.updateOne({ _id: req.params.id }, { $unset: { message: 1 } })
      const nbi = await Nbi.findOneAndUpdate(
        { _id: req.params.id },
        {
            $push: { message },
            $set: { nClearanceIsVerified }
        },
        { new: true }
      )
      //notification
      const nbiNotif = await Nbi.findOne({ _id: req.params.id })
      .populate('message');
      const messageIds = nbiNotif.message.map(msg => msg.message)
      let messageNotif = '';
      let isVerified = nbiNotif.nClearanceIsVerified;
      let nClearanceIsVerifiedValue;
  
    if (isVerified === 'true') {
        nClearanceIsVerifiedValue = 'approved';
        messageNotif = `Your nbi clearance has been ${nClearanceIsVerifiedValue}.`;
    } else if (isVerified === 'false') {
        nClearanceIsVerifiedValue = 'disapproved';
        //validation
        const isEmptyMessage = message.some((obj) => obj.message === "");
        if (isEmptyMessage) {
        return res.status(400).json({ error: 'Please select a reason.' });
        }
      
        // Check for duplicate messages in the array
        const hasDuplicates = message.some((obj, index) => {
            let foundDuplicate = false;
            message.forEach((innerObj, innerIndex) => {
                if (index !== innerIndex && obj.message === innerObj.message) {
                    foundDuplicate = true;
                }
            });
            return foundDuplicate;
        });
        
        if (hasDuplicates) {
            return res.status(400).json({ error: 'Please remove repeating reason.' });
        }
        const messages = await Promise.all(messageIds.map(async (msgId) => {
            const msg = await Reason.findOne({ _id: msgId });
            return msg.reason;
        }));
            messageNotif = `Your nbi clearance has been ${nClearanceIsVerifiedValue}. Please update your uploaded nbi clearance. Your nbi clearance has ${messages.join(', ')}.`;
      }
  
    const skilled_id = nbiNotif.skilled_id;
    const skilledInfo = await SkilledInfo.findOne({ _id: skilled_id });
    const username = skilledInfo.username;
    const contactNo = skilledInfo.contact;
    // Create a notification after updating creating barangay
    const notification = await Notification.create({
        skilled_id,
        message: messageNotif,
        urlReact:`/profileSkilled`
    });
      res.status(200).json(nbi)
      } catch (error) {
          res.status(400).json({ error: error.message })
      }
}

const reactivateSkilledInfo = async(req, res) =>{
    const {username} = req.params 
    try{
        await SkilledInfo.updateOne({username:username}, { $unset: { message: 1 } })
        const skilledInfo = await SkilledInfo.findOneAndUpdate({username:username},
            {isDeleted:0})
        res.status(200).json({ message: 'Skilled Worker Reactivated.'})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//update isRead: 1
const updateExpIsRead = async(req, res) =>{
    try {
        // Find skilled_id document based on username
        const skilledIdDoc = await SkilledInfo.findOne({ username: username });

        // Check if skilled_id exists for the given username
        if (!skilledIdDoc) {
        return res.status(404).json({ error: 'Skilled Worker not found' });
        }
        const skilledExp = await Experience.updateMany({ 
            skilled_id: skilledIdDoc._id,
            isRead:0 }, 
            {$set: { isRead: 1 } });
        
        return res.status(200).json(skilledExp);
                // console.log(skilledBill) 
    } catch (error) {
      res.status(500).json({ error: 'Error updating documents', error });
    }
}

//TABLES
//list of deleted account for admin]
const adminGetAllSkilledDeact = async(req, res)=>{

    try{
        //this is to find skill for specific user
        //get all query
        const skilledInfo = await SkilledInfo.find({isDeleted: 1})
        .sort({updatedAt: -1})
        .populate({
            path: 'message.message',
            model: 'ReasonDeact',
            select: 'reason',
            options: { lean: true },
        })
        res.status(200).json(skilledInfo)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
const adminGetAllSkilledCertDetailExpired = async(req, res)=>{
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
            isExpired: 1,
            isDeleted: 0}).sort({updatedAt: 1})
        .populate('skilled_id')
        res.status(200).json(certificate)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
const adminGetAllSkilledBarangayDetailExpired = async(req, res)=>{
    const username = req.params.username;
    try{
        // Find skilled_id document based on username
        const skilledIdDoc = await SkilledInfo.findOne({ username: username });

        // Check if skilled_id exists for the given username
        if (!skilledIdDoc) {
        return res.status(404).json({ error: 'Skilled Worker not found' });
        }
        //get all query
        const barangay = await Barangay.find({
            skilled_id: skilledIdDoc._id,
            isExpired:1, 
            isDeleted: 0}).sort({updatedAt: 1})
        .populate('skilled_id')
        res.status(200).json(barangay)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
const adminGetAllSkilledNbiDetailExpired = async(req, res)=>{
    const username = req.params.username;
    try{
        // Find skilled_id document based on username
        const skilledIdDoc = await SkilledInfo.findOne({ username: username });

        // Check if skilled_id exists for the given username
        if (!skilledIdDoc) {
        return res.status(404).json({ error: 'Skilled Worker not found' });
        }
        //get all query
        const nbi = await Nbi.find({
            skilled_id: skilledIdDoc._id,
            isExpired:1, 
            isDeleted: 0}).sort({updatedAt: 1})
        .populate('skilled_id')
        res.status(200).json(nbi)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
const adminGetAllSkilledExpDeleted = async(req, res)=>{
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
            isDeleted: 1
        })
        .sort({updatedAt: 1})
        .populate('skilled_id')
        res.status(200).json(skilledExp)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
const adminGetAllSkilledCertDeleted = async(req, res)=>{
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
            isDeleted: 1}).sort({updatedAt: 1})
        .populate('skilled_id')
        res.status(200).json(certificate)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
const adminGetAllSkilledBarangayDeleted= async(req, res)=>{
    const username = req.params.username;
    try{
        // Find skilled_id document based on username
        const skilledIdDoc = await SkilledInfo.findOne({ username: username });

        // Check if skilled_id exists for the given username
        if (!skilledIdDoc) {
        return res.status(404).json({ error: 'Skilled Worker not found' });
        }
        //get all query
        const barangay = await Barangay.find({
            skilled_id: skilledIdDoc._id,
            isDeleted: 1}).sort({updatedAt: 1})
        .populate('skilled_id')
        res.status(200).json(barangay)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

const adminGetAllSkilledNbiDeleted = async(req, res)=>{
    const username = req.params.username;
    try{
        // Find skilled_id document based on username
        const skilledIdDoc = await SkilledInfo.findOne({ username: username });

        // Check if skilled_id exists for the given username
        if (!skilledIdDoc) {
        return res.status(404).json({ error: 'Skilled Worker not found' });
        }
        //get all query
        const nbi = await Nbi.find({
            skilled_id: skilledIdDoc._id,
            isDeleted: 1}).sort({updatedAt: 1})
        .populate('skilled_id')
        res.status(200).json(nbi)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
//THIS IS NOT OFFICIAL
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
    adminGetAllSkill,
    adminGetAllSkilledBill,
    adminGetAllExpSkilledDetail,
    adminGetAllCertSkilledDetail,
    adminGetAllBClearanceSkilledDetail,
    adminGetAllNClearanceSkilledDetail,
    adminGetAllSkilledExpDetail,
    adminGetAllSkilledCertDetail,
    adminGetAllSkilledBarangayDetail,
    adminGetAllSkilledNbiDetail,
    adminGetAllSkilledBillDetail,
    adminUpdateExperience,
    adminUpdateCertificate,
    adminUpdateBarangay,
    adminUpdateNbi,
    updateExpIsRead,
    adminGetAllSkilledDeact,
    adminGetAllSkilledCertDetailExpired,
    adminGetAllSkilledBarangayDetailExpired,
    adminGetAllSkilledNbiDetailExpired,
    adminGetAllSkilledExpDeleted,
    adminGetAllSkilledCertDeleted,
    adminGetAllSkilledBarangayDeleted,
    adminGetAllSkilledNbiDeleted,
    reactivateSkilledInfo,
    adminEditSkilledBill,
    adminUpdateSkilledBill,
    adminUpdateSkilledAccount,
    adminUpdateSkilledAccountNot,
    adminEditSkilledAddress
}