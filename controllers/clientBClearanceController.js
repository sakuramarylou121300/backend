const ClientBClearance = require('../models/clientBClearance') //for CRUD of skill (admin)
const Notification = require('../models/adminNotification')
const ClientInfo = require('../models/clientInfo')
const AdminInfo = require('../models/adminInfo')
const cloudinary = require("../utils/cloudinary")
const mongoose = require('mongoose') 
 
const createClientBClearance = async(req, res)=>{

    try{
        const {bClearanceExp} = req.body
        const client_id = req.clientInfo._id
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
        const clientBClearanceCheck = await ClientBClearance.findOne({
            bClearanceExp:bClearanceExp,
            bClearanceIsVerified:{$in: ["false", "true", "pending"]},
            isExpired:{$in: [0, 1]},
            isDeleted: 0,
            client_id:client_id
        })
        if(clientBClearanceCheck){
            return res.status(400).json({error: "Barangay Clearance already exists."})
        }
        result = await cloudinary.uploader.upload(req.file.path)
        let clientBClearance = new ClientBClearance({
            bClearanceExp,          
            photo: result.secure_url,     
            cloudinary_id: result.public_id,
            client_id
        })
        await clientBClearance.save()

        // Get the name of the client user
        const clientInfo = await ClientInfo.findOne({ _id: client_id });
        const clientUserName = clientInfo.username;

        // const adminInfos = await AdminInfo.find({}).populate({
        //     path: 'roleCapabality',
        //     match: { isDeleted: 0 }
        // });
          
        // const adminsWithAccess = adminInfos.filter(adminInfo =>
        //     adminInfo.roleCapabality.some(capability => capability.capability_id.toString() === "63da861285bb5180f0eabbb9")
        // );
          
        // const contactNumbers = adminsWithAccess.map(admin => admin.contact);
        // console.log(contactNumbers)

        // // Iterate over contactNumbers and send messages
        // for (const phoneNumber of contactNumbers) {
        //         console.log(`Message sent to ${phoneNumber}`);
        // }
        
        // Create a notification after successfully creating new skills
        const notification = await Notification.create({
            client_id,
            message: `${clientUserName} has added new barangay clearance.`,
            // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${clientBClearance._id}`,
            urlReact:`/temporary/${clientUserName}`
        });
        res.status(200).json({ message: 'Successfully added.'})
    }
    catch(error){
        console.log(error)
        res.status(404).json({error: error.message})
    }
}

const getAllClientBClearance = async(req, res)=>{
    try{
        const client_id = req.clientInfo._id
        const clientBClearance = await ClientBClearance
        .find({
            client_id,
            isDeleted: 0,
            isExpired:{$ne: 1}})
        .sort({updatedAt:-1})
        .populate({
            path: 'message.message',
            model: 'Reason',
            select: 'reason',
            options: { lean: true },
        })
        var currentDate = new Date();//date today
        await ClientBClearance.updateMany({ bClearanceExp: {$lt:currentDate}}, 
            {$set: 
                { bClearanceIsVerified: "false", isExpired: 1 } });
        
        res.status(200).json(clientBClearance)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

const getAllClientExpiredBClearance = async(req, res)=>{
    try{
        const client_id = req.clientInfo._id
        const clientBClearance = await ClientBClearance
        .find({
            client_id,
            isDeleted: 0,
            isExpired:1})
        .sort({createdAt:-1})
        res.status(200).json(clientBClearance)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

const getOneClientBClearance = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const clientBClearance = await ClientBClearance.findById({_id: id})
    // .populate({
    //     path: 'message.message',
    //     model: 'Reason',
    //     select: 'reason',
    //     options: { lean: true },
    // })

    //check if not existing
    if (!clientBClearance){
        return res.status(404).json({error: 'Barangay Clearance not found'})
    }

    res.status(200).json(clientBClearance)   

}

const updateClientBClearance  = async(req, res) =>{

    try{  
        const client_id = req.clientInfo._id
        let clientBClearance = await ClientBClearance.findById(req.params.id)  
        if (!req.file) {
            return res.status(400).json({error: 'Please upload your barangay clearance photo.'})
        }
        const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!supportedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({error: 'File type not supported. Please upload an image in PNG, JPEG, or JPG format.'})
        }
        const trueBClearance = await ClientBClearance.findOne({
            _id: req.params.id,
            bClearanceIsVerified: "true",
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
        const existingBClearance = await ClientBClearance.findOne({
            bClearanceExp: req.body.bClearanceExp || clientBClearance.bClearanceExp,
            bClearanceIsVerified:{$in: ["false", "true"]},
            isDeleted:0,
            client_id:client_id
        });

        if (existingBClearance) {
            return res.status(400).json({
                message: "This barangay clearance already exists."
            });
        }

        //remove the recent image
        await cloudinary.uploader.destroy(clientBClearance.cloudinary_id)
        //upload the new image
        let result
        if(req.file){
            result = await cloudinary.uploader.upload(req.file.path)
        }
        const data = {
            bClearanceExp: req.body.bClearanceExp || clientBClearance.bClearanceExp,
            photo: result?.secure_url || clientBClearance.photo,
            cloudinary_id: result?.public_id || clientBClearance.cloudinary_id,
            bClearanceIsVerified: "pending",
            message: []
        }

        clientBClearance = await ClientBClearance.findByIdAndUpdate(req.params.id, 
            data, {new: true})

        //this is for the notification
        const clientInfo = await ClientInfo.findOne({ _id: client_id }); 
        const clientUserName = clientInfo.username;
    
        // Create a notification after successfully creating new skills
        const notification = await Notification.create({
            client_id,
            message: `${clientUserName} updated barangay clerance.`,
            url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${clientBClearance._id}`,
            urlReact:`/temporary/${clientUserName}`
        
        });

        res.json({ message: 'Successfully updated.'})
    }catch(error){
        res.status(404).json({error:error.message})
    }
    
}

const deleteClientBClearance = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const clientBClearance = await ClientBClearance.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!clientBClearance){
        return res.status(404).json({error: 'Barangay Clearance not found'})
    }
    res.status(200).json({ message: 'Successfully deleted.'})
}

module.exports = {
    createClientBClearance,
    getAllClientBClearance,
    getAllClientExpiredBClearance,
    getOneClientBClearance,
    updateClientBClearance,
    deleteClientBClearance
}