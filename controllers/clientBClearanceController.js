const ClientBClearance = require('../models/clientBClearance') //for CRUD of skill (admin)
const Notification = require('../models/adminNotification')
const ClientInfo = require('../models/clientInfo')
const AdminInfo = require('../models/adminInfo')
const moment = require('moment');
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
            return res.status(400).json({error: 'Please upload a photo.'})
        }

        //check if the date in the req.body is less than date today
        const bClearanceExpMoment = moment.utc(bClearanceExp, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
        const validUntilDate = bClearanceExpMoment.toDate();

        if (validUntilDate < new Date()) {
            return res.status(400).json({ error: 'Your NBI Clearance is outdated. Please submit a valid one.' });
        }

        //search if existing
        const clientBClearanceCheck = await ClientBClearance.findOne({
            bClearanceExp:bClearanceExp,
            bClearanceIsVerified:{$in: ["false", "true", "pending", "expired"]},
            isDeleted: 0,
            client_id:client_id
        })
        if(clientBClearanceCheck){
            return res.status(400).json({error: "Barangay Clearance already exists to this user."})
        }

        //if there is already verified atleast one then it should not allow the user to upload again
        const nclearanceTrue = await ClientBClearance.findOne({
            nClearanceIsVerified:{$in: ["false", "true", "pending"]},
            isDeleted: 0,
            client_id:client_id
        })
        if(nclearanceTrue){
            return res.status(400).json({error: "You have recently added Barangay Clearance. Please wait for the admin to check your upload. You can only add new Barangay Clearance if recently added is expired."})
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
        
        // Create a notification after successfully creating new skills
        const notification = await Notification.create({
            client_id,
            message: `${clientUserName} has added new barangay clearance.`,
            // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${clientBClearance._id}`,
            urlReact:`/Client/Information`
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
            bClearanceIsVerified: { $ne: "expired" }
        })
        .sort({createdAt:-1})
        .populate({
            path: 'message.message',
            model: 'Reason',
            select: 'reason',
            options: { lean: true },
        })
        var currentDate = new Date();//date today
        await ClientBClearance.updateMany({ bClearanceExp: {$lt:currentDate}}, 
            {$set: 
                { bClearanceIsVerified: "expired" } });
        
        const formattedSkilledBClearance = clientBClearance.map((clearance) => ({
            ...clearance.toObject(),
            bClearanceExp: moment(clearance.bClearanceExp).tz('Asia/Manila').format('MM-DD-YYYY')
        }));
        res.status(200).json(formattedSkilledBClearance)
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
            bClearanceIsVerified: "expired" })
        .sort({createdAt:-1})

        const formattedSkilledBClearance = clientBClearance.map((clearance) => ({
            ...clearance.toObject(),
            bClearanceExp: moment(clearance.bClearanceExp).tz('Asia/Manila').format('MM-DD-YYYY')
        }));

        res.status(200).json(formattedSkilledBClearance)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

const getOneClientBClearance = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

    //find query
    const clientBClearance = await ClientBClearance.findById({_id: id})

    //check if not existing
    if (!clientBClearance){
        return res.status(404).json({error: 'Barangay Clearance not found.'})
    }

    const formattedSkilledBClearance = {
        ...clientBClearance.toObject(),
        bClearanceExp: moment(clientBClearance.bClearanceExp).tz('Asia/Manila').format('MM-DD-YYYY')
    };

    res.status(200).json(formattedSkilledBClearance)   

}

const updateClientBClearance  = async(req, res) =>{

    try{  
        const client_id = req.clientInfo._id
        let clientBClearance = await ClientBClearance.findById(req.params.id)  
        if (!req.file) {
            return res.status(400).json({error: 'Please upload a photo.'})
        }

        const trueBClearance = await ClientBClearance.findOne({
            _id: req.params.id,
            bClearanceIsVerified: "true",
        });

        if (trueBClearance) {
            return res.status(400).json({
                error: "You cannot update verified barangay clearance."
            });
        }

        //check if the date in the req.body is less than date today
        const bClearanceExpMoment = moment.utc(req.body.bClearanceExp, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
        const validUntilDate = bClearanceExpMoment.toDate();

        if (validUntilDate < new Date()) {
            return res.status(400).json({ error: 'Your NBI Clearance is outdated. Please submit a valid one.' });
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

        // Check if the new data already exists, excluding the data corresponding to the parameter
        const existingBClearance = await ClientBClearance.findOne({
            _id: { $ne: req.params.id },
            bClearanceExp: req.body.bClearanceExp, // Compare only the photo field for similarity
            bClearanceIsVerified:{$in: ["false", "true", "pending", "expired"]},
            isDeleted: 0,
            client_id:client_id 
        });
    
        if (existingBClearance) {
            return res.status(400).json({ error: 'Barangay Clearance already exists  to this user.' });
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
            urlReact:`/Client/Information`
        
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
        {
            isDeleted:1,
            bClearanceIsVerified: "false"
        })
    
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