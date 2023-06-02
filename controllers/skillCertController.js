const Certificate = require('../models/skillCert')
const AdminSkill = require('../models/adminSkill') 
const Title = require('../models/skillTitle')  
const Skill = require('../models/skill')
const Notification = require('../models/adminNotification')
const SkilledInfo = require('../models/skilledInfo')
const mongoose = require('mongoose')
const cloudinary = require("../utils/cloudinary"); 
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
        return res.status(400).json({error: 'Please upload your certificate photo.'})
    }

    // Check if file type is supported
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!supportedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({error: 'File type not supported. Please upload an image in PNG, JPEG, or JPG format.'})
    }

    try{
        //this is to assign the job to a specific client user, get id from clientInfo
        const skilled_id = req.skilledInfo._id

        const certCheck = await Certificate.findOne({
            categorySkill:categorySkill,
            title:title,
            validUntil:validUntil,
            skilled_id:skilled_id,
            skillIsVerified:{$in: ["pending", "false", "true"]},
            isExpired: {$in: [0, 1]},
            isDeleted: 0
        })
        
        if(certCheck){
            return res.status(400).json({error: "Skill certificate already exists in this user."})
        }
        
        if (categorySkill === "Select") {
            res.status(400).send({ error: "Please enter your skill" });
            return;
        }
        // Convert the validUntil date string to a Date object
        const validUntilDate = new Date(validUntil);

        // Check if the validUntil date is less than today's date
        if (validUntilDate < new Date()) {
            return res.status(400).json({ error: 'Your certificate is outdated. Please submit a valid one.' });
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
        console.log(error)
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
        .sort({updatedAt: -1})
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
        
        
        res.status(200).json(certificate)
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
        res.status(200).json(skillCert)
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
        res.status(200).json(certificate)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

const getOneCertificate = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
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
        return res.status(404).json({error: 'Skill Certificate not found'})
    }

    res.status(200).json(certificate)   

}

const updateCertificate = async(req,res)=>{

    try{
        const skilled_id = req.skilledInfo._id
        let certificate = await Certificate.findById(req.params.id)
        if (!req.file) {
            return res.status(400).json({error: 'Please upload your certificate photo.'})
        }
        const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!supportedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({error: 'File type not supported. Please upload an image in PNG, JPEG, or JPG format.'})
        }

        if (req.body.categorySkill === "Select") {
            res.status(400).send({ error: "Please enter your skill" });
            return;
        }

        const trueCertificate = await Certificate.findOne({
                _id: req.params.id,
                skillIsVerified: "true",
            });
    
            if (trueCertificate) {
                return res.status(400).json({
                    message: "You cannot update verified certificate."
                });
            }
        
        // Convert the validUntil date string to a Date object
        const validUntilDate = new Date(req.body.validUntil);

        // Check if the validUntil date is less than today's date
        if (validUntilDate < new Date()) {
            return res.status(400).json({ error: 'Your certificate is outdated. Please submit a valid one.' });
        }
        // // check if certificate already exists with the same categorySkill, title, issuedOn, and validUntil
        // const existingCertificate = await Certificate.findOne({
        //     categorySkill: req.body.categorySkill || certificate.categorySkill,
        //     title: req.body.title || certificate.title,
        //     issuedOn: req.body.issuedOn || certificate.issuedOn,
        //     validUntil: req.body.validUntil || certificate.validUntil,
        //     skillIsVerified:{$in: ["false", "true"]},
        //     isDeleted:0,
        //     skilled_id:skilled_id
        // });

        // if (existingCertificate) {
        //     return res.status(400).json({
        //         message: "This certificate already exists."
        //     });
        // }
        
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

        certificate = await Certificate.findByIdAndUpdate(req.params.id, 
            data, {new: true})

        // Get the name of the skilled user
        const skilledInfo = await SkilledInfo.findOne({ _id: skilled_id });
        const skilledUserName = skilledInfo.username;

        // Create a notification after successfully creating new skills
        const notification = await Notification.create({
            skilled_id,
            message: `${skilledUserName} has updated skill certificate.`,
            // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
            urlReact:`/viewSkilledCertificate/${skilledUserName}`
        });
            res.json({ message: 'Successfully updated.'})
   }
   catch(error){
        res.status(404).json({error: error.message})
    }
}

//UPDATE skill cert
// const updateCertificate = async(req, res) =>{
//     const {id} = req.params   
//     const {categorySkill,
//         title,
//         issuedOn,
//         validUntil,
//         photo} = req.body 
//         const skilled_id = req.skilledInfo._id

//     //check if id is not existing
//     if(!mongoose.Types.ObjectId.isValid(id)){
//         return res.status(404).json({error: 'Invalid id'})
//     }

//      //check empty fields
//      let emptyFields = []
//      if(!categorySkill){
//          emptyFields.push('categorySkill')
//      }
//      if(!title){
//          emptyFields.push('title')
//      }
//      if(!issuedOn){
//          emptyFields.push('issuedOn')
//      }
//      if(!validUntil){
//          emptyFields.push('validUntil')
//      }
//      if(!photo){
//          emptyFields.push('photo')
//      }
 
//      //send message if there is an empty fields
//      if(emptyFields.length >0){
//          return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
//      }

//     const certCheck = await Certificate.findOne({
//         categorySkill:categorySkill,
//         title:title,
//         issuedOn:issuedOn,
//         validUntil:validUntil,
//         photo:photo,
//         skilled_id:skilled_id,
//         skillIsVerified:{$in: ["false", "true"]},
//         isDeleted: 0
//     })
    
//     if(certCheck){
//         return res.status(400).json({error: "Skill certificate already exists in this user."})
//     }

//     if (issuedOn >= validUntil) {
//         res.status(400).send({ error: "Please check your certificate issued on and valid until" });
//         return;
//     }

//      //delete query
//      const certificate = await Certificate.findOneAndUpdate({_id: id},{
//          ...req.body //get new value
//      })
    
//      //check if not existing
//      if (!certificate){
//         return res.status(404).json({error: 'Skill Certificate not found'})
//     }

//     res.status(200).json(certificate)
// }

const deleteCertificate = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const certificate = await Certificate.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!certificate){
        return res.status(404).json({error: 'Skill Certificate not found'})
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
        return res.status(404).json({ error: 'Skill does not exist to this Skilled Worker' });
        }
        console.log(skillIdDoc)
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

//get all skill cert

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