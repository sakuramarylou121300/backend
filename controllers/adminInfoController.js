const AdminInfo = require('../models/adminInfo')   
const SkilledInfo = require('../models/skilledInfo')
const ClientInfo = require('../models/clientInfo')
const Experience = require('../models/skilledExp')
const Certificate = require('../models/skillCert')
const Barangay = require('../models/skilledBClearance')
const ClientBarangay = require('../models/clientBClearance')
const Nbi = require('../models/skilledNClearance')
const ClientNbi = require('../models/clientNClearance')
const Skill = require('../models/skill')
const AdminSkill = require('../models/adminSkill')
const Notification = require('../models/skilledNotification')
const ClientNotification = require('../models/clientNotification')
const Reason = require('../models/reason')
const ReasonDeact = require('../models/reasonDeact')
const SkilledBill = require('../models/skilledBill')
const moment = require('moment');
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
        //check if password is not empty
        if (!req.body.retypePassword) {
            throw new Error('Please confirm your password.');
        }

         //check if password is match to retype password
        if (password!== req.body.retypePassword) {
            throw new Error('Passwords do not match.');
        }
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
        const adminInfo = await AdminInfo.find({isDeleted: 0})
        .select("-password")
        .sort({lname: 1})
        .populate({path: 'roleCapabality', 
        populate: [
            {path: 'capability_id'}, 
            {path: 'adminInfo_id'}
        ],
        match: { isDeleted: 0 }})
   
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
        return res.status(404).json({error: 'Invalid id.'})
    }

    //find query
    const adminInfo = await AdminInfo.findById({_id: id})

    //check if not existing
    if (!adminInfo){
        return res.status(404).json({error: 'Admin not found.'})
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
            throw Error('Please enter your username.')
        }

        //check if strong password
        if(username.length <7){
            throw Error('Please enter atleast 6 characters in username.')
        }

         //check if email is existing
        const skilledExists = await SkilledInfo.findOne({username})
        if (skilledExists){
            throw Error('Username already in use.')
        }

        const clientExists = await ClientInfo.findOne({username})
        if (clientExists){
            throw Error('Username already in use.')
        }

        const exists = await AdminInfo.findOne({username})
        if (exists){
            throw Error('Username already in use.')
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

        //check if password is not empty
        if (!req.body.retypePassword) {
            throw new Error('Please confirm your password.');
        }

         //check if password is match to retype password
        if (newpass!== req.body.retypePassword) {
            throw new Error('Passwords do not match.');
        }

        //validation
        if (!newpass){
            throw Error('Please enter all blank fields.')
        }

        //check if strong password
        if(newpass.length <=5){
            throw Error('Please enter atleast 6 characters in password.')
        }

        //salt for additional security of the system
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(newpass, salt)

        //update info
        const adminInfo = await AdminInfo.findOneAndUpdate(
            {_id:id},
            {password:hash})

        //success
        res.status(200).json({message: "Successfully updated."})
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
        if (!lname || !fname || !contact){
            throw Error('Please fill in all the blank fields.')
        }

        //if existing information
        const adminInfoCheck = await AdminInfo.findOne({
            fname: fname,
            mname: mname,
            lname: lname,
            contact: contact,
            isDeleted:{$in: [0, 1]}
        })
        
        if(adminInfoCheck){
            return res.status(400).json({error: "You have entered the same personal information, please try again."})
        }

        const mobileNumberRegex = /^09\d{9}$|^639\d{9}$/;
        
        if (!mobileNumberRegex.test(contact)) {
            throw new Error('Please check contact number.');
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
        const adminInfo = await AdminInfo.findById(id)
        if(adminInfo.isMainAdmin === 1){
           return res.status(400).json({error: "Cannot delete main admin account."})
        }
        adminInfo.isDeleted = 1;
        await adminInfo.save() 
        res.status(200).json({ message: "Successfully deleted."})
    }
    
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//THIS IS FOR ALL ADMIN ACCESS TO THEIR OWN INFO
//SPECIFIC ACCOUNT
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
            throw Error('Please enter your username.')
        }

        //check if strong password
        if(username.length <6){
            throw Error('Please enter atleast 6 characters in username.')
        }

        //check if email is existing
        const skilledExists = await SkilledInfo.findOne({username})
        if (skilledExists){
            throw Error('Username already in use.')
        }

        //check if email is existing
        const clientExists = await ClientInfo.findOne({username})
        if (clientExists){
            throw Error('Username already in use.')
        }

         //check if email is existing
        const exists = await AdminInfo.findOne({username})
        if (exists){
            throw Error('Username already in use.')
        }

        //update info
        const adminInfo = await AdminInfo.findOneAndUpdate(
            {_id: req.adminInfo._id},
            {username})

        //success
        res.status(200).json({message: "Successfully updated."})
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}
//update admin password, to their specific account
const updateAdminPass = async(req, res) =>{
  
    try{
        
        //get info
        const {oldpass, newpass, retypePassword, username} = req.body

        //find the user first
        const admin_Info = await AdminInfo.findOne({username})
        if (!admin_Info){
            throw Error('Incorrect username.')
        }

        //the user can updated password after 30 days
        // Calculate the time difference between passwordUpdated and the current date
        const currentTime = new Date();
        const passwordUpdatedTime = admin_Info.passwordUpdated;

        // Calculate the difference in milliseconds
        const timeDifference = currentTime - passwordUpdatedTime;

        // Calculate the difference in days
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        // Calculate the date when the user can update the password again
        const nextUpdateDate = new Date(passwordUpdatedTime);
        nextUpdateDate.setDate(nextUpdateDate.getDate() + 30);

        // Allow password update only if 30 days have passed since passwordUpdated
        if (daysDifference < 30) {
            // throw Error('You can update your password only after 30 days of the last update.');
            throw Error(`You can only update password after 30 days of your last update. Next update will be on ${nextUpdateDate.toDateString()}.`);
        }

        //validation
        if (!oldpass || !newpass || !retypePassword || !username){
            throw Error('Please fill in all the blank fields.')
        }
        //check if the password and password hash in match
        const match = await bcrypt.compare(oldpass, admin_Info.password)
        //if not match
        if(!match){
            throw Error('Incorrect password.')
        }

        if (oldpass===newpass){
            throw Error('Please do not enter the same current and new password.')
        }

        //check if strong password
        if(newpass.length <7){
            throw Error('Please enter atleast 6 characters in password.')
        }

        //check confirmation of password
        if (newpass!==retypePassword){
            throw Error('Password confirmation is not matched.')
        }

        //salt for additional security of the system
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(newpass, salt)

        //update info
        //update info
        const currentDate = new Date();//if greater than or equal to 30, update the passwordUpdated to the current date
        const adminInfo = await AdminInfo.findOneAndUpdate(
            {_id: req.adminInfo._id},
            {
                password:hash,
                passwordUpdated: currentDate})

        //success
        res.status(200).json({message: "Successfully updated."})
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

        //if existing information
        const adminInfoCheck = await AdminInfo.findOne({
            fname: fname,
            mname: mname,
            lname: lname,
            contact: contact,
            isDeleted:{$in: [0, 1]}
        })
        
        if(adminInfoCheck){
            return res.status(400).json({error: "You have entered the same personal information, please try again."})
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
            return res.status(400).json({error: "Cannot delete main admin account."})
        }
        adminInfo.isDeleted = 1;
        await adminInfo.save()
        res.status(200).json({ message: "Successfully deleted."})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}
//DEPENDING ON THE ROLE OF THE ADMIN SKILLED
const adminGetAllSkilled = async(req, res)=>{

    try{
        //get all query
        const skilledInfo = await SkilledInfo.find({isDeleted: 0})
        .sort({createdAt: -1})
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
        return res.status(404).json({error: 'Invalid id.'})
    }

    //find query
    const skilledInfo = await SkilledInfo.findById({_id: id})

    //check if not existing
    if (!skilledInfo){
        return res.status(404).json({error: 'Skilled Worker not found.'})
    }

    res.status(200).json(skilledInfo)   

}

const adminUpdateSkilledPass = async(req, res) =>{
    const {id} = req.params 
    try{
        
        //get info
        const {newpass} = req.body

        //check if password is not empty
        if (!req.body.retypePassword) {
            throw new Error('Please confirm your password.');
        }

         //check if password is match to retype password
        if (newpass!== req.body.retypePassword) {
            throw new Error('Passwords do not match.');
        }

        //validation
        if (!newpass){
            throw Error('Please enter password.')
        }

        //check if strong password
        if(newpass.length <7){
            throw Error('Please enter atleast 6 characters in password.')
        }

        //salt for additional security of the system
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(newpass, salt)

        //update info
        const skilledInfo = await SkilledInfo.findOneAndUpdate(
            {_id:id},
            {password:hash})

        //success
        res.status(200).json({message: "Successfully updated."})
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}

const adminDeleteSkilled = async (req, res) => {
    const message  = req.body.message;
    const isDeletedDate  = req.body.isDeletedDate;
  
    try {
        const hasDuplicates = message.some((obj, index) => {
            if (obj.message.trim() === '') {
                throw new Error('Please select a reason.');
            }

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
        
        //deactivate account
        await SkilledInfo.updateOne({ _id: req.params.id }, { $unset: { message: 1 } })
        const skilledInfo = await SkilledInfo.findOneAndUpdate(
            { _id: req.params.id },
            {
                $push: { message },
                $set: { 
                    isDeleted:1,
                    isDeletedDate: isDeletedDate
                }
            },
            { new: true }
        )
        //notification
        const adminSkilledNotif = await SkilledInfo.findOne({ _id: req.params.id })
        .populate('message');
        console.log(adminSkilledNotif)
        const messageIds = adminSkilledNotif.message.map(msg => msg.message)
        let messageNotif = '';
        let isDeletedValue  = 'deleted';
            const messages = await Promise.all(
                messageIds.map(async (msgId) => {
                    if (msgId) {
                    const msg = await ReasonDeact.findOne({ _id: msgId });
                    return msg.reason;
                    }
                    return null;
                })
            );
            messageNotif = `Your account has been ${isDeletedValue} because of ${messages.join(', ')}.`;
  
    const skilled_id = adminSkilledNotif._id;
    // Create a notification after updating creating barangay
    const notification = await Notification.create({
        skilled_id,
        message: messageNotif,
        urlReact:`/Profile/Setting`
    });
      res.status(200).json({ message: 'Skilled Worker deactivated.'})
      } catch (error) {
          res.status(400).json({ error: error.message })
      }
}

//this is not being used
const adminUpdateSkilled = async(req, res) =>{
    const {id} = req.params    

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

     //delete query
     const skilledInfo = await SkilledInfo.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!skilledInfo){
        return res.status(404).json({error: 'Skilled Worker not found.'})
    }

    res.status(200).json({message: "Successfully updated."})
}


//DEPENDING ON THE ROLE OF THE ADMIN CLIENT
const adminGetAllClient = async(req, res)=>{

    try{
        //get all query
        const clientInfo = await ClientInfo.find({isDeleted: 0})
        .sort({createdAt: -1})
        .select("-password")
        .populate({
            path: 'clientBarangay',
            match: { isDeleted: 0} 
        })
        .populate({
            path: 'clientNbi',
            match: { isDeleted: 0} 
        })
        res.status(200).json(clientInfo)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

const adminGetOneClient = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

    //find query
    const clientInfo = await ClientInfo.findById({_id: id})

    //check if not existing
    if (!clientInfo){
        return res.status(404).json({error: 'Client not found.'})
    }

    res.status(200).json(clientInfo)   

}


const adminUpdateClientPass = async(req, res) =>{
    const {id} = req.params 
    try{
        
        //get info
        const {newpass} = req.body

        //check if password is not empty
        if (!req.body.retypePassword) {
            throw new Error('Please confirm your password.');
        }

         //check if password is match to retype password
        if (newpass!== req.body.retypePassword) {
            throw new Error('Passwords do not match.');
        }

        //validation
        if (!newpass){
            throw Error('Please enter password.')
        }

        //check if strong password
        if(newpass.length <7){
            throw Error('Please enter atleast 6 characters in password.')
        }

        //salt for additional security of the system
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(newpass, salt)

        //update info
        const skilledInfo = await ClientInfo.findOneAndUpdate(
            {_id:id},
            {password:hash})

        //success
        res.status(200).json({message: "Successfully updated."})
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}

const adminDeleteClient = async (req, res) => {
    const message = req.body.message;
    const isDeletedDate  = req.body.isDeletedDate;
  
    try {
        const hasDuplicates = message.some((obj, index) => {
            if (obj.message.trim() === '') {
                throw new Error('Please select a reason.');
            }

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
        await ClientInfo.updateOne({ _id: req.params.id }, { $unset: { message: 1 } })
        const clientInfo = await ClientInfo.findOneAndUpdate(
            { _id: req.params.id },
            {
                $push: { message },
                $set: { 
                    isDeleted:1,
                    isDeletedDate: isDeletedDate 
                }
            },
            { new: true }
        )
        //notification
        const adminClientNotif = await ClientInfo.findOne({ _id: req.params.id })
        .populate('message');
        const messageIds = adminClientNotif.message.map(msg => msg.message)
        let messageNotif = '';
        let isDeletedValue  = 'deleted';
            const messages = await Promise.all(
                messageIds.map(async (msgId) => {
                    if (msgId) {
                    const msg = await ReasonDeact.findOne({ _id: msgId });
                    return msg.reason;
                    }
                    return null;
                })
            );
            messageNotif = `Your account has been ${isDeletedValue} because of ${messages.join(', ')}.`;
  
    const client_id = adminClientNotif._id;
    // Create a notification after updating creating barangay
    const notification = await ClientNotification.create({
        client_id,
        message: messageNotif,
        urlReact:`/Profile/Setting`
    });
      res.status(200).json({ message: 'Client deactivated.'})
      } catch (error) {
          res.status(400).json({ error: error.message })
      }
}

//this is not being used
const adminUpdateClient = async(req, res) =>{
    const {id} = req.params    

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

     //delete query
     const clientInfo = await ClientInfo.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!clientInfo){
        return res.status(404).json({error: 'Client not found.'})
    }

    res.status(200).json({message: "Successfully updated."})
}

//SORT BY RECENTLY ADDED SKILLED
//this is not being used
const adminGetAllSkill = async(req, res)=>{

    try{
        //this is to find skill for specific user
        //get all query
        const skill = await Skill.find({isDeleted: 0})
        .sort({skillName: 1}).populate('skilled_id')
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

//SORT BY RECENTLY ADDED CLIENT
const adminGetAllBClearanceClientDetail = async(req, res)=>{

    try{
        //get all query
        const clientInfo = await ClientInfo
        .find({idIsVerified: 0, isDeleted: 0, 
        })
        .select("-password")
        .populate({
            path: 'clientBarangay',
            match: { isDeleted: 0},
            options: { sort: { createdAt: -1 } } 
        })
        .lean() // Convert Mongoose Document to JS object
        //count each skilled info skillCert unread
        const clientInfoWithCountsAndLatestBarangayTimes  = clientInfo.map(info => {
            const count = info.clientBarangay.filter(barangay => barangay.isRead === 0).length;
            const latestBarangayTime = info.clientBarangay.length > 0 ? info.clientBarangay[0].createdAt : new Date(0);
            return {...info, count, latestBarangayTime};
        });
      
          const clientInfoSorted = clientInfoWithCountsAndLatestBarangayTimes.sort((a, b) => {
            if (b.latestBarangayTime.getTime() - a.latestBarangayTime.getTime() !== 0) {
              // sort by the latest skillCert createdAt time    
              return b.latestBarangayTime - a.latestBarangayTime;
            } else {
              // if the latest skillCert createdAt time is the same,
              // sort by the overall updatedAt time of the skilledInfo
              return b.updatedAt - a.updatedAt;
            }
          });
          
        res.status(200).json(clientInfoSorted);     
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
const adminGetAllNClearanceClientDetail = async(req, res)=>{

    try{
        //get all query
        const clientInfo = await ClientInfo
        .find({idIsVerified: 0, isDeleted: 0, 
        })
        .select("-password")
        .populate({
            path: 'clientNbi',
            match: { isDeleted: 0},
            options: { sort: { createdAt: -1 } } 
        })
        .lean() // Convert Mongoose Document to JS object
        //count each skilled info skillCert unread
        const clientInfoWithCountsAndLatestNbiTimes  = clientInfo.map(info => {
            const count = info.clientNbi.filter(nbi => nbi.isRead === 0).length;
            const latestNbiTime = info.clientNbi.length > 0 ? info.clientNbi[0].createdAt : new Date(0);
            return {...info, count, latestNbiTime};
        });
      
          const clientInfoSorted = clientInfoWithCountsAndLatestNbiTimes.sort((a, b) => {
            if (b.latestNbiTime.getTime() - a.latestNbiTime.getTime() !== 0) {
              // sort by the latest skillCert createdAt time    
              return b.latestNbiTime - a.latestNbiTime;
            } else {
              // if the latest skillCert createdAt time is the same,
              // sort by the overall updatedAt time of the skilledInfo
              return b.updatedAt - a.updatedAt;
            }
          });
          
        res.status(200).json(clientInfoSorted);     
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
        .sort({createdAt: -1})
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
        .sort({createdAt: -1})
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
        
        const formattedSkillCert = certificate.map((clearance) => ({
            ...clearance.toObject(),
            validUntil: moment(clearance.validUntil).tz('Asia/Manila').format('MM-DD-YYYY')
        }));
        res.status(200).json(formattedSkillCert)
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
            bClearanceIsVerified: { $ne: "expired" },
            isDeleted: 0})
        .sort({createdAt: -1})
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
                { bClearanceIsVerified: "expired" } });
    
        const formattedSkilledBClearance = barangay.map((clearance) => ({
        ...clearance.toObject(),
        bClearanceExp: moment(clearance.bClearanceExp).tz('Asia/Manila').format('MM-DD-YYYY')
        }));
        res.status(200).json(formattedSkilledBClearance)
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
            nClearanceIsVerified: { $ne: "expired" },
            isDeleted: 0})
        .sort({createdAt: -1})
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
                { nClearanceIsVerified: "expired" } });
        const formattedSkilledNClearance = nbi.map((clearance) => ({
            ...clearance.toObject(),
            nClearanceExp: moment(clearance.nClearanceExp).tz('Asia/Manila').format('MM-DD-YYYY')
        }));
        res.status(200).json(formattedSkilledNClearance)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//USERNAME GET ALL CLIENT
const adminGetAllClientBarangayDetail = async(req, res)=>{
    const username = req.params.username;
    try{
        // Find skilled_id document based on username
        const clientIdDoc = await ClientInfo.findOne({ username: username });

        // Check if skilled_id exists for the given username
        if (!clientIdDoc) {
        return res.status(404).json({ error: 'Client not found' });
        }
        //get all query
        const barangay = await ClientBarangay.find({
            client_id: clientIdDoc._id,
            bClearanceIsVerified: { $ne: "expired" },
            isDeleted: 0})
        .sort({createdAt: -1})
        .populate('client_id')
        .populate({
            path: 'message.message',
            model: 'Reason',
            select: 'reason',
            options: { lean: true },
        })
        await ClientBarangay.updateMany({ 
            client_id: clientIdDoc._id,
            isRead:0 }, 
            {$set: { isRead: 1 } });
        
        var currentDate = new Date();//date today
        await ClientBarangay.updateMany({ bClearanceExp: {$lt:currentDate} }, 
            {$set: 
                { bClearanceIsVerified: "expired" } });
        const formattedSkilledBClearance = barangay.map((clearance) => ({
            ...clearance.toObject(),
            bClearanceExp: moment(clearance.bClearanceExp).tz('Asia/Manila').format('MM-DD-YYYY')
        }));

        res.status(200).json(formattedSkilledBClearance)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

const adminGetAllClientNbiDetail = async(req, res)=>{
    const username = req.params.username;
    try{
        // Find skilled_id document based on username
        const  clientIdDoc = await ClientInfo.findOne({ username: username });

        // Check if skilled_id exists for the given username
        if (!clientIdDoc) {
        return res.status(404).json({ error: 'Client not found' });
        }
        //get all query
        const nbi = await ClientNbi.find({
            client_id: clientIdDoc._id,
            nClearanceIsVerified: { $ne: "expired" },
            isDeleted: 0})
        .sort({createdAt: -1})
        .populate('client_id')
        .populate({
            path: 'message.message',
            model: 'Reason',
            select: 'reason',
            options: { lean: true },
        })
        await Nbi.updateMany({ 
            client_id: clientIdDoc._id,
            isRead:0 }, 
            {$set: { isRead: 1 } });
        var currentDate = new Date();//date today
        await ClientNbi.updateMany({ nClearanceExp: {$lt:currentDate} }, 
            {$set: 
                { nClearanceIsVerified: "expired" } });
        
        const formattedSkilledNClearance = nbi.map((clearance) => ({
            ...clearance.toObject(),
            nClearanceExp: moment(clearance.nClearanceExp).tz('Asia/Manila').format('MM-DD-YYYY')
        }));        
        res.status(200).json(formattedSkilledNClearance)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//UPDATE
const adminUpdateExperience = async (req, res) => {
    const { expIsVerified, message } = req.body;
  
    try {
        // Check for duplicate messages in request body
        const hasDuplicates = message.some((obj, index) => {
            if (obj.message.trim() === '') {
                throw new Error('Please enter a reason.');
            }

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
    
        await Experience.updateOne({ _id: req.params.id }, { $unset: { message: 1 } });
        const skilledExp = await Experience.findOneAndUpdate(
            { _id: req.params.id },
            {
            $push: { message },
            $set: { expIsVerified },
            },
            { new: true }
        );
  
        // Notification
        const expNotif = await Experience.findOne({ _id: req.params.id }).populate('message');
        const messageIds = expNotif.message.map(msg => msg.message);
        let messageNotif = '';
        let isVerified = expNotif.expIsVerified;
        let expIsVerifiedValue;
  
        if (isVerified === 'true') {
            expIsVerifiedValue = 'approved';
            messageNotif = `Your work experience has been ${expIsVerifiedValue}.`;
        } else if (isVerified === 'false') {
            expIsVerifiedValue = 'disapproved';
    
            const messages = await Promise.all(
            messageIds.map(async (msgId) => {
                if (msgId) {
                const msg = await Reason.findOne({ _id: msgId });
                return msg.reason;
                }
                return null;
            })
            );
  
            messageNotif = `Your work experience has been ${expIsVerifiedValue}. Please update your uploaded work experience. Your work experience has ${messages.filter(msg => msg !== null).join(', ')}.`;
        }
  
        const skilled_id = expNotif.skilled_id;
        const skilledInfo = await SkilledInfo.findOne({ _id: skilled_id });
        const username = skilledInfo.username;
        const contactNo = skilledInfo.contact;

        //   get the skill name of the skill
        const skill = expNotif.categorySkill;
        const adminSkill = await AdminSkill.findOne({ _id: skill });
        const skillName = adminSkill.skill;
        console.log(contactNo);
  
        // Create a notification after updating creating barangay
        const notification = await Notification.create({
            skilled_id,
            message: messageNotif,
            urlReact: `/Profile/Setting`,
        });
  
        res.status(200).json({ message: 'Successfully updated.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
  
const adminUpdateCertificate = async (req, res) => {
    const { skillIsVerified, message } = req.body
  
    try {
         // Check for duplicate messages in the array
        const hasDuplicates = message.some((obj, index) => {

            if (obj.message.trim() === '') {
                throw new Error('Please enter a reason.');
            }

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
            urlReact:`/Profile/Setting`
        });
        res.status(200).json({ message: 'Successfully updated.'})
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
}

const adminUpdateBarangay = async (req, res) => {
    const { bClearanceIsVerified, message } = req.body
  
    try {
        // Check for duplicate messages in request body
        const hasDuplicates = message.some((obj, index) => {
            if (obj.message.trim() === '') {
                throw new Error('Please enter a reason.');
            }

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

        await Barangay.updateOne({ _id: req.params.id }, { $unset: { message: 1 } })
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
        urlReact:`/Profile/Setting`
    });
      res.status(200).json({ message: 'Successfully updated.'})
      } catch (error) {
          res.status(400).json({ error: error.message })
      }
}

const adminUpdateNbi = async (req, res) => {
    const { nClearanceIsVerified, message } = req.body
  
    try {
        // Check for duplicate messages in the array
        const hasDuplicates = message.some((obj, index) => {
            if (obj.message.trim() === '') {
                throw new Error('Please enter a reason.');
            }
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
        urlReact:`/Profile/Setting`
    });
        res.status(200).json({ message: 'Successfully updated.'})
      } catch (error) {
          res.status(400).json({ error: error.message })
      }
}

//UPDATED INFO CLIENT
const adminUpdateBarangayClient = async (req, res) => {
    const { bClearanceIsVerified, message } = req.body
  
    try {
        // Check for duplicate messages in request body
        const hasDuplicates = message.some((obj, index) => {
            if (obj.message.trim() === '') {
                throw new Error('Please enter a reason.');
            }

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

        await ClientBarangay.updateOne({ _id: req.params.id }, { $unset: { message: 1 } })
        const clientBarangay = await ClientBarangay.findOneAndUpdate(
            { _id: req.params.id },
            {
                $push: { message },
                $set: { bClearanceIsVerified }
            },
            { new: true }
        )
        //notification
        const brgyNotif = await ClientBarangay.findOne({ _id: req.params.id })
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
       
        const messages = await Promise.all(messageIds.map(async (msgId) => {
            const msg = await Reason.findOne({ _id: msgId });
            return msg.reason;
        }));
            messageNotif = `Your barangay clearance has been ${bClearanceIsVerifiedValue}. Please update your uploaded barangay clearance. Your barangay clearance has ${messages.join(', ')}.`;
      }
  
    const client_id = brgyNotif.client_id;
    const clientInfo = await ClientInfo.findOne({ _id: client_id });
    const username = clientInfo.username;
    const contactNo = clientInfo.contact;
    // Create a notification after updating creating barangay
    const notification = await ClientNotification.create({
        client_id,
        message: messageNotif,
        urlReact:`/Profile/Setting`
    });
      res.status(200).json({ message: 'Successfully updated.'})
      } catch (error) {
          res.status(400).json({ error: error.message })
      }
}

const adminUpdateNbiClient = async (req, res) => {
    const { nClearanceIsVerified, message } = req.body
  
    try {
        // Check for duplicate messages in the array
        const hasDuplicates = message.some((obj, index) => {
            if (obj.message.trim() === '') {
                throw new Error('Please enter a reason.');
            }
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

      await ClientNbi.updateOne({ _id: req.params.id }, { $unset: { message: 1 } })
      const nbi = await ClientNbi.findOneAndUpdate(
        { _id: req.params.id },
        {
            $push: { message },
            $set: { nClearanceIsVerified }
        },
        { new: true }
      )
      //notification
      const nbiNotif = await ClientNbi.findOne({ _id: req.params.id })
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
      
        const messages = await Promise.all(messageIds.map(async (msgId) => {
            const msg = await Reason.findOne({ _id: msgId });
            return msg.reason;
        }));
            messageNotif = `Your nbi clearance has been ${nClearanceIsVerifiedValue}. Please update your uploaded nbi clearance. Your nbi clearance has ${messages.join(', ')}.`;
      }
  
    const client_id = nbiNotif.client_id;
    const clientInfo = await ClientInfo.findOne({ _id: client_id });
    const username = clientInfo.username;
    const contactNo = clientInfo.contact;
    // Create a notification after updating creating barangay
    const notification = await ClientNotification.create({
        client_id,
        message: messageNotif,
        urlReact:`/Profile/Setting`
    });
        res.status(200).json({ message: 'Successfully updated.'})
      } catch (error) {
          res.status(400).json({ error: error.message })
      }
}

const reactivateAdminInfo = async(req, res) =>{
    const {username} = req.params 
    try{
        // await ClientInfo.updateOne({username:username}, { $unset: { message: 1 } })
        const clientInfo = await AdminInfo.findOneAndUpdate({username:username},
            {isDeleted:0})
        res.status(200).json({ message: 'Admin Reactivated.'})
    }
    catch(error){
        res.status(400).json({error:error.message})
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
const reactivateClientInfo = async(req, res) =>{
    const {username} = req.params 
    try{
        await ClientInfo.updateOne({username:username}, { $unset: { message: 1 } })
        const clientInfo = await ClientInfo.findOneAndUpdate({username:username},
            {isDeleted:0})
        res.status(200).json({ message: 'Client Reactivated.'})
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
//SKILLED AND CLIENT DEACT 
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
const adminGetAllClientDeact = async(req, res)=>{

    try{
        //this is to find skill for specific user
        //get all query
        const clientInfo = await ClientInfo.find({isDeleted: 1})
        .sort({updatedAt: -1})
        .populate({
            path: 'message.message',
            model: 'ReasonDeact',
            select: 'reason',
            options: { lean: true },
        })
        res.status(200).json(clientInfo)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

const adminGetAllAdminDeact = async(req, res)=>{

    try{
        //this is to find skill for specific user
        //get all query
        const adminInfo = await AdminInfo.find({isDeleted: 1})
        .sort({updatedAt: -1})
    
        res.status(200).json(adminInfo)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
//SKILLED EXPIRED
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

        const formattedSkillCert = certificate.map((clearance) => ({
            ...clearance.toObject(),
            validUntil: moment(clearance.validUntil).tz('Asia/Manila').format('MM-DD-YYYY')
        }));

        res.status(200).json(formattedSkillCert)
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
            bClearanceIsVerified: "expired", 
            isDeleted: 0}).sort({updatedAt: 1})
        .populate('skilled_id')

        const formattedSkilledBClearance = barangay.map((clearance) => ({
            ...clearance.toObject(),
            bClearanceExp: moment(clearance.bClearanceExp).tz('Asia/Manila').format('MM-DD-YYYY')
        }));
        res.status(200).json(formattedSkilledBClearance)
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
            nClearanceIsVerified: "expired", 
            isDeleted: 0}).sort({updatedAt: 1})
        .populate('skilled_id')

        const formattedSkilledNClearance = nbi.map((clearance) => ({
            ...clearance.toObject(),
            nClearanceExp: moment(clearance.nClearanceExp).tz('Asia/Manila').format('MM-DD-YYYY')
        }));
        res.status(200).json(formattedSkilledNClearance)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
//CLIENT EXPIRED
const adminGetAllClientBarangayDetailExpired = async(req, res)=>{
    const username = req.params.username;
    try{
        // Find skilled_id document based on username
        const clientIdDoc = await ClientInfo.findOne({ username: username });

        // Check if skilled_id exists for the given username
        if (!clientIdDoc) {
        return res.status(404).json({ error: 'Client not found' });
        }
        //get all query
        const barangay = await ClientBarangay.find({
            client_id: clientIdDoc._id,
            bClearanceIsVerified: "expired", 
            isDeleted: 0}).sort({updatedAt: 1})
        .populate('client_id')

        const formattedSkilledBClearance = barangay.map((clearance) => ({
            ...clearance.toObject(),
            bClearanceExp: moment(clearance.bClearanceExp).tz('Asia/Manila').format('MM-DD-YYYY')
        }));

        res.status(200).json(formattedSkilledBClearance)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
const adminGetAllClientNbiDetailExpired = async(req, res)=>{
    const username = req.params.username;
    try{
        // Find skilled_id document based on username
        const clientIdDoc = await ClientInfo.findOne({ username: username });

        // Check if skilled_id exists for the given username
        if (!clientIdDoc) {
        return res.status(404).json({ error: 'Client not found' });
        }
        //get all query
        const nbi = await ClientNbi.find({
            client_id: clientIdDoc._id,
            nClearanceIsVerified: "expired", 
            isDeleted: 0}).sort({updatedAt: 1})
        .populate('client_id')

        const formattedSkilledNClearance = nbi.map((clearance) => ({
            ...clearance.toObject(),
            nClearanceExp: moment(clearance.nClearanceExp).tz('Asia/Manila').format('MM-DD-YYYY')
        }));
        res.status(200).json(formattedSkilledNClearance)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//SKILLED DELETED
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

        const formattedSkillCert = certificate.map((clearance) => ({
            ...clearance.toObject(),
            validUntil: moment(clearance.validUntil).tz('Asia/Manila').format('MM-DD-YYYY')
        }));
        res.status(200).json(formattedSkillCert)
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

        const formattedSkilledBClearance = barangay.map((clearance) => ({
            ...clearance.toObject(),
            bClearanceExp: moment(clearance.bClearanceExp).tz('Asia/Manila').format('MM-DD-YYYY')
        }));
        res.status(200).json(formattedSkilledBClearance)
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

        const formattedSkilledNClearance = nbi.map((clearance) => ({
            ...clearance.toObject(),
            nClearanceExp: moment(clearance.nClearanceExp).tz('Asia/Manila').format('MM-DD-YYYY')
        }));
        res.status(200).json(formattedSkilledNClearance)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
//CLIENT DELETED
const adminGetAllClientBarangayDeleted= async(req, res)=>{
    const username = req.params.username;
    try{
        // Find skilled_id document based on username
        const clientIdDoc = await ClientInfo.findOne({ username: username });

        // Check if skilled_id exists for the given username
        if (!clientIdDoc) {
        return res.status(404).json({ error: 'Client not found' });
        }
        //get all query
        const barangay = await ClientBarangay.find({
            client_id: clientIdDoc._id,
            isDeleted: 1}).sort({updatedAt: 1})
        .populate('client_id')

        const formattedSkilledBClearance = barangay.map((clearance) => ({
            ...clearance.toObject(),
            bClearanceExp: moment(clearance.bClearanceExp).tz('Asia/Manila').format('MM-DD-YYYY')
        }));
        res.status(200).json(formattedSkilledBClearance)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
const adminGetAllClientNbiDeleted = async(req, res)=>{
    const username = req.params.username;
    try{
        // Find skilled_id document based on username
        const clientIdDoc = await ClientInfo.findOne({ username: username });

        // Check if skilled_id exists for the given username
        if (!clientIdDoc) {
        return res.status(404).json({ error: 'Client not found' });
        }
        //get all query
        const nbi = await ClientNbi.find({
            client_id: clientIdDoc._id,
            isDeleted: 1}).sort({updatedAt: 1})
        .populate('client_id')

        const formattedSkilledNClearance = nbi.map((clearance) => ({
            ...clearance.toObject(),
            nClearanceExp: moment(clearance.nClearanceExp).tz('Asia/Manila').format('MM-DD-YYYY')
        }));
        res.status(200).json(formattedSkilledNClearance)
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
    adminUpdateSkilledPass,
    adminDeleteSkilled,
    adminGetAllClient,
    adminGetOneClient,
    adminUpdateClient,
    adminUpdateClientPass,
    adminDeleteClient,
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
    adminGetAllBClearanceClientDetail,
    adminGetAllNClearanceClientDetail,
    adminUpdateExperience,
    adminUpdateCertificate,
    adminUpdateBarangay,
    adminUpdateNbi,
    adminUpdateBarangayClient,
    adminUpdateNbiClient,
    updateExpIsRead,
    adminGetAllAdminDeact,
    adminGetAllSkilledDeact,
    adminGetAllClientDeact,
    adminGetAllSkilledCertDetailExpired,
    adminGetAllSkilledBarangayDetailExpired,
    adminGetAllSkilledNbiDetailExpired,
    adminGetAllClientBarangayDetailExpired,
    adminGetAllClientNbiDetailExpired,
    adminGetAllSkilledExpDeleted,
    adminGetAllSkilledCertDeleted,
    adminGetAllSkilledBarangayDeleted,
    adminGetAllSkilledNbiDeleted,
    adminGetAllClientBarangayDeleted,
    adminGetAllClientNbiDeleted,
    adminGetAllClientBarangayDetail,
    adminGetAllClientNbiDetail,
    reactivateAdminInfo,
    reactivateSkilledInfo,
    reactivateClientInfo,
    adminEditSkilledBill,
    adminUpdateSkilledBill,
    adminUpdateSkilledAccount,
    adminUpdateSkilledAccountNot,
    adminEditSkilledAddress
}