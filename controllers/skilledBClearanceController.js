const SkilledBClearance = require('../models/skilledBClearance') //for CRUD of skill (admin)
const Notification = require('../models/adminNotification')
const SkilledInfo = require('../models/skilledInfo')
const AdminInfo = require('../models/adminInfo')
const moment = require('moment');
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
        //photo is required
        if (!req.file) {
            return res.status(400).json({error: 'Please upload a photo.'})
        }

        //check if less than date today
        const bClearanceExpMoment = moment.utc(req.body.bClearanceExp, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
        const validUntilDate = bClearanceExpMoment.toDate();
        
        if (validUntilDate < new Date()) {
            return res.status(400).json({ error: 'Your Barangay Clearance is outdated. Please submit a valid one.' });
        }
 
        // //search if existing
        const skilledBClearanceCheck = await SkilledBClearance.findOne({
            bClearanceExp:bClearanceExp,
            bClearanceIsVerified:{$in: ["false", "true", "pending", "expired"]},
            isDeleted: 0,
            skilled_id:skilled_id
        })
        if(skilledBClearanceCheck){
            return res.status(400).json({error: "Barangay Clearance already exists  to this user."})
        }

        //if there is already verified atleast one then it should not allow the user to upload again
        const bclearanceTrue = await SkilledBClearance.findOne({
            bClearanceIsVerified:{$in: ["false", "true", "pending"]},
            isDeleted: 0,
            skilled_id:skilled_id
        })
        if(bclearanceTrue){
            return res.status(400).json({error: "You have recently added Barangay Clearance. Please wait for the admin to check your upload. You can only add new Barangay Clearance if recently added is expired."})
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
            message: `${skilledUserName} added new barangay clearance.`,
            // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
            urlReact:`/viewSkilled/brgyClearance/${skilledUserName}`
        });
        res.status(200).json({ message: 'Successfully added.'})
    }
    catch(error){
        console.log(error)
        res.status(404).json({error: error.message})
    }
}

const getAllSkilledBClearance = async (req, res) => {
    try {
        const skilled_id = req.skilledInfo._id;
        const skilledBClearance = await SkilledBClearance.find({
            skilled_id,
            isDeleted: 0,
            bClearanceIsVerified: { $ne: "expired" }
        })
        .sort({ createdAt: -1 })
        .populate({
            path: 'message.message',
            model: 'Reason',
            select: 'reason',
            options: { lean: true }
        });
  
        var currentDate = new Date(); // date today
        await SkilledBClearance.updateMany(
            { bClearanceExp: { $lt: currentDate } },
            { $set: { bClearanceIsVerified: 'expired' } }
        );
  
        const formattedSkilledBClearance = skilledBClearance.map((clearance) => ({
            ...clearance.toObject(),
            bClearanceExp: moment(clearance.bClearanceExp).tz('Asia/Manila').format('MM-DD-YYYY')
        }));
  
        res.status(200).json(formattedSkilledBClearance);
    } catch (err) {
      return res.status(500).json({ messg: err.message });
    }
};

const getAllSkilledExpiredBClearance = async(req, res)=>{
    try{
        const skilled_id = req.skilledInfo._id
        const skilledBClearance = await SkilledBClearance
        .find({
            skilled_id,
            isDeleted: 0,
            bClearanceIsVerified:"expired"})
        .sort({createdAt:-1})

        //proper format of date
        const formattedSkilledBClearance = skilledBClearance.map((clearance) => ({
            ...clearance.toObject(),
            bClearanceExp: moment(clearance.bClearanceExp).tz('Asia/Manila').format('MM-DD-YYYY')
        }));
        res.status(200).json(formattedSkilledBClearance)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

const getOneSkilledBClearance = async (req, res) => {
    const { id } = req.params;

    // check if id is not existing
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid id.' });
    }

    // find query
    const skilledBClearance = await SkilledBClearance.findById({ _id: id }).populate({
        path: 'message.message',
        model: 'Reason',
        select: 'reason',
        options: { lean: true }
    });

    // check if not existing
    if (!skilledBClearance) {
        return res.status(404).json({ error: 'Barangay Clearance not found.' });
    }

    const formattedSkilledBClearance = {
        ...skilledBClearance.toObject(),
        bClearanceExp: moment(skilledBClearance.bClearanceExp).tz('Asia/Manila').format('MM-DD-YYYY')
    };

    res.status(200).json(formattedSkilledBClearance);
};

const updateSkilledBClearance  = async(req, res) =>{

    try{  
        const skilled_id = req.skilledInfo._id
        let skilledBClearance = await SkilledBClearance.findById(req.params.id)  
        
        //photo is required
        if (!req.file) {
            return res.status(400).json({error: 'Please upload a photo.'})
        }

        const trueBClearance = await SkilledBClearance.findOne({
            _id: req.params.id,
            bClearanceIsVerified: true,
        });

        if (trueBClearance) {
            return res.status(400).json({
                error: "You cannot update verified barangay clearance."
            });
        }
    
        //check if less than date today
        const bClearanceExpMoment = moment.utc(req.body.bClearanceExp, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
        const validUntilDate = bClearanceExpMoment.toDate();
        
        if (validUntilDate < new Date()) {
            return res.status(400).json({ error: 'Your Barangay Clearance is outdated. Please submit a valid one.' });
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
            message: []
        }
        // Check if the new data already exists, excluding the data corresponding to the parameter
        const existingBClearance = await SkilledBClearance.findOne({
            _id: { $ne: req.params.id },
            bClearanceExp: req.body.bClearanceExp, // Compare only the photo field for similarity
            bClearanceIsVerified:{$in: ["false", "true", "pending", "expired"]},
            isDeleted: 0,
            skilled_id:skilled_id 
        });
    
        if (existingBClearance) {
            return res.status(400).json({ error: 'Barangay Clearance already exists  to this user.' });
        }

        skilledBClearance = await SkilledBClearance.findByIdAndUpdate(req.params.id, 
            data, {new: true})

        //this is for the notification
        const skilledInfo = await SkilledInfo.findOne({ _id: skilled_id }); 
        const skilledUserName = skilledInfo.username;
    
        // Create a notification after successfully creating new skills
        const notification = await Notification.create({
            skilled_id,
            message: `${skilledUserName} updated barangay clearance.`,
            url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
            urlReact:`/viewSkilled/brgyClearance/${skilledUserName}`
        
        });

        res.json({ message: 'Successfully updated.'})
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
        {
            isDeleted:1,
            bClearanceIsVerified:"false"
        })
    
    //check if not existing
    if (!skilledBClearance){
        return res.status(404).json({error: 'Barangay Clearance not found.'})
    }
    res.status(200).json({ message: 'Successfully deleted.'})
}

module.exports = {
    createSkilledBClearance,
    getAllSkilledBClearance,
    getAllSkilledExpiredBClearance,
    getOneSkilledBClearance,
    updateSkilledBClearance,
    deleteSkilledBClearance
}