const Skill = require('../models/skill')
const SkilledInfo = require('../models/skilledInfo')
const Notification = require('../models/adminNotification')
const AdminInfo = require('../models/adminInfo')
const ClientInfo = require('../models/clientInfo')
const ClientComment = require('../models/clientComment')
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

        //get the photo then push first 
        let uploadedPhotos = [];

        // Loop through uploaded files and upload to cloudinary
        for (let file of req.files) {
            let result = await cloudinary.uploader.upload(file.path);
            uploadedPhotos.push({ url: result.secure_url, public_id: result.public_id });
        }
        
        // // Create the comment
        // const clientComment = await ClientComment.create({
        // comment,
        // client_id,
        // skill_id: skill_id,
        // star: star,
        // });

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

        //this is to update the skill
        let finalSkillRate = await Skill.findByIdAndUpdate(
            skill_id,
            {
                totalrating: averageRating,
            },
            { new: true }
        );
        res.status(200).json({ comment: clientComment, averageRating });
        
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};
  
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

const updateClientComment = async (req, res) => {
    const skill_id = req.params.skill_id; // Retrieve skill_id from params
    // const { star, comment } = req.body;
    const client_id = req.clientInfo._id;
  
    // Check if the skill_id is valid
    if (!mongoose.Types.ObjectId.isValid(skill_id)) {
      return res.status(404).json({ error: 'Invalid id' });
    }
  
    // Check for empty fields
    let emptyFields = [];
  
    if (!comment) {
      emptyFields.push('comment');
    }
    if (!star) {
      emptyFields.push('star');
    }
  
    // Send error message if there are empty fields
    if (emptyFields.length > 0) {
      return res.status(400).json({ error: 'Please fill in all the blank fields.', emptyFields });
    }
  
    if (comment === '') {
      return res.status(400).json({ message: 'Please enter your comment.' });
    }
  
    if (star === 0) {
      return res.status(400).json({ message: 'Please rate the skilled worker.' });
    }
  
    try {
        // Find the comment and check if it belongs to the logged-in client
        const clientComment = await ClientComment.findOne({
            _id: skill_id,
            client_id: client_id
        });
  
        // If comment not found or doesn't belong to the client, return error
        if (!clientComment) {
            return res.status(404).json({ error: 'Comment not found or you cannot update other clients\' feedback.' });
        }
  
        // Get the previous rating value
        const previousRating = clientComment.star;
    
        // Update the comment
        const updatedClientComment = await ClientComment.findOneAndUpdate(
            { _id: skill_id, client_id: client_id },
            { $set: { comment, star } },
            { new: true }
        );
  
        // Recalculate the total rating for the corresponding skill
        const comments = await ClientComment.find({ skill_id: updatedClientComment.skill_id, isDeleted: 0 }).lean();
        const ratingsSum = comments.reduce((sum, comment) => sum + comment.star, 0);
        const totalRatings = comments.length;
        const averageRating = totalRatings > 0 ? ratingsSum / totalRatings : 0;
    
        // Update the skill's total rating
        const updatedSkill = await Skill.findByIdAndUpdate(
            updatedClientComment.skill_id,
            { totalrating: averageRating },
            { new: true }
        );
  
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
    const comment = await ClientComment.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!comment){
        return res.status(404).json({error: 'Comment not found'})
    }

    // Recalculate the total rating for the corresponding skill
    const comments = await ClientComment.find({ skill_id: updatedClientComment.skill_id, isDeleted: 0 }).lean();
    const ratingsSum = comments.reduce((sum, comment) => sum + comment.star, 0);
    const totalRatings = comments.length;
    const averageRating = totalRatings > 0 ? ratingsSum / totalRatings : 0;

    // Update the skill's total rating
    const updatedSkill = await Skill.findByIdAndUpdate(
        comment.skill_id,
        { totalrating: averageRating },
        { new: true }
    );

    res.status(200).json({ message: 'Successfully deleted.'})

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
    deleteClientComment,
    updateClientComment
}