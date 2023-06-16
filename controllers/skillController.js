const Skill = require('../models/skill')
const SkilledInfo = require('../models/skilledInfo')
const Notification = require('../models/adminNotification')
const AdminInfo = require('../models/adminInfo')
const ClientInfo = require('../models/clientInfo')
const ClientComment = require('../models/clientComment')
const SkilledNotification = require('../models/skilledNotification')
const ClientReq = require('../models/clientReq')
const AdminSkill = require('../models/adminSkill')
const cloudinary = require("../utils/cloudinary")
const upload = require("../utils/multer") 
const mongoose = require('mongoose')

const createSkills = async(req, res)=>{ 
    try {
        const skilled_id = req.skilledInfo._id;
        const skillsToAdd = req.body.map(skillName => ({ ...skillName, skilled_id }));

        // Check for empty skill names and duplicate skill names
        const existingSkills = await Skill.find({ skilled_id });
        const existingSkillNames = existingSkills.map(skill => skill.skillName);
        const newSkills = [];

        if (skillsToAdd.length === 0) {
            res.status(400).send({ error: "Please enter your skill" });
            return;
        }

        for (const skill of skillsToAdd) {
            //if the value in the drop down is Select
            if (!skill.skillName || skill.skillName === "Select") {
                res.status(400).send({ error: "Please enter your skill" });
                return;
            }
           
            if (existingSkillNames.includes(skill.skillName)) {
                res.status(400).send({ error: `${skill.skillName} already exist. ` });
                return;
            }
           
            existingSkillNames.push(skill.skillName);
            newSkills.push(skill);
        }

        const skills = await Skill.insertMany(newSkills);
        res.status(201).send({ message: 'Successfully added.'});
    } catch (error) {
      res.status(400).send(error);
    }
}
//CREATE skill 
const createSkill = async(req, res)=>{
    const {skillName} = req.body

    // check empty fields
    let emptyFields = []
    
    if(!skillName){
        emptyFields.push('skillName')
    }

    //send message if there is an empty fields
    if(emptyFields.length >0){
        return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
    }
    
    try{
        //this is to assign the job to a specific client user, get id from clientInfo
        const skilled_id = req.skilledInfo._id
        const skillCheck = await Skill.findOne({
            skillName:skillName,
            skilled_id:skilled_id,
            isDeleted: 0
        })
        
        if(skillCheck){
            return res.status(400).json({error: "Skill already exists in this user."})
        }

        //create query
        const skill = await Skill.create({
            skillName,
            skilled_id
        })
        res.status(200).json({ message: 'Successfully added.'})
    }

    catch(error){
        res.status(404).json({error: error.message})
    }
}

//GET all skill
const getAllSkill = async(req, res)=>{

    try{
        //this is to find skill for specific user
        const skilled_id = req.skilledInfo._id
        //get all query
        const skill = await Skill.find({skilled_id, isDeleted: 0}).sort({createdAt: -1})
        .populate('skillName')
        .populate('skilled_id')
        .populate('comments')
        .populate({
            path: "comments",
            match: { isDeleted: 0 },
            populate: {
              path: "skill_id",
              select: "skillName", // Assuming 'skill' is the field in 'AdminSkill' model that holds the skill name
            },
        })
        
        res.status(200).json(skill)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET one skill
const getOneSkill = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const skill = await Skill.findById({_id: id})
    .populate('skillName')
    .populate('skilled_id')

    //check if not existing
    if (!skill){
        return res.status(404).json({error: 'Skill not found'})
    }

    res.status(200).json(skill)   

}

//UPDATE skill
const updateSkill = async(req, res) =>{
    const {id} = req.params    
    const {skillName} = req.body
    const skilled_id = req.skilledInfo._id

      //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }
    // check empty fields
    let emptyFields = []
    
    if(!skillName){
        emptyFields.push('skillName')
    }

    //send message if there is an empty fields
    if(emptyFields.length >0){
        return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
    }
    if(skillName==="Select"){
        res.status(400).send({ message: "Please enter your skill" });
        return
    }
    const skillCheck = await Skill.findOne({
        skillName:skillName,
        skilled_id:skilled_id,
        isDeleted:0
    })
        
    if(skillCheck){
        return res.status(400).json({error: "Skill already exists in this user."})
    }

     //delete query
     const skill = await Skill.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!skill){
        return res.status(404).json({error: 'Skill not found'})
    }

    res.status(200).json({ message: 'Successfully updated.'})
}

//DELETE skill
const deleteSkill = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const skill = await Skill.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!skill){
        return res.status(404).json({error: 'Skill not found'})
    }

    res.status(200).json({ message: 'Successfully deleted.'})

}


const rating = async (req, res) => {
    const _id = req.clientInfo._id;
    const { star } = req.body;
    const skill_id = req.params.skill_id; // Retrieve skill_id from params
    try {
        const skill = await Skill.findById(skill_id);

        // Find if client already rated the product
        let alreadyRated = skill.ratings.find(
        (client_id) => client_id.postedby.toString() === _id.toString()
        );

        if (alreadyRated) {
        const updateRating = await Skill.updateOne(
            {
                ratings: { $elemMatch: alreadyRated },
            },
            {
                $set: { "ratings.$.star": star },
            },
            {
                new: true,
            }
        );
        // res.json(updateRating)
        } else {
        const rateSkill = await Skill.findByIdAndUpdate(
            skill_id,
            {
            $push: {
                ratings: {
                star: star,
                postedby: _id,
                },
            },
            },
            { new: true }
        );
        // res.json(rateSkill)
        }

        // This is to get all ratings
        const getAllRatings = await Skill.findById(skill_id);
        let totalRating = getAllRatings.ratings.length;
        // Find the sum of the array from totalRating with the use of reduce
        let ratingSum = getAllRatings.ratings
        .map((item) => item.star)
        .reduce((prev, curr) => prev + curr, 0);
        // Sum divided by the number of posted ratings
        let actualRating = Math.round(ratingSum / totalRating);
        let finalSkillRate = await Skill.findByIdAndUpdate(
        skill_id,
        {
            totalrating: actualRating,
        },
        { new: true }
        );
        res.json(finalSkillRate);
    } catch (error) {
        throw new Error(error);
    }
};

const createClientComment = async (req, res) => {
    const skill_id = req.params.skill_id; // Retrieve skill_id from params
    const client_id = req.clientInfo._id;
    const { star, comment } = req.body;

    try {

        //check if the star is empty else click cancel
        let emptyFields = []

        if(star === 0){
            return res.status(400).json({error: 'Please select your rate before submitting.'});
        }

        //get the photo then push first 
        let uploadedPhotos = [];

        // Loop through uploaded files and upload to cloudinary
        for (let file of req.files) {
            let result = await cloudinary.uploader.upload(file.path);
            uploadedPhotos.push({ url: result.secure_url, public_id: result.public_id });
        }

        let clientComment = new ClientComment({
            comment,
            client_id,
            skill_id: skill_id,
            star: star,
            photo: uploadedPhotos,
            cloudinary_id: uploadedPhotos[0].public_id // Use the public ID of the first photo in the array
        });
        //saving of comment with photo
        clientComment = await clientComment.save();

        // Calculate the updated rating
        const comments = await ClientComment.find({ skill_id: skill_id, isDeleted:0 });
        const ratingsSum = comments.reduce((sum, comment) => sum + comment.star, 0);
        const totalRatings = comments.length;
        const averageRating = totalRatings > 0 ? ratingsSum / totalRatings : 0;
        const roundedRating = Number(averageRating.toFixed(1)); // Round off to one decimal place

        //this is to update the skill
        let finalSkillRate = await Skill.findByIdAndUpdate(
            skill_id,
            {
                totalrating: roundedRating,
            },
            { new: true }
        );

        //this is for the notification
        // Get the name of the skilled user
        const clientInfo = await ClientInfo.findOne({ _id: client_id });
        const clientUsername = clientInfo.username;
        const skilled_id = finalSkillRate.skilled_id;
        // Create a notification after successfully creating new exp
        const notification = await SkilledNotification.create({
            skilled_id,
            message: `${clientUsername} has rated your skill.`,
            // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
            urlReact:`/temporary/`
        });

        res.status(200).json({ comment: clientComment, averageRating });
        
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

//this is for all the user
const getAllClientComment = async(req, res)=>{

    try{
        //this is to find skill for specific user
        const skill_id = req.params.skill_id;
        //get all query
        const clientComment = await ClientComment.find({skill_id, isDeleted: 0})
        .sort({createdAt: -1})
        .populate('skill_id')
        .populate('client_id')
        
        res.status(200).json(clientComment)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
//this is for specific client only
const getAllClientOneComment = async(req, res)=>{

    try{
        //this is to find skill for specific user
        const skill_id = req.params.skill_id;
        const client_id = req.clientInfo._id;
        //get all query
        const clientComment = await ClientComment
        .find({client_id, isDeleted: 0})
        .sort({createdAt: -1})
        .populate('skill_id')
        .populate('client_id')
        
        res.status(200).json(clientComment)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

const updateClientComment = async (req, res) => {
    const client_id = req.clientInfo._id;
  
    // Check if the skill_id is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Invalid id' });
    }
   
    if (req.body.star === 0) {
      return res.status(400).json({ message: 'Please select your skill before submitting.' });
    }
  
    try {

        let clientComment = await ClientComment.findById(req.params.id);
  
        // Get the previous rating value
        const previousRating = clientComment.star;
  
        // remove the recent images
        if (clientComment.photo) {
            await Promise.all(
                clientComment.photo.map(async (clientPhoto) => {
                await cloudinary.uploader.destroy(clientPhoto.public_id);
                })
            );
        }

        // upload the new images
        let uploadedPhotos = await Promise.all(
            req.files.map(async (file) => {
            let result = await cloudinary.uploader.upload(file.path);
            return { url: result.secure_url, public_id: result.public_id };
            })
        );

        let data = {
            star: req.body.star || clientComment.star,
            comment: req.body.comment || clientComment.comment,
            photo: uploadedPhotos.length > 0 ? uploadedPhotos : skilledExp.photo,
            cloudinary_id: uploadedPhotos.length > 0 ? uploadedPhotos[0].public_id : skilledExp.cloudinary_id,
        };

        // Update the comment
        const updatedClientComment = await ClientComment.findByIdAndUpdate(
            req.params.id,
            data,
            { new: true }
        );
          
        // Recalculate the total rating for the corresponding skill
        const comments = await ClientComment.find({ skill_id: updatedClientComment.skill_id, isDeleted: 0 }).lean();
        const ratingsSum = comments.reduce((sum, comment) => sum + comment.star, 0);
        const totalRatings = comments.length;
        const averageRating = totalRatings > 0 ? ratingsSum / totalRatings : 0;
        const roundedRating = Number(averageRating.toFixed(1)); // Round off to one decimal place

        // Update the skill's total rating
        const updatedSkill = await Skill.findByIdAndUpdate(
            updatedClientComment.skill_id,
            { totalrating: roundedRating },
            { new: true }
        );

        //this is for the notification
        // Get the name of the skilled user
        const clientInfo = await ClientInfo.findOne({ _id: client_id });
        const clientUsername = clientInfo.username;
        const skilled_id = updatedSkill.skilled_id;
        // Create a notification after successfully creating new exp
        const notification = await SkilledNotification.create({
            skilled_id,
            message: `${clientUsername} has updated the rate in your skill.`,
            // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
            urlReact:`/temporary/`
        });
  
      res.status(200).json({ comment: updatedClientComment, averageRating });
  
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
};
  
const deleteClientComment = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const comment = await ClientComment.findOneAndUpdate({_id:id},
        {isDeleted:1})
    
    //check if not existing
    if (!comment){
        return res.status(404).json({error: 'Comment not found'})
    }

    // Recalculate the total rating for the corresponding skill
    const comments = await ClientComment.find({ skill_id: comment.skill_id, isDeleted: 0 }).lean();
    const ratingsSum = comments.reduce((sum, comment) => sum + comment.star, 0);
    const totalRatings = comments.length;
    const averageRating = totalRatings > 0 ? ratingsSum / totalRatings : 0;
    const roundedRating = Number(averageRating.toFixed(1)); // Round off to one decimal place

    // Update the skill's total rating
    const updatedSkill = await Skill.findByIdAndUpdate(
        comment.skill_id,
        { totalrating: roundedRating },
        { new: true }
    );

    res.status(200).json({ message: 'Successfully deleted.'})

}

//get one skilled skill first
const getOneSkilledSkill = async(req, res)=>{
    const skilledWorkerId  = req.params._id//this is to get the _id of skilled worker first
    const skillId  = req.params.skillId; // Get the skill ID
    const skilledSkill  = req.params.skilledSkill;

    //find skill worker first
    const skilledInfo = await SkilledInfo.findOne({_id: skilledWorkerId })
    //check if not existing
    if (!skilledInfo){
        return res.status(404).json({error: 'Skilled Worker not found'})
    }

    // Find skilled_id document based on username
    const skillIdDoc = await AdminSkill.findOne({
        _id: skillId });

    const skillParams = await Skill.findOne({
        _id: skilledSkill
    })

    //find query
    const skill = await Skill.find({
        _id: skillParams._id,
        skilled_id: skilledInfo._id, 
        skillName: skillIdDoc._id,
    })
    .populate('skilled_id', 'username lname fname mname')
    .populate('skillName', 'skill')

    //check if not existing
    if (!skill){
        return res.status(404).json({error: 'Skill not found'})
    }

    res.status(200).json(skill)   

}

//sending req to skilled worker
const createClientReq = async (req, res) => {
    
    try {
        const client_id = req.clientInfo._id;
        const {skilled_id} = req.body
        const {skill_id} = req.params; // Retrieve skill_id from params
        
        let newRequest = await ClientReq({
            skill_id: skill_id,
            skilled_id:skilled_id,
            client_id: client_id
        }).save();
        res.status(200).json({ message: 'Successfully added.'});
        
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

//skilled worker receiving req
const getAllSkilledReq = async(req, res)=>{

    try{
        //this is to find skill for specific user
        const skilled_id = req.skilledInfo._id
        //get all query
        const clientReq = await ClientReq.find({skilled_id, isDeleted: 0})
        .sort({createdAt: -1})
        .populate('skill_id')
        .populate('client_id')
        
        res.status(200).json(clientReq)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

const getAllClientReq = async(req, res)=>{

    try{
        //this is to find skill for specific user
        const client_id = req.clientInfo._id
        //get all query
        const clientReq = await ClientReq.find({client_id, isDeleted: 0})
        .sort({createdAt: -1})
        .populate('skill_id')
        .populate('client_id')
        
        res.status(200).json(clientReq)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
module.exports = {
    createSkills,
    createSkill,
    getAllSkill,
    getOneSkill,
    updateSkill,
    deleteSkill,
    rating, 
    createClientComment,
    getAllClientComment,
    getAllClientOneComment,
    deleteClientComment,
    updateClientComment,
    getOneSkilledSkill,
    createClientReq,
    getAllSkilledReq,
    getAllClientReq
}