const Certificate = require('../models/skillCert')
const AdminSkill = require('../models/adminSkill') 
const Title = require('../models/skillTitle')  
const Skill = require('../models/skill')
const Notification = require('../models/adminNotification')
const SkilledInfo = require('../models/skilledInfo')
const OtherTitle = require('../models/otherTitle')
const mongoose = require('mongoose')
const cloudinary = require("../utils/cloudinary"); 
const moment = require('moment');
const upload = require("../utils/multer");
const multer = require('multer')
const path = require('path')

const createCertificate = async(req, res)=>{
    const {categorySkill,
        title,
        validUntil,
        otherTitles
    } = req.body

    //this is to assign the job to a specific client user, get id from clientInfo
    const skilled_id = req.skilledInfo._id
    
    //check empty fields
    if(!categorySkill){
        return res.status(400).json({error: 'Please enter the skill category of the certificate.'})
    }
    if ((!title || title.length === 0) && (!otherTitles || otherTitles.length === 0)) {
        res.status(400).send({ error: "Please select certificate title or refer certificate title to admin." });
        return;
    }
    if(!validUntil){
        return res.status(400).json({error: 'Please enter the expiration of the certificate.'})
    }

    if (!req.file) {
        return res.status(400).json({error: 'Please upload a photo.'})
    }

    //check if the date in the req.body is less than date today
    const skillCertMoment = moment.utc(req.body.validUntil, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
    const validUntilDate = skillCertMoment.toDate();

    if (validUntilDate < new Date()) {
        return res.status(400).json({ error: 'Your NBI Clearance is outdated. Please submit a valid one.' });
    }

    try{

        //if existing
        if (title !== "") {
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
            message: `added skill certificate.`,
            // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
            urlReact:`/SkilledWorker/Certificates`
        
        });

        //IF ALL ARE OKAY
        //for other skills
        if (otherTitles && otherTitles.length > 0) {
            //find if existing in otherSkill model
            const existingOtherSkill = await OtherTitle.findOne({
                categorySkill: categorySkill,
                otherTitles: otherTitles
            })
            //find the value of categorySkill
            const categorySkillValue = await AdminSkill.findOne({
                _id: categorySkill
            })

            if (existingOtherSkill) {

                //if pending
                if (existingOtherSkill.titleIsVerified === 'pending') {
                    res.status(400).send({ error: `${otherTitles} is already requested with the same skill ${categorySkillValue.skill}, please wait for it to be approve.` });
                    return;
                }

                //if false
                if (existingOtherSkill.titleIsVerified === 'false') {
                    res.status(400).send({ error: `${otherTitles} with the same skill ${categorySkillValue.skill} is already requested and it was not qualified.` });
                    return;
                }
                
            }

            //find if existing in skill title
            //find the value of categorySkill
            const titleValue = await AdminSkill.findOne({
                _id: categorySkill
            })
            const existingAdminSkill = await Title.findOne({ 
                skill_id: categorySkill,
                title: otherTitles,

            });

            if (existingAdminSkill) {
                res.status(400).send({ error: `${otherTitles} already exist in ${titleValue.skill} skill.` });
                return; // Add this return statement
            }

            const otherTitleAdd = await OtherTitle.create({
                skillCert_id: certificate._id,
                categorySkill: categorySkill,
                otherTitles:otherTitles,
                skilled_id: skilled_id
            })

            // Create a notification after adding otherSkills
            const notification = await Notification.create({
                skilled_id,
                message: `requested certificate ${otherTitles} title in ${categorySkillValue.skill} skill.`,
                // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
                urlReact:`/Kasaw-App/CertificateTitles-Request`
            });
        }

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
        // .populate('skilled_id')
        .populate({
            path: 'skilled_id',
            select: '-otp', // Exclude 'otp' field from the populated skilled_id object
        })
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
        // .populate('skilled_id')
        .populate({
            path: 'skilled_id',
            select: '-otp', // Exclude 'otp' field from the populated skilled_id object
        })
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

        //if both title and other title is empty
        if ((!req.body.title || req.body.title.length === 0) && (!req.body.otherTitles || req.body.otherTitles.length === 0)) {
            res.status(400).send({ error: "Please select certificate title or refer certificate title to admin." });
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
        const skillCertMoment = moment.utc(req.body.validUntil, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
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
         if (req.body.title !== "") {
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
        }
        certificate = await Certificate.findByIdAndUpdate(req.params.id, 
            data, {new: true})

        // Get the name of the skilled user
        const skilledInfo = await SkilledInfo.findOne({ _id: skilled_id });
        const skilledUserName = skilledInfo.username;

        // Create a notification after successfully creating new skills
        const notification = await Notification.create({
            skilled_id,
            message: `updated skill certificate.`,
            // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
            urlReact:`/SkilledWorker/Certificates`
        });

        //if other title is added
        //for other skills
        if (req.body.otherTitles && req.body.otherTitles.length > 0) {
            //find if existing in otherSkill model
            const existingOtherSkill = await OtherTitle.findOne({
                categorySkill: req.body.categorySkill,
                otherTitles: req.body.otherTitles
            })
            //find the value of categorySkill
            const categorySkillValue = await AdminSkill.findOne({
                _id: req.body.categorySkill
            })

            if (existingOtherSkill) {

                //if pending
                if (existingOtherSkill.titleIsVerified === 'pending') {
                    res.status(400).send({ error: `${req.body.otherTitles} is already requested with the same skill ${categorySkillValue.skill}, please wait for it to be approve.` });
                    return;
                }

                //if false
                if (existingOtherSkill.titleIsVerified === 'false') {
                    res.status(400).send({ error: `${req.body.otherTitles} with the same skill ${categorySkillValue.skill} is already requested and it was not qualified.` });
                    return;
                }
                
            }

            //find if existing in skill title
            //find the value of categorySkill
            const titleValue = await AdminSkill.findOne({
                _id: req.body.categorySkill
            })
            const existingAdminSkill = await Title.findOne({ 
                skill_id: req.body.categorySkill,
                title: req.body.otherTitles,

            });

            if (existingAdminSkill) {
                res.status(400).send({ error: `${req.body.otherTitles} already exist in ${titleValue.skill} skill.` });
                return; // Add this return statement
            }

            const otherTitleAdd = await OtherTitle.create({
                skillCert_id: certificate._id,
                categorySkill: req.body.categorySkill,
                otherTitles:req.body.otherTitles,
                skilled_id: skilled_id
            })

            // Create a notification after adding otherSkills
            const notification = await Notification.create({
                skilled_id,
                message: `requested certificate ${req.body.otherTitles} title in ${categorySkillValue.skill} skill.`,
                // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
                urlReact:`/Kasaw-App/CertificateTitles-Request`
            });
        }

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