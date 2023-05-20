const SkilledBClearance = require('../models/skilledBClearance') //for CRUD of skill (admin)
const Notification = require('../models/adminNotification')
const SkilledInfo = require('../models/skilledInfo')
const AdminInfo = require('../models/adminInfo')
const cloudinary = require("../utils/cloudinary")
const mongoose = require('mongoose') 
 
const createSkilledBClearance = async(req, res)=>{

    try{
        const {bClearanceExp} = req.body
        const skilled_id = req.skilledInfo._id
        //check empty fields
        let emptyFields = []

        if(!bClearanceExp){
            emptyFields.push('bClearanceExp')
        }

        //send message if there is an empty fields
        if(emptyFields.length >0){
            return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
        }

        if (!req.file) {
            return res.status(400).json({error: 'Please upload your barangay clearance photo.'})
        }

        // Check if file type is supported
        const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!supportedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({error: 'File type not supported. Please upload an image in PNG, JPEG, or JPG format.'})
        }

        // Convert the validUntil date string to a Date object
        const validUntilDate = new Date(bClearanceExp);
        // Check if the validUntil date is less than today's date
        if (validUntilDate < new Date()) {
            return res.status(400).json({ error: 'Your barangay clearance is outdated. Please submit a valid one.' });
        }

        //search if existing
        const skilledBClearanceCheck = await SkilledBClearance.findOne({
            bClearanceExp:bClearanceExp,
            bClearanceIsVerified:{$in: ["false", "true", "pending"]},
            isExpired:{$in: [0, 1]},
            isDeleted: 0,
            skilled_id:skilled_id
        })
        if(skilledBClearanceCheck){
            return res.status(400).json({error: "Barangay Clearance already exists."})
        }
        result = await cloudinary.uploader.upload(req.file.path)
        let skilledBClearance = new SkilledBClearance({
            bClearanceExp,          
            photo: result.secure_url,     
            cloudinary_id: result.public_id,
            skilled_id
        })
        await skilledBClearance.save()

        // Get the name of the skilled user
        const skilledInfo = await SkilledInfo.findOne({ _id: skilled_id });
        const skilledUserName = skilledInfo.username;

        const adminInfos = await AdminInfo.find({}).populate({
            path: 'roleCapabality',
            match: { isDeleted: 0 }
        });
          
        const adminsWithAccess = adminInfos.filter(adminInfo =>
            adminInfo.roleCapabality.some(capability => capability.capability_id.toString() === "63da861285bb5180f0eabbb9")
        );
          
        const contactNumbers = adminsWithAccess.map(admin => admin.contact);
        console.log(contactNumbers)

        // Iterate over contactNumbers and send messages
        for (const phoneNumber of contactNumbers) {
                console.log(`Message sent to ${phoneNumber}`);
        }
        
        // Create a notification after successfully creating new skills
        const notification = await Notification.create({
            skilled_id,
            message: `${skilledUserName} has added new barangay clearance.`,
            // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
            urlReact:`/viewSkilled/brgyClearance/${skilledUserName}`
        });
        res.status(200).json(skilledBClearance)
    }
    catch(error){
        console.log(error)
        res.status(404).json({error: error.message})
    }
}

const getAllSkilledBClearance = async(req, res)=>{
    try{
        const skilled_id = req.skilledInfo._id
        const skilledBClearance = await SkilledBClearance
        .find({
            skilled_id,
            isDeleted: 0,
            isExpired:{$ne: 1}})
        .sort({updatedAt:-1})
        var currentDate = new Date();//date today
        await SkilledBClearance.updateMany({ bClearanceExp: {$lt:currentDate}}, 
            {$set: 
                { bClearanceIsVerified: "false", isExpired: 1 } });
        
        res.status(200).json(skilledBClearance)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

const getAllSkilledExpiredBClearance = async(req, res)=>{
    try{
        const skilled_id = req.skilledInfo._id
        const skilledBClearance = await SkilledBClearance
        .find({
            skilled_id,
            isDeleted: 0,
            isExpired:1})
        .sort({createdAt:-1})
        res.status(200).json(skilledBClearance)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

const getOneSkilledBClearance = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const skilledBClearance = await SkilledBClearance.findById({_id: id})

    //check if not existing
    if (!skilledBClearance){
        return res.status(404).json({error: 'Barangay Clearance not found'})
    }

    res.status(200).json(skilledBClearance)   

}

const updateSkilledBClearance  = async(req, res) =>{

    try{  
        const skilled_id = req.skilledInfo._id
        let skilledBClearance = await SkilledBClearance.findById(req.params.id)  
        if (!req.file) {
            return res.status(400).json({error: 'Please upload your barangay clearance photo.'})
        }
        const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!supportedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({error: 'File type not supported. Please upload an image in PNG, JPEG, or JPG format.'})
        }
        const trueBClearance = await SkilledBClearance.findOne({
            _id: req.params.id,
            bClearanceIsVerified: true,
        });

        if (trueBClearance) {
            return res.status(400).json({
                message: "You cannot update verified barangay clearance."
            });
        }
        // Convert the validUntil date string to a Date object
        const validUntilDate = new Date(req.body.bClearanceExp);

        // Check if the validUntil date is less than today's date
        if (validUntilDate < new Date()) {
            return res.status(400).json({ error: 'Your barangay clearance is outdated. Please submit a valid one.' });
        }
        // check if certificate already exists with the same categorySkill, title, issuedOn, and validUntil
        const existingBClearance = await SkilledBClearance.findOne({
            bClearanceExp: req.body.bClearanceExp || skilledBClearance.bClearanceExp,
            bClearanceIsVerified:{$in: ["false", "true"]},
            isDeleted:0,
            skilled_id:skilled_id
        });

        if (existingBClearance) {
            return res.status(400).json({
                message: "This barangay clearance already exists."
            });
        }

        //remove the recent image
        await cloudinary.uploader.destroy(skilledBClearance.cloudinary_id)
        //upload the new image
        let result
        if(req.file){
            result = await cloudinary.uploader.upload(req.file.path)
        }
        const data = {
            bClearanceExp: req.body.bClearanceExp || skilledBClearance.bClearanceExp,
            photo: result?.secure_url || skilledBClearance.photo,
            cloudinary_id: result?.public_id || skilledBClearance.cloudinary_id,
            bClearanceIsVerified: "pending",
            message: ""
        }

        skilledBClearance = await SkilledBClearance.findByIdAndUpdate(req.params.id, 
            data, {new: true})

        //this is for the notification
        const skilledInfo = await SkilledInfo.findOne({ _id: skilled_id }); 
        const skilledUserName = skilledInfo.username;
    
        // Create a notification after successfully creating new skills
        const notification = await Notification.create({
            skilled_id,
            message: `${skilledUserName} updated barangay clerance.`,
            url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
            urlReact:`/viewSkilled/brgyClearance/${skilledUserName}`
        
        });
        console.log(notification)

        res.json(skilledBClearance)
    }catch(error){
        res.status(404).json({error:error.message})
    }
    
}

const deleteSkilledBClearance = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const skilledBClearance = await SkilledBClearance.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!skilledBClearance){
        return res.status(404).json({error: 'Barangay Clearance not found'})
    }
    res.status(200).json(skilledBClearance)
}

module.exports = {
    createSkilledBClearance,
    getAllSkilledBClearance,
    getAllSkilledExpiredBClearance,
    getOneSkilledBClearance,
    updateSkilledBClearance,
    deleteSkilledBClearance
}