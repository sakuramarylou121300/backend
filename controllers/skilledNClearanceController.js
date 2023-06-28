const SkilledNClearance = require('../models/skilledNClearance') //for CRUD of skill (admin)
const SkilledInfo = require('../models/skilledInfo')
const Notification = require('../models/adminNotification')
const cloudinary = require("../utils/cloudinary");
const mongoose = require('mongoose')

const createSkilledNClearance = async(req, res)=>{

    try{
        const {nClearanceExp} = req.body
        const skilled_id = req.skilledInfo._id
        let emptyFields = []

        if(!nClearanceExp){
            emptyFields.push('nClearanceExp')
        }

        //send message if there is an empty fields
        if(emptyFields.length >0){
            return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
        }

        //check if the photo field is empty
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({error: 'Please upload a photo either local or international NBI clearance.'});
        }

        //check if the photo is greater than 2
        if (!req.files || req.files.length >=3) {
            return res.status(400).json({error: 'Only two photo is allowed either local or international NBI clearance.'});
        }

        // Check if file type is supported
        const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        for (let i = 0; i < req.files.length; i++) {
            if (!supportedTypes.includes(req.files[i].mimetype)) {
                return res.status(400).json({ error: `File type not supported. Please upload an image in PNG, JPEG, or JPG format. File ${i + 1} is not supported.` });
            }
        }

        // Convert the validUntil date string to a Date object
        const validUntilDate = new Date(nClearanceExp);
        // Check if the validUntil date is less than today's date
        if (validUntilDate < new Date()) {
            return res.status(400).json({ error: 'Your NBI clearance is outdated. Please submit a valid one.' });
        }

        //search if existing
        const skilledNClearanceCheck = await SkilledNClearance.findOne({
            nClearanceExp:nClearanceExp,
            nClearanceIsVerified:{$in: ["false", "true", "pending"]},
            isExpired:{$in: [0, 1]},
            isDeleted: 0,
            skilled_id:skilled_id
        })

        if(skilledNClearanceCheck){
            return res.status(400).json({error: "NBI Clearance already exists to this user."})
        }
        //create new skill
        let uploadedPhotos = [];

        // Loop through uploaded files and upload to cloudinary
        for (let file of req.files) {
            let result = await cloudinary.uploader.upload(file.path);
            uploadedPhotos.push({ url: result.secure_url, public_id: result.public_id });
        }

        // Create new SkilledExp object
        let skilledNClearance = new SkilledNClearance({
            nClearanceExp,
            skilled_id,
            photo: uploadedPhotos,
            cloudinary_id: uploadedPhotos[0].public_id // Use the public ID of the first photo in the array
        });

        await skilledNClearance.save()

         // Get the name of the skilled user
         const skilledInfo = await SkilledInfo.findOne({ _id: skilled_id });
         const skilledUserName = skilledInfo.username;
 
         // Create a notification after successfully creating new nbi
         const notification = await Notification.create({
             skilled_id,
             message: `${skilledUserName} added new NBI Clearance.`,
            //  url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledNClearance._id}`,
             urlReact:`/viewSkilled/nbiClearance/${skilledUserName}`
         });

        res.status(200).json({ message: 'Successfully added.'})
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

const getAllSkilledNClearance = async(req, res)=>{
    try{
        const skilled_id = req.skilledInfo._id
        const skilledNClearance = await SkilledNClearance
        .find({skilled_id,
            isDeleted: 0, 
            isExpired:{$ne: 1}})
        .sort({createdAt:-1})
        .populate({
            path: 'message.message',
            model: 'Reason',
            select: 'reason',
            options: { lean: true },
        })
        var currentDate = new Date();//date today
        await SkilledNClearance.updateMany({ nClearanceExp: {$lt:currentDate} }, 
            {$set: 
                { nClearanceIsVerified: "false", isExpired: 1 } });
        
        res.status(200).json(skilledNClearance)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

const getAllExpiredNClearance = async(req, res)=>{
    try{
        const skilled_id = req.skilledInfo._id
        const skilledNClearance = await SkilledNClearance
        .find({skilled_id,
            isDeleted: 0, 
            isExpired: 1})
        .sort({createdAt:-1})
        res.status(200).json(skilledNClearance)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

const getOneSkilledNClearance = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

    //find query
    const skilledNClearance = await SkilledNClearance.findById({_id: id})
    .populate({
        path: 'message.message',
        model: 'Reason',
        select: 'reason',
        options: { lean: true },
    })

    //check if not existing
    if (!skilledNClearance){
        return res.status(404).json({error: 'NBI Clearance not found.'})
    }

    res.status(200).json(skilledNClearance)   

}

const updateSkilledNClearance  = async(req, res) =>{

    try{ 
        const skilled_id = req.skilledInfo._id
        let skilledNClearance = await SkilledNClearance.findById(req.params.id)  
        
        //check if the photo field is empty
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({error: 'Please upload a photo either local or international NBI clearance.'});
        }

        //check if the photo is greater than 2
        if (!req.files || req.files.length >=3) {
            return res.status(400).json({error: 'Only two photo is allowed either local or international NBI clearance.'});
        }

        // Check if file type is supported
        const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        for (let i = 0; i < req.files.length; i++) {
            if (!supportedTypes.includes(req.files[i].mimetype)) {
                return res.status(400).json({ error: `File type not supported. Please upload an image in PNG, JPEG, or JPG format. File ${i + 1} is not supported.` });
            }
        }

        const trueNbi = await SkilledNClearance.findOne({
            _id: req.params.id,
            nClearanceIsVerified: true,
        });

        if (trueNbi) {
            return res.status(400).json({
                message: "You cannot update verified NBI Clearance."
            });
        }

        // Convert the validUntil date string to a Date object
        const validUntilDate = new Date(req.body.nClearanceExp);
        // Check if the validUntil date is less than today's date
        if (validUntilDate < new Date()) {
            return res.status(400).json({ error: 'Your NBI Clearance is outdated. Please submit a valid one.' });
        }

        // remove the recent images
        await Promise.all(
            skilledNClearance.photo.map(async (nbiPhoto) => {
            await cloudinary.uploader.destroy(nbiPhoto.public_id);
            })
        );
  
        // upload the new images
        let uploadedPhotos = await Promise.all(
            req.files.map(async (file) => {
            let result = await cloudinary.uploader.upload(file.path);
            return { url: result.secure_url, public_id: result.public_id };
            })
        );
  
        let data = {
            nClearanceExp: req.body.nClearanceExp || skilledNClearance.nClearanceExp,
            photo: uploadedPhotos.length > 0 ? uploadedPhotos : skilledNClearance.photo,
            cloudinary_id: uploadedPhotos.length > 0 ? uploadedPhotos[0].public_id : skilledNClearance.cloudinary_id,
            nClearanceIsVerified: "pending",
            message: []
        };


        skilledNClearance = await SkilledNClearance.findByIdAndUpdate(req.params.id, 
            data, {new: true})

            //this is for the notification
        const skilledInfo = await SkilledInfo.findOne({ _id: skilled_id }); 
        const skilledUserName = skilledInfo.username;
    
        const notification = await Notification.create({
            skilled_id,
            message: `${skilledUserName} updated NBI clearance.`,
            // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
            urlReact:`/viewSkilled/nbiClearance/${skilledUserName}`
        });

        res.json({ message: 'Successfully updated.'})
    }
    catch(error){
        res.status(404).json({error:error.message})
    }
}

const deleteSkilledNClearance = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const skilledNClearance = await SkilledNClearance.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!skilledNClearance){
        return res.status(404).json({error: 'NBI clearance not found'})
    }

    res.status(200).json({ message: 'Successfully deleted.'})

}

module.exports = {
    createSkilledNClearance,
    getAllSkilledNClearance,
    getAllExpiredNClearance, 
    getOneSkilledNClearance,
    updateSkilledNClearance,
    deleteSkilledNClearance
}