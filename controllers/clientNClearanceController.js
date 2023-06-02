const ClientNClearance = require('../models/clientNClearance') //for CRUD of skill (admin)
const ClientInfo = require('../models/clientInfo')
const Notification = require('../models/adminNotification')
const cloudinary = require("../utils/cloudinary");
const mongoose = require('mongoose')

const createClientNClearance = async(req, res)=>{

    try{
        const {nClearanceExp} = req.body
        const client_id = req.clientInfo._id
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
            return res.status(400).json({ error: 'Your nbi clearance is outdated. Please submit a valid one.' });
        }

        //search if existing
        const clientNClearanceCheck = await ClientNClearance.findOne({
            nClearanceExp:nClearanceExp,
            nClearanceIsVerified:{$in: ["false", "true", "pending"]},
            isExpired:{$in: [0, 1]},
            isDeleted: 0,
            client_id:client_id
        })

        if(clientNClearanceCheck){
            return res.status(400).json({error: "NBI Clearance already exists."})
        }
        //create new skill
        let uploadedPhotos = [];

        // Loop through uploaded files and upload to cloudinary
        for (let file of req.files) {
            let result = await cloudinary.uploader.upload(file.path);
            uploadedPhotos.push({ url: result.secure_url, public_id: result.public_id });
        }

        // Create new clientExp object
        let clientNClearance = new ClientNClearance({
            nClearanceExp,
            client_id,
            photo: uploadedPhotos,
            cloudinary_id: uploadedPhotos[0].public_id // Use the public ID of the first photo in the array
        });

        await clientNClearance.save()

         // Get the name of the client user
         const clientInfo = await ClientInfo.findOne({ _id: client_id });
         const clientUserName = clientInfo.username;
 
        // Create a notification after successfully creating new nbi
        const notification = await Notification.create({
            client_id,
            message: `${clientUserName} has added new nbi clearance.`,
        //  url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${clientNClearance._id}`,
            urlReact:`/temporary/${clientUserName}`
        });

        res.status(200).json({ message: 'Successfully added.'})
    }
    catch(error){
        console.log(error)
        res.status(404).json({error: error.message})
    }
}

const getAllClientNClearance = async(req, res)=>{
    try{
        const client_id = req.clientInfo._id
        const clientNClearance = await ClientNClearance
        .find({client_id,
            isDeleted: 0, 
            isExpired:{$ne: 1}})
        .sort({updatedAt:-1})
        // .populate({
        //     path: 'message.message',
        //     model: 'Reason',
        //     select: 'reason',
        //     options: { lean: true },
        // })
        var currentDate = new Date();//date today
        await ClientNClearance.updateMany({ nClearanceExp: {$lt:currentDate} }, 
            {$set: 
                { nClearanceIsVerified: "false", isExpired: 1 } });
        
        res.status(200).json(clientNClearance)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

const getAllExpiredNClearance = async(req, res)=>{
    try{
        const client_id = req.clientInfo._id
        const clientNClearance = await ClientNClearance
        .find({client_id,
            isDeleted: 0, 
            isExpired: 1})
        .sort({createdAt:-1})
        res.status(200).json(clientNClearance)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

const getOneClientNClearance = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const clientNClearance = await ClientNClearance.findById({_id: id})
    // .populate({
    //     path: 'message.message',
    //     model: 'Reason',
    //     select: 'reason',
    //     options: { lean: true },
    // })

    //check if not existing
    if (!clientNClearance){
        return res.status(404).json({error: 'NBI Clearance not found'})
    }

    res.status(200).json(clientNClearance)   

}

const updateClientNClearance  = async(req, res) =>{

    try{ 
        const client_id = req.clientInfo._id
        let clientNClearance = await ClientNClearance.findById(req.params.id)  
        
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

        const trueNbi = await ClientNClearance.findOne({
            _id: req.params.id,
            nClearanceIsVerified: "true",
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
            return res.status(400).json({ error: 'Your nbi clearance is outdated. Please submit a valid one.' });
        }
        // check if certificate already exists with the same categorySkill, title, issuedOn, and validUntil
        const existingNClearance = await ClientNClearance.findOne({
            nClearanceExp: req.body.nClearanceExp || clientNClearance.nClearanceExp,
            nClearanceIsVerified:{$in: ["false", "true"]},
            isDeleted:0,
            client_id:client_id
        });

        if (existingNClearance) {
            return res.status(400).json({
                message: "This nbi clearance already exists."
            });
        }

        // remove the recent images
        await Promise.all(
            clientNClearance.photo.map(async (nbiPhoto) => {
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
            nClearanceExp: req.body.nClearanceExp || clientNClearance.nClearanceExp,
            photo: uploadedPhotos.length > 0 ? uploadedPhotos : clientNClearance.photo,
            cloudinary_id: uploadedPhotos.length > 0 ? uploadedPhotos[0].public_id : clientNClearance.cloudinary_id,
            nClearanceIsVerified: "pending",
            message: []
        };


        clientNClearance = await ClientNClearance.findByIdAndUpdate(req.params.id, 
            data, {new: true})

            //this is for the notification
        const clientInfo = await ClientInfo.findOne({ _id: client_id }); 
        const clientUserName = clientInfo.username;
    
        const notification = await Notification.create({
            client_id,
            message: `${clientUserName} updated nbi clerance.`,
            // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${clientBClearance._id}`,
            urlReact:`/temporary/${clientUserName}`
        });

        res.json({ message: 'Successfully updated.'})
    }
    catch(error){
        res.status(404).json({error:error.message})
    }
}

const deleteClientNClearance = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const clientNClearance = await ClientNClearance.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!clientNClearance){
        return res.status(404).json({error: 'Barangay Clearance not found'})
    }

    res.status(200).json({ message: 'Successfully deleted.'})

}

module.exports = {
    createClientNClearance,
    getAllClientNClearance,
    getAllExpiredNClearance, 
    getOneClientNClearance,
    updateClientNClearance,
    deleteClientNClearance
}