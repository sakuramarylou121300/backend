const mongoose = require('mongoose') 
const SkilledExp = require('../models/skilledExp') 
const AdminSkill = require('../models/adminSkill')
const SkilledInfo = require('../models/skilledInfo')
const Notification = require('../models/adminNotification')
const cloudinary = require("../utils/cloudinary")
const upload = require("../utils/multer") 

const createExp = async(req, res) => {
    const { categorySkill,
        isHousehold,
        company,
        isWorking,
        workStart,
        workEnd,
        refLname,
        refFname,
        refMname,
        refPosition,
        refOrg,
        refContactNo
    } = req.body;

    let emptyFields = []

    if(!categorySkill){
        emptyFields.push('categorySkill')
    }
    if(!workStart){
        emptyFields.push('workStart')
    }
    if(!refLname){
        emptyFields.push('refLname')
    }
    if(!refFname){
        emptyFields.push('refFname')
    }
    if(!refPosition){
        emptyFields.push('refPosition')
    }
    if(!refOrg){
        emptyFields.push('refOrg')
    }
    if(!refContactNo){
        emptyFields.push('refContactNo')
    }
    //send message if there is an empty fields
    if(emptyFields.length >0){
        return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
    }

    //check if valid contact no
    const mobileNumberRegex = /^09\d{9}$|^639\d{9}$/;
    if (!mobileNumberRegex.test(refContactNo)) {
        return res.status(400).json({error: 'Please check the contact you have entered.'});
    }

    try {
        const skilled_id = req.skilledInfo._id;
        const expCheck = await SkilledExp.findOne({
        categorySkill:categorySkill,
        isHousehold:isHousehold,
        company:company,
        isWorking:isWorking,
        workStart:workStart,
        workEnd:workEnd,
        refLname:refLname, 
        refFname:refFname,
        refMname:refMname,
        refPosition:refPosition,
        refOrg:refOrg,
        refContactNo:refContactNo,
        expIsVerified:{$in: ["pending","false", "true"]},
        skilled_id:skilled_id,
        isDeleted: 0
    })
  
    if(expCheck){
        return res.status(400).json({error: "Work experience already exists to this user."})
    } 
    //check if the photo field is empty
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({error: 'Please upload a photo.'});
    }
    //check if supported
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    for (let i = 0; i < req.files.length; i++) {
        if (!supportedTypes.includes(req.files[i].mimetype)) {
            return res.status(400).json({ error: `File type not supported. Please upload an image in PNG, JPEG, or JPG format. File ${i + 1} is not supported.` });
        }
    }
    if (categorySkill === "Select") {
        res.status(400).send({ error: "Please select skill." });
        return;
    }

    let uploadedPhotos = [];

    // Loop through uploaded files and upload to cloudinary
    for (let file of req.files) {
        let result = await cloudinary.uploader.upload(file.path);
        uploadedPhotos.push({ url: result.secure_url, public_id: result.public_id });
    }

    // Create new SkilledExp object
    let skilledExp = new SkilledExp({
        categorySkill,
        isHousehold,
        company,
        isWorking,
        workStart,
        workEnd,
        refLname,
        refFname,
        refMname,
        refPosition,
        refOrg,
        refContactNo,
        skilled_id,
        photo: uploadedPhotos,
        cloudinary_id: uploadedPhotos[0].public_id // Use the public ID of the first photo in the array
    });
    await skilledExp.save();

     // Get the name of the skilled user
     const skilledInfo = await SkilledInfo.findOne({ _id: skilled_id });
     const skilledUserName = skilledInfo.username;

     // Create a notification after successfully creating new exp
     const notification = await Notification.create({
         skilled_id,
         message: `added new work experience.`,
         // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
         urlReact:`/SkilledWorker/Experience`
     });

    res.status(200).json({ message: 'Successfully added.'});

    }catch(error) {
    res.status(404).json({error: error.message});
    }
}

const getAllExp = async(req, res)=>{ 

    try{
        //this is to find contact for specific user
        const skilled_id = req.skilledInfo._id

        //get all query
        const skilledExp = await SkilledExp
        .find({skilled_id, 
            isDeleted: 0,
            isExpired:{$ne: 1},})
        .sort({createdAt: -1})
        .populate('categorySkill')
        .populate('skilled_id')
        .populate({
            path: 'message.message',
            model: 'Reason',
            select: 'reason',
            options: { lean: true },
        })
        res.status(200).json(skilledExp)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
} 

const getAllExpSkill = async(req, res)=>{ 

    try{
        //this is to find contact for specific user
        const skill = req.params.skill
        const skilled_id = req.skilledInfo._id

        // Find skilled_id document based on username
        const skillIdDoc = await AdminSkill.findOne({ 
            skill: skill});

        // Check if skilled_id exists for the given username
        if (!skillIdDoc) {
        return res.status(404).json({ error: 'Skill not found in Skilled Worker' });
        }

        //get all query
        const skilledExp = await SkilledExp
        .find({
            skilled_id, 
            categorySkill: skillIdDoc._id,
            isDeleted: 0,
            isExpired:{$ne: 1}})
        .sort({createdAt: -1})
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
        res.status(200).json(skilledExp)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
} 

const getAllExpiredExp = async(req, res)=>{ 

    try{
        //this is to find contact for specific user
        const skilled_id = req.skilledInfo._id

        //get all query
        const skilledExp = await SkilledExp
        .find({skilled_id, 
            isDeleted: 0,
            isExpired: 1})
        .sort({createdAt: -1})
        .populate('skilled_id')
        res.status(200).json(skilledExp)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
} 

const getOneExp = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const skilledExp = await SkilledExp.findById({_id: id})
    .populate('categorySkill')
    .populate({
        path: 'message.message',
        model: 'Reason',
        select: 'reason',
        options: { lean: true },
    })

    //check if not existing
    if (!skilledExp){
        return res.status(404).json({error: 'Skill Experience not found'}) 
    }

    res.status(200).json(skilledExp)   
}

const updateExp = async (req, res) => {
    try {
        const skilled_id = req.skilledInfo._id
        let skilledExp = await SkilledExp.findById(req.params.id);
          //check if valid contact no
        const mobileNumberRegex = /^09\d{9}$|^639\d{9}$/;
        if (!mobileNumberRegex.test(req.body.refContactNo)) {
            return res.status(400).json({error: 'Please check the contact you have entered.'});
        }

        //check if the photo field is empty
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({error: 'Please upload a photo.'});
        }
        //check if supported
        const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        for (let i = 0; i < req.files.length; i++) {
            if (!supportedTypes.includes(req.files[i].mimetype)) {
                return res.status(400).json({ error: `File type not supported. Please upload an image in PNG, JPEG, or JPG format. File ${i + 1} is not supported.` });
            }
        }
        if (req.body.categorySkill === "Select") {
            res.status(400).send({ error: "Please select skill." });
            return;
        }
        const trueExp = await SkilledExp.findOne({
            _id: req.params.id,
            expIsVerified: "true",
        });

        if (trueExp) {
            return res.status(400).json({
                error: "You cannot update verified work experience."
            });
        }
        // remove the recent images
        await Promise.all(
            skilledExp.photo.map(async (expPhoto) => {
            await cloudinary.uploader.destroy(expPhoto.public_id);
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
            categorySkill: req.body.categorySkill || skilledExp.categorySkill,
            isHousehold: req.body.isHousehold || skilledExp.isHousehold,
            company: req.body.company || skilledExp.company,
            isWorking: req.body.isWorking || skilledExp.isWorking,
            workStart: req.body.workStart || skilledExp.workStart,
            workEnd: req.body.workEnd || skilledExp.workEnd,
            refLname: req.body.refLname || skilledExp.refLname,
            refFname: req.body.refFname || skilledExp.refFname,
            refMname: req.body.refMname || skilledExp.refMname,
            refPosition: req.body.refPosition || skilledExp.refPosition,
            refOrg: req.body.refOrg || skilledExp.refOrg,
            refContactNo: req.body.refContactNo || skilledExp.refContactNo,
            photo: uploadedPhotos.length > 0 ? uploadedPhotos : skilledExp.photo,
            cloudinary_id: uploadedPhotos.length > 0 ? uploadedPhotos[0].public_id : skilledExp.cloudinary_id,
            expIsVerified: "pending",
            message: []
        };
        
        //if existing
        const expCheck = await SkilledExp.findOne({
            _id: { $ne: req.params.id },
            categorySkill:req.body.categorySkill,
            isHousehold:req.body.isHousehold,
            company:req.body.company,
            isWorking:req.body.isWorking,
            workStart:req.body.workStart,
            workEnd:req.body.workEnd,
            refLname:req.body.refLname, 
            refFname:req.body.refFname,
            refMname:req.body.refMname,
            refPosition:req.body.refPosition,
            refOrg:req.body.refOrg,
            refContactNo:req.body.refContactNo,
            expIsVerified:{$in: ["pending","false", "true"]},
            skilled_id:skilled_id,
            isDeleted: 0
        })
        
        if(expCheck){
            return res.status(400).json({error: "Work Experience already exists to this user."})
        }
        const updatedSkilledExp = await SkilledExp.findByIdAndUpdate(
            req.params.id,
            data,
            { new: true }
        );
        //this is for the notification
        const skilledInfo = await SkilledInfo.findOne({ _id: skilled_id }); 
        const skilledUserName = skilledInfo.username;
    
        // Create a notification after successfully creating new skills
        const notification = await Notification.create({
            skilled_id,
            message: `updated work experience.`,
            // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
            urlReact:`/SkilledWorker/Experience`
        
        });
        res.json({ message: 'Successfully updated.'});
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
};

const deleteExp = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

    //delete query
    const skilledExp = await SkilledExp.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!skilledExp){
        return res.status(404).json({error: 'Work Experience not found.'})
    }

    res.status(200).json({ message: 'Successfully deleted.'})

}
module.exports = {
    createExp,
    getAllExp,
    getAllExpSkill,
    getAllExpiredExp,
    getOneExp, 
    updateExp,
    deleteExp
}