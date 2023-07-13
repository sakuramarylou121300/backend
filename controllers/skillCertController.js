const Certificate = require('../models/skillCert')
const AdminSkill = require('../models/adminSkill') 
const Title = require('../models/skillTitle')  
const Skill = require('../models/skill')
const Notification = require('../models/adminNotification')
const SkilledInfo = require('../models/skilledInfo')
const mongoose = require('mongoose')
const cloudinary = require("../utils/cloudinary"); 
const moment = require('moment');
const upload = require("../utils/multer");
const multer = require('multer')
const path = require('path')

const createCertificate = async(req, res)=>{
    const {categorySkill,
        title,
        validUntil
    } = req.body
    
    //check empty fields
    let emptyFields = []
    if(!categorySkill){
        emptyFields.push('categorySkill')
    }
    if(!title){
        emptyFields.push('title')
    }
    if(!validUntil){
        emptyFields.push('validUntil')
    }

    //send message if there is an empty fields
    if(emptyFields.length >0){
        return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
    }
    
    if (!req.file) {
        return res.status(400).json({error: 'Please upload a photo.'})
    }

    //check if the date in the req.body is less than date today
    const skillCertMoment = moment.utc(validUntil, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
    const validUntilDate = skillCertMoment.toDate();
    
    if (validUntilDate < new Date()) {
        return res.status(400).json({ error: 'Your NBI Clearance is outdated. Please submit a valid one.' });
    }
    

    try{
        //this is to assign the job to a specific client user, get id from clientInfo
        const skilled_id = req.skilledInfo._id

        //if existing
        const certCheck = await Certificate.findOne({
            categorySkill:categorySkill,
            title:title,
            validUntil: validUntil,
            skilled_id:skilled_id,
            skillIsVerified:{$in: ["pending", "false", "true"]},
            isExpired: {$in: [0, 1]},
            isDeleted: 0
        })
        
        if(certCheck){
            return res.status(400).json({error: "Skill Certificate already exists to this user."})
        }
        
        if (categorySkill === "Select") {
            res.status(400).send({ error: "Please select skill." });
            return;
        }

        result = await cloudinary.uploader.upload(req.file.path)
        let certificate = new Certificate({
            categorySkill,
            title,
            validUntil,
            photo: result.secure_url,     
            cloudinary_id: result.public_id,
            skilled_id
        })
        await certificate.save()

        //this is for the notification
        const skilledInfo = await SkilledInfo.findOne({ _id: skilled_id }); 
        const skilledUserName = skilledInfo.username;
    
        // Create a notification after successfully creating new skills
        const notification = await Notification.create({
            skilled_id,
            message: `${skilledUserName} added skill certificate.`,
            // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
            urlReact:`/viewSkilledCertificate/${skilledUserName}`
        
        });

        res.status(200).json({ message: 'Successfully added.'})
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

const getAllCertificate = async(req, res)=>{

    try{
        //this is to find skill for specific user
        const skilled_id = req.skilledInfo._id
        //get all query
        const certificate = await Certificate
        .find({skilled_id,  
            isDeleted: 0, 
            isExpired:{$ne: 1},
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

//redirect depending on the skill
const getAllCertSkill = async(req, res)=>{ 

    try{
        //this is to find contact for specific user
        // const categorySkill = req.params.categorySkill
        const skill = req.params.skill
        const skilled_id = req.skilledInfo._id

        // Find skilled_id document based on username
        const skillIdDoc = await AdminSkill.findOne({ 
            skill: skill});

        // Check if skilled_id exists for the given username
        if (!skillIdDoc) {
        return res.status(404).json({ error: 'Skill not found in Skilled Worker' });
        }

        const skillCert = await Certificate
        .find({
            skilled_id, 
            categorySkill: skillIdDoc._id,
            isDeleted: 0,
            isExpired:{$ne: 1},})
        .populate('categorySkill')
        .populate('skilled_id')
        .populate({
            path: 'message.message',
            model: 'Reason',
            select: 'reason',
            options: { lean: true },
        })
        .sort({createdAt: -1})

        var currentDate = new Date();//date today
        await Certificate.updateMany({ validUntil: {$lt:currentDate} }, 
            {$set: 
                { skillIsVerified: "false", isExpired: 1 } });

        const formattedCert = skillCert.map((clearance) => ({
            ...clearance.toObject(),
            validUntil: moment(clearance.validUntil).tz('Asia/Manila').format('MM-DD-YYYY')
        }));

        res.status(200).json(formattedCert)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
} 

const getAllExpiredCert= async(req, res)=>{

    try{
        //this is to find skill for specific user
        const skilled_id = req.skilledInfo._id
        //get all query
        const certificate = await Certificate
        .find({skilled_id,
            isDeleted: 0,
            isExpired: 1})
        .sort({createdAt: -1})
        .populate('skilled_id')

        const formattedCert = certificate.map((clearance) => ({
            ...clearance.toObject(),
            validUntil: moment(clearance.validUntil).tz('Asia/Manila').format('MM-DD-YYYY')
        }));

        res.status(200).json(formattedCert)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

const getOneCertificate = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

    //find query
    const certificate = await Certificate.findById({_id: id})
    .populate({
        path: 'message.message',
        model: 'Reason',
        select: 'reason',
        options: { lean: true },
    })
    .populate('categorySkill')

    //check if not existing
    if (!certificate){
        return res.status(404).json({error: 'Skill Certificate not found.'})
    }

    res.status(200).json(certificate)   

}

const updateCertificate = async(req,res)=>{

    try{
        const skilled_id = req.skilledInfo._id
        let certificate = await Certificate.findById(req.params.id)
        if (!req.file) {
            return res.status(400).json({error: 'Please upload a photo.'})
        }
        const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!supportedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({error: 'File type not supported. Please upload an image in PNG, JPEG, or JPG format.'})
        }

        if (req.body.categorySkill === "Select") {
            res.status(400).send({ error: "Please enter skill." });
            return;
        }

        const trueCertificate = await Certificate.findOne({
                _id: req.params.id,
                skillIsVerified: "true",
        });
    
        if (trueCertificate) {
            return res.status(400).json({
                error: "You cannot update verified certificate."
            });
        }

       //check if the date in the req.body is less than date today
        const skillCertMoment = moment.utc(req.body.validUntil, 'MM-DD-YYYY');
        const validUntilDate = skillCertMoment.toDate();

        if (validUntilDate < new Date()) {
            return res.status(400).json({ error: 'Your NBI Clearance is outdated. Please submit a valid one.' });
        }
        
        //remove the recent image
        await cloudinary.uploader.destroy(certificate.cloudinary_id)
        //upload the new image
        let result
        if(req.file){
            result = await cloudinary.uploader.upload(req.file.path)
        }
        const data = {
            categorySkill: req.body.categorySkill || certificate.categorySkill,
            title: req.body.title || certificate.title,
            validUntil: req.body.validUntil || certificate.validUntil,
            photo: result?.secure_url || certificate.photo,
            cloudinary_id: result?.public_id || certificate.cloudinary_id,
            skillIsVerified: "pending",
            message:[]
        }
         //if existing
         const certCheck = await Certificate.findOne({
            _id: { $ne: req.params.id },
            categorySkill: req.body.categorySkill,
            title: req.body.title,
            validUntil:req.body.validUntil,
            skilled_id:skilled_id,
            skillIsVerified:{$in: ["pending", "false", "true"]},
            isExpired: {$in: [0, 1]},
            isDeleted: 0
        })
        
        if(certCheck){
            return res.status(400).json({error: "Skill Certificate already exists to this user."})
        }
        certificate = await Certificate.findByIdAndUpdate(req.params.id, 
            data, {new: true})

        // Get the name of the skilled user
        const skilledInfo = await SkilledInfo.findOne({ _id: skilled_id });
        const skilledUserName = skilledInfo.username;

        // Create a notification after successfully creating new skills
        const notification = await Notification.create({
            skilled_id,
            message: `${skilledUserName} updated skill certificate.`,
            // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
            urlReact:`/viewSkilledCertificate/${skilledUserName}`
        });
            res.json({ message: 'Successfully updated.'})
   }
   catch(error){
        res.status(404).json({error: error.message})
    }
}


const deleteCertificate = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

    //delete query
    const certificate = await Certificate.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!certificate){
        return res.status(404).json({error: 'Skill Certificate not found.'})
    }

    res.status(200).json({ message: 'Successfully deleted.'})

}

const getAllSkillCertTitle= async(req, res)=>{
    const skillName = req.params.skillName;
    const skilled_id = req.skilledInfo._id
    try{
        // Find skilled_id document based on username
        const skillIdDoc = await Skill.findOne({ 
            skillName: skillName, 
            skilled_id,
            isDeleted: 0});

        // Check if skilled_id exists for the given username
        if (!skillIdDoc) {
        return res.status(404).json({ error: 'Not found.' });
        }
        //get all query
        const title = await Title.find({
            skill_id: skillIdDoc.skillName,
            isDeleted: 0
        })
        // .sort({updatedAt: 1})

        res.status(200).json(title)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

module.exports = {
    createCertificate,
    getAllCertificate,
    getAllCertSkill,
    getAllExpiredCert,
    getOneCertificate,
    updateCertificate,
    deleteCertificate,
    getAllSkillCertTitle
}