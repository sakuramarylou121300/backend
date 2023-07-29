const Skill = require('../models/skill')
const SkilledInfo = require('../models/skilledInfo')
const Notification = require('../models/adminNotification')
const AdminInfo = require('../models/adminInfo')
const ClientInfo = require('../models/clientInfo')
const ClientComment = require('../models/clientComment')
const SkilledNotification = require('../models/skilledNotification')
const ClientNotification = require('../models/clientNotification')
const ClientReq = require('../models/clientReq')
const AdminSkill = require('../models/adminSkill')
const ReasonCancelled = require('../models/clientCancelReq')
const SkilledDate = require('../models/skilledDate')
const Reply = require('../models/reply')
const cloudinary = require("../utils/cloudinary")
const upload = require("../utils/multer") 
const moment = require('moment-timezone');
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
            res.status(400).send({ error: "Please select skill." });
            return;
        }

        for (const skill of skillsToAdd) {
            //if the value in the drop down is Select
            if (!skill.skillName || skill.skillName === "Select") {
                res.status(400).send({ error: "Please select skill." });
                return;
            }
           
            if (existingSkillNames.includes(skill.skillName)) {
                res.status(400).send({ error: `Please remove repeating skill. ` });
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
        return res.status(400).json({error: 'Please select skill.', emptyFields})
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
            return res.status(400).json({error: "Skill already exists to this user."})
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
        const skill = await Skill
        .find({skilled_id, isDeleted: 0})
        // .sort({skillName: -1})
        .populate('skillName', 'skill')
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
        .lean();

        const sortedSkills = skill.sort((a, b) => {
            const skillA = a.skillName.skill.toLowerCase();
            const skillB = b.skillName.skill.toLowerCase();
            if (skillA < skillB) return -1;
            if (skillA > skillB) return 1;
            return 0;
        });

        res.status(200).json(sortedSkills)
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
        return res.status(404).json({error: 'Invalid id.'})
    }

    //find query
    const skill = await Skill.findById({_id: id})
    .populate('skillName')
    .populate('skilled_id')

    //check if not existing
    if (!skill){
        return res.status(404).json({error: 'Skill not found.'})
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
        return res.status(404).json({error: 'Invalid id.'})
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
        res.status(400).send({ error: "Please enter your skill." });
        return
    }
    const skillCheck = await Skill.findOne({
        skillName:skillName,
        skilled_id:skilled_id,
        isDeleted:0
    })
        
    if(skillCheck){
        return res.status(400).json({error: "Skill already exists to this user."})
    }

     //delete query
     const skill = await Skill.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!skill){
        return res.status(404).json({error: 'Skill not found.'})
    }

    res.status(200).json({ message: 'Successfully updated.'})
}
//DELETE skill
const deleteSkill = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

    //delete query
    const skill = await Skill.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!skill){
        return res.status(404).json({error: 'Skill not found.'})
    }

    res.status(200).json({ message: 'Successfully deleted.'})

}

//COMMENT
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
    const id = req.params._id //this is for update when completed
    const skill_id = req.params.skill_id; // Retrieve skill_id from params
    const skilledId = req.params.skilledId;
    const client_id = req.clientInfo._id;
    const { star, comment } = req.body;

    try {

        //check if the star is empty else click cancel
        let emptyFields = []

        if(star === 0){
            return res.status(400).json({error: 'Please select your rate before submitting.'});
        }

        let clientComment;

        // Check if the photo field is provided
        if (req.files && req.files.length > 0) {
        // Handle the case when photo is provided

        // Loop through uploaded files and upload to cloudinary
        let uploadedPhotos = [];
        for (let file of req.files) {
            let result = await cloudinary.uploader.upload(file.path);
            uploadedPhotos.push({ url: result.secure_url, public_id: result.public_id });
        }

        clientComment = new ClientComment({
            comment,
            skilledId,
            client_id,
            skill_id,
            star,
            photo: uploadedPhotos,
            cloudinary_id: uploadedPhotos[0].public_id // Use the public ID of the first photo in the array
        });
        } else {
        // Handle the case when photo is not provided
        clientComment = new ClientComment({
            comment,
            skilledId,
            client_id,
            skill_id,
            star
        });
        }

        // Saving the comment
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

        //this is to update completed after rate
        const clientReq = await ClientReq.findByIdAndUpdate(
            id,
            { 
                reqStatus: "reqCompleted"
            });


        //this is for the notification
        // Get the name of the skilled user
        const clientInfo = await ClientInfo.findOne({ _id: client_id });
        const clientUsername = clientInfo.username;
        const skilled_id = finalSkillRate.skilled_id;
        // Create a notification after successfully creating new exp
        const notification = await SkilledNotification.create({
            skilled_id,
            message: `${clientUsername} marked completed and rated your skill labor.`,
            // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
            urlReact:`/viewAllSkilledRequest`
        });

        res.status(200).json({ message: "Successfully added." });
        
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
        .populate({
            path: "skill_id",
            match: { isDeleted: 0 },
            populate: {
                path: "skillName",
                select: "skill",
            },
        })
        .populate({
            path: "replies",
            match: { isDeleted: 0 },
            populate: [
                { 
                    path: "client_id",
                    select: "username"
                },
                {
                    path: "skilledId",
                    select: "username",
                },
            ],
            
        })
        .populate('skilledId')
        .populate('client_id')

        //count number of reviews
        const countComment = clientComment.filter(clientComment => clientComment.isDeleted === 0).length;
        const output = {
            clientComment,
            countComment
        }
        
        res.status(200).json(output)
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
        .populate({
            path: "skill_id",
            match: { isDeleted: 0 },
            populate: {
                path: "skillName",
                select: "skill",
            },
        })
        .populate('skilledId')
        .populate('client_id')
        
        res.status(200).json(clientComment)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
const getAllSkilledOneComment = async(req, res)=>{

    try{
        //this is to find skill for specific user
        const skill_id = req.params.skill_id;
        const skilled_id = req.skilledInfo._id;
        //get all query
        const clientComment = await ClientComment
        .find({skilledId:skilled_id, isDeleted: 0})
        .sort({createdAt: -1})
        .populate({
            path: "skill_id",
            match: { isDeleted: 0 },
            populate: {
                path: "skillName",
                select: "skill",
            },
        })
        .populate('skilledId')
        .populate('client_id')
        
        res.status(200).json(clientComment)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
//get one comment
const getOneClientComment = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

    //find query
    const clientComment = await ClientComment.findById({_id: id})
    .populate({
        path: "skill_id",
        match: { isDeleted: 0 },
        populate: {
          path: "skillName",
          select: "skill", // Assuming 'skill' is the field in 'AdminSkill' model that holds the skill name
        },
    })

    //check if not existing
    if (!clientComment){
        return res.status(404).json({error: 'Comment not found.'})
    }

    res.status(200).json(clientComment)   

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
            photo: uploadedPhotos.length > 0 ? uploadedPhotos : clientComment.photo,
            cloudinary_id: uploadedPhotos.length > 0 ? uploadedPhotos[0].public_id : clientComment.cloudinary_id,
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
  
      res.status(200).json({ message: "Successfully updated." });
  
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

//REPLY FOR CLIENT
//create reply
const createClientReply = async (req, res) => {
    try {
        const comment_id = req.params.comment_id;
        const client_id = req.clientInfo._id;
        const { reply } = req.body;
    
        if (reply === "") {
            return res.status(400).json({ error: "Please enter a reply." });
        }
    
        // Retrieve the comment using comment_id
        const comment = await ClientComment.findOne({ _id: comment_id });
    
        // Extract the skilledId from the comment object
        const skilledId = comment.skilledId;
  
        // Create query
        const createReply = await Reply.create({
            comment_id,
            client_id,
            reply,
        });
  
        // Notification
        // Get the name of the skilled user
        const clientInfo = await ClientInfo.findOne({ _id: client_id });
        const clientUsername = clientInfo.username;
    
        // Create a notification after successfully creating the reply
        const notification = await SkilledNotification.create({
            skilled_id: skilledId,
            message: `${clientUsername} replied to comment.`,
            // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
            urlReact: `/temporary`,
        });
        res.status(200).json({ message: "Successfully added." });
    }   catch (error) {
        res.status(404).json({ error: error.message });
    }
};
//get one reply, for skilled and client
const getOneClientReply = async(req, res)=>{
    const {id, comment_id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }
    //to retrieve only the comment corresponds to reply
    const comment = await ClientComment.findOne({ _id: comment_id });
    //find query
    const reply = await Reply
    .find({
        _id: id,
        comment_id: comment._id
    })

    //check if not existing
    if (!reply){
        return res.status(404).json({error: 'Reply not found.'})
    }

    res.status(200).json(reply)   

}
//update reply
const updateClientReply = async(req, res) =>{
    const {id, comment_id} = req.params    
    const {reply} = req.body
    const client_id = req.clientInfo._id

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

    //this is to get the skilledId for notification
    // Retrieve the comment using comment_id
    const comment = await ClientComment.findOne({ _id: comment_id });
    
    // Extract the skilledId from the comment object
    const skilledId = comment.skilledId;


    if(reply === ""){
        res.status(400).send({ message: "Please enter reply." });
        return
    }
    
    // IF OTHER CLIENT TRIES TO MODIFY THE REPLY
    // Retrieve the reply using id
    const replyFind = await Reply.findOne({ _id: id });

    // Extract the skilledId from the comment object
    const clientId = replyFind.client_id.toString();

    if (clientId !== client_id.toString()) {
        res.status(400).send({ message: 'This response does not pertain to you.' });
        return;
    }

    //delete query
    const replyUpdate = await Reply.findOneAndUpdate({_id: id},{
        ...req.body //get new value
    })
    
     //check if not existing
     if (!replyUpdate){
        return res.status(404).json({error: 'Reply not found.'})
    }

    //this is for the notification
    // Get the name of the skilled user
    const clientInfo = await ClientInfo.findOne({ _id: client_id });
    const clientUsername = clientInfo.username;
    // Create a notification after successfully creating new exp
    const notification = await SkilledNotification.create({
        skilled_id: skilledId,
        message: `${clientUsername} modified reply.`,
        // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
        urlReact:`/temporary`
    });
    res.status(200).json({ message: 'Successfully updated.'})
}
//delete reply
const deleteClientReply = async(req, res)=>{
    const {id} = req.params
    const client_id = req.clientInfo._id
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

    // IF OTHER CLIENT TRIES TO MODIFY THE REPLY
    // Retrieve the reply using id
    const replyFind = await Reply.findOne({ _id: id });

    // Extract the skilledId from the comment object
    const clientId = replyFind.client_id.toString();

    if (clientId !== client_id.toString()) {
        res.status(400).send({ message: 'This response does not pertain to you.' });
        return;
    }

    //delete query
    const replyDelete = await Reply.findOneAndUpdate({_id:id},
        {isDeleted:1})
    
    //check if not existing
    if (!replyDelete){
        return res.status(404).json({error: 'Comment not found.'})
    }

    res.status(200).json({ message: 'Successfully deleted.'})
}

//REPLY FOR SKILLED
const createSkilledReply = async(req, res)=>{

    try{
        const comment_id = req.params.comment_id
        const skilledId = req.skilledInfo._id;
        const { reply } = req.body;
        
        if(reply === ""){
            return res.status(400).json({error: "Please enter reply."})
        }

        // Retrieve the comment using comment_id
        const comment = await ClientComment.findOne({ _id: comment_id });
    
        // Extract the skilledId from the comment object
        const client_id = comment.client_id;

        //create query
        const createReply = await Reply.create({
            comment_id,
            skilledId,
            reply
        })
        //this is for the notification
        // Get the name of the skilled user
        const skilledInfo = await SkilledInfo.findOne({ _id: skilledId });
        const skilleddUsername = skilledInfo.username;
        // Create a notification after successfully creating new exp
        const notification = await ClientNotification.create({
            client_id: client_id,
            message: `${skilleddUsername} replied to comment.`,
            // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
            urlReact:`/temporary`
        });
        res.status(200).json({message: "Successfully added."})
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}
//update reply
const updateSkilledReply = async(req, res) =>{
    const {id, comment_id} = req.params    
    const {reply} = req.body
    const skilledID = req.skilledInfo._id

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

    //this is to get the skilledId for notification
    // Retrieve the comment using comment_id
    const comment = await ClientComment.findOne({ _id: comment_id });
    
    // Extract the skilledId from the comment object
    const client_id = comment.client_id;


    if(reply === ""){
        res.status(400).send({ message: "Please enter reply." });
        return
    }
    
    // IF OTHER CLIENT TRIES TO MODIFY THE REPLY
    // Retrieve the reply using id
    const replyFind = await Reply.findOne({ _id: id });

    // Extract the skilledId from the comment object
    const skilledId = replyFind.skilledId.toString();

    if (skilledId !== skilledID.toString()) {
        res.status(400).send({ message: 'This response does not pertain to you.' });
        return;
    }

    //delete query
    const replyUpdate = await Reply.findOneAndUpdate({_id: id},{
        ...req.body //get new value
    })
    
     //check if not existing
     if (!replyUpdate){
        return res.status(404).json({error: 'Reply not found.'})
    }

    //this is for the notification
    // Get the name of the skilled user
    const skilledInfo = await SkilledInfo.findOne({ _id: skilledID });
    const skilledUsername = skilledInfo.username;
    // Create a notification after successfully creating new exp
    const notification = await ClientNotification.create({
        client_id: client_id,
        message: `${skilledUsername} modified reply.`,
        // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
        urlReact:`/temporary`
    });
    res.status(200).json({ message: 'Successfully updated.'})
}
//delete reply
const deleteSkilledReply = async(req, res)=>{
    const {id} = req.params
    const skilled_id = req.skilledInfo._id
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

    // IF OTHER CLIENT TRIES TO MODIFY THE REPLY
    // Retrieve the reply using id
    const replyFind = await Reply.findOne({ _id: id });

    // Extract the skilledId from the comment object
    const skilledId = replyFind.skilledId.toString();

    if (skilledId !== skilled_id.toString()) {
        res.status(400).send({ message: 'This response does not pertain to you.' });
        return;
    }

    //delete query
    const replyDelete = await Reply.findOneAndUpdate({_id:id},
        {isDeleted:1})
    
    //check if not existing
    if (!replyDelete){
        return res.status(404).json({error: 'Comment not found.'})
    }

    res.status(200).json({ message: 'Successfully deleted.'})
}
//get one skilled skill first, 3 params
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
//get one skilled skill req
const getOneSkilledSkillClient = async(req, res)=>{
    const skilledWorkerId  = req.params._id//this is to get the _id of skilled worker first
    const skilledSkill  = req.params.skilledSkill;

    //find skill worker first
    const skilledInfo = await SkilledInfo.findOne({_id: skilledWorkerId })
    //check if not existing
    if (!skilledInfo){
        return res.status(404).json({error: 'Skilled Worker not found'})
    }

    const skillParams = await Skill.findOne({
        _id: skilledSkill
    })

    //find query
    const skill = await Skill.find({
        _id: skillParams._id,
        skilled_id: skilledInfo._id, 
    })
    .populate('skilled_id', 'username lname fname mname')
    .populate('skillName', 'skill')

    //check if not existing
    if (!skill){
        return res.status(404).json({error: 'Skill not found'})
    }

    res.status(200).json(skill)   

}

//REQUEST
//sending req to skilled worker
const createClientReq = async (req, res) => {
    
    try {
        const client_id = req.clientInfo._id;
        const { skill_id, skilled_id } = req.params; // Retrieve skill_id from params
        const { reqDate } = req.body;

        // If empty
        if (!reqDate) {
            return res.status(404).json({ error: 'Please enter a date.' });
        }
        if (reqDate === "") {
            res.status(404).json({ error: "Please enter a date." });
            return;
        }

         //check if the date in the req.body is less than date today
        const dateMoment = moment.utc(req.body.reqDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
        const validUntilDate = dateMoment.toDate();

        if (validUntilDate < new Date()) {
            return res.status(400).json({ error: 'Your request date is outdated. Please enter date now or date in the future.' });
        }

        // Check if the requested date is already saved in skilledDate collection
        const existingSkilledDate = await SkilledDate.findOne({
            skilledDate: reqDate,
            skilled_id,
            isDeleted: 0
        });

        if (existingSkilledDate) {
            res.status(400).json({ error: "The date is marked as unavailable. Please select another date." });
            return;
        }

        let newRequest = await ClientReq({
            reqDate: reqDate,
            skill_id: skill_id,
            skilled_id: skilled_id,
            client_id: client_id
        }).save();
        //mark as unavailable the date added in the req
        let newDate = await SkilledDate({
            skilledDate: reqDate,
            skilled_id: skilled_id,
            client_id: client_id
        }).save();

        //this is for the notification
        // Get the name of the skilled user
        const clientInfo = await ClientInfo.findOne({ _id: client_id });
        const clientUsername = clientInfo.username;
        const skilled_id_notif = newRequest.skilled_id;
        // Create a notification after successfully creating new exp
        const notification = await SkilledNotification.create({
            skilled_id,
            message: `${clientUsername} sent you a labor request.`,
            // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
            urlReact:`/Request/View`
        });

        res.status(200).json({ message: 'Successfully added.'});
        
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

//skilled worker receiving req, pending
const getAllSkilledReq = async(req, res)=>{

    try{
        //this is to find skill for specific user
        let skilled_id = req.skilledInfo._id
        //get all query
        const clientReq = await ClientReq.
        find({skilled_id, reqStatus:"pending", isDeleted: 0})
        .sort({createdAt: -1})
        .populate('skilled_id')
        // .populate('skill_id')
        .populate({
            path: "skill_id",
            match: { isDeleted: 0 },
            populate: {
              path: "skillName",
              select: "skill", // Assuming 'skill' is the field in 'AdminSkill' model that holds the skill name
            },
        })
        .populate('client_id')

        //check skilled worker if verified before viewing pending request from client
        const skilledInfo = await SkilledInfo.findOne({_id:req.skilledInfo.id})
        if(skilledInfo.userIsVerified === 0)
            return res.status(400).json({error: 'Cannot view pending requests. Please check if your baranggay clearance, nbi clearance and address are verified.'
        })
     
        const pendingCount = clientReq.filter(clientReq => clientReq.reqStatus === "pending").length;
        const output = {
            clientReq,
            pendingCount
        }
        
        res.status(200).json(output)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
//request accepted
const getAllSkilledReqAccepted = async(req, res)=>{

    try{
        //this is to find skill for specific user
        const skilled_id = req.skilledInfo._id
        //get all query
        const clientReq = await ClientReq.
        find({skilled_id, reqStatus:"reqAccepted", isDeleted: 0})
        .sort({createdAt: -1})
        .populate('skilled_id')
        // .populate('skill_id')
        .populate({
            path: "skill_id",
            match: { isDeleted: 0 },
            populate: {
              path: "skillName",
              select: "skill", // Assuming 'skill' is the field in 'AdminSkill' model that holds the skill name
            },
        })
        .populate('client_id')

        const acceptCount = clientReq.filter(clientReq => clientReq.reqStatus === "reqAccepted").length;
        const output = {
            clientReq,
            acceptCount
        }
        
        res.status(200).json(output)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
//completed
const getAllSkilledReqCompleted = async(req, res)=>{

    try{
        //this is to find skill for specific user
        const skilled_id = req.skilledInfo._id
        //get all query
        const clientReq = await ClientReq.
        find({skilled_id, reqStatus:"reqCompleted", isDeleted: 0})
        .sort({createdAt: -1})
        .populate('skilled_id')
        // .populate('skill_id')
        .populate({
            path: "skill_id",
            match: { isDeleted: 0 },
            populate: {
              path: "skillName",
              select: "skill", // Assuming 'skill' is the field in 'AdminSkill' model that holds the skill name
            },
        })
        .populate('client_id')
        
        const completeCount = clientReq.filter(clientReq => clientReq.reqStatus === "reqCompleted").length;
        const output = {
            clientReq,
            completeCount
        }

        res.status(200).json(output)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
const getAllSkilledReqCancelled = async(req, res)=>{

    try{
        //this is to find skill for specific user
        const skilled_id = req.skilledInfo._id
        //get all query
        const clientReq = await ClientReq
        .find({skilled_id, reqStatus:"reqCancelled", isDeleted: 0})
        .sort({createdAt: -1})
        .populate('skilled_id', 'username lname fname mname regionAddr cityAddr barangayAddr')
        // .populate('skill_id')
        .populate({
            path: "skill_id",
            match: { isDeleted: 0 },
            populate: {
              path: "skillName",
              select: "skill", // Assuming 'skill' is the field in 'AdminSkill' model that holds the skill name
            },
        })
        .populate('client_id')
        .populate({
            path: 'message.message',
            model: 'ClientCancelReq',
            select: 'reason',
            options: { lean: true },
        })

        const cancelledCount = clientReq.filter(clientReq => clientReq.reqStatus === "reqCancelled").length;
        const output = {
            clientReq,
            cancelledCount
        }
        
        res.status(200).json(output)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
//request accepted for skilled workers
const updateSkilledReqCompleted = async(req, res) =>{
    const skilled_id = req.skilledInfo._id;//this is for notification
    const {id} = req.params    
    const {reqStatus} = req.body

      //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }
    //check if skilled haven't update the status of client req
    if(reqStatus==="pending"){
        res.status(400).send({ message: "Please select request status." });
        return
    }

     //delete query
     const clientReq = await ClientReq.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!clientReq){
        return res.status(404).json({error: 'Request not found.'})
    }

    //this is for the notification
    // Get the name of the skilled user
    const skilledInfo = await SkilledInfo.findOne({ _id: skilled_id });
    const skilledUsername = skilledInfo.username;
    const client_id = clientReq.client_id;
    // Create a notification after successfully creating new exp
    const notification = await ClientNotification.create({
        client_id,
        message: `${skilledUsername} accepted your request.`,
        // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
        urlReact:`/Request/View`
    });
    res.status(200).json({ message: 'Successfully updated.'})
}
//client receiving req, pending
const getAllClientReq = async(req, res)=>{

    try{
        //this is to find skill for specific user
        const client_id = req.clientInfo._id
        //get all query
        const clientReq = await ClientReq
        .find({client_id, reqStatus:"pending", isDeleted: 0})
        .sort({createdAt: -1})
        .populate('skilled_id', 'username lname fname mname regionAddr provinceAddr cityAddr barangayAddr')
        // .populate('skill_id')
        .populate({
            path: "skill_id",
            match: { isDeleted: 0 },
            populate: {
              path: "skillName",
              select: "skill", // Assuming 'skill' is the field in 'AdminSkill' model that holds the skill name
            },
        })
        .populate('client_id')

        //this is for count
        const pendingCount = clientReq.filter(clientReq => clientReq.reqStatus === "pending").length;
        const output = {
            clientReq,
            pendingCount
        }
        
        res.status(200).json(output)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
//req accepted
const getAllClientReqAccepted = async(req, res)=>{

    try{
        //this is to find skill for specific user
        const client_id = req.clientInfo._id
        //get all query
        const clientReq = await ClientReq
        .find({client_id, reqStatus:"reqAccepted", isDeleted: 0})
        .sort({createdAt: -1})
        .populate('skilled_id', 'username lname fname mname regionAddr provinceAddr cityAddr barangayAddr contact')
        // .populate('skill_id')
        .populate({
            path: "skill_id",
            match: { isDeleted: 0 },
            populate: {
              path: "skillName",
              select: "skill", // Assuming 'skill' is the field in 'AdminSkill' model that holds the skill name
            },
        })
        .populate('client_id')

        const acceptedCount = clientReq.filter(clientReq => clientReq.reqStatus === "reqAccepted").length;
        const output = {
            clientReq,
            acceptedCount
        }
        
        res.status(200).json(output)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
//req completed
const getAllClientReqCompleted = async(req, res)=>{

    try{
        //this is to find skill for specific user
        const client_id = req.clientInfo._id
        //get all query
        const clientReq = await ClientReq
        .find({client_id, reqStatus:"reqCompleted", isDeleted: 0})
        .sort({createdAt: -1})
        .populate('skilled_id', 'username lname fname mname regionAddr provinceAddr cityAddr barangayAddr')
        // .populate('skill_id')
        .populate({
            path: "skill_id",
            match: { isDeleted: 0 },
            populate: {
              path: "skillName",
              select: "skill", // Assuming 'skill' is the field in 'AdminSkill' model that holds the skill name
            },
        })
        .populate('client_id')

        const completeCount = clientReq.filter(clientReq => clientReq.reqStatus === "reqCompleted").length;
        const output = {
            clientReq,
            completeCount
        }
        
        res.status(200).json(output)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

const getAllClientReqCancelled = async(req, res)=>{

    try{
        //this is to find skill for specific user
        const client_id = req.clientInfo._id
        //get all query
        const clientReq = await ClientReq
        .find({client_id, reqStatus:"reqCancelled", isDeleted: 0})
        .sort({createdAt: -1})
        .populate('skilled_id', 'username lname fname mname regionAddr provinceAddr cityAddr barangayAddr')
        // .populate('skill_id')
        .populate({
            path: "skill_id",
            match: { isDeleted: 0 },
            populate: {
              path: "skillName",
              select: "skill", // Assuming 'skill' is the field in 'AdminSkill' model that holds the skill name
            },
        })
        .populate('client_id')
        .populate({
            path: 'message.message',
            model: 'ClientCancelReq',
            select: 'reason',
            options: { lean: true },
        })

        const cancelledCount = clientReq.filter(clientReq => clientReq.reqStatus === "reqCancelled").length;
        const output = {
            clientReq,
            cancelledCount
        }
        
        res.status(200).json(output)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
//update date, this is for pending
const updateClientSkilledReqDate = async(req, res) =>{
    
    const client_id = req.clientInfo._id;//this is for notification
    const {id, skilled_id} = req.params    
    const { reqDate } = req.body;

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

    // If empty
    if (!reqDate) {
        return res.status(404).json({ error: 'Please enter a date.' });
    }
    // If empty
    if (reqDate === "") {
        res.status(404).json({ error: "Please enter a date." });
        return;
    }

    //check if the date in the req.body is less than date today
    const dateMoment = moment.utc(req.body.reqDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
    const validUntilDate = dateMoment.toDate();

    if (validUntilDate < new Date()) {
        return res.status(400).json({ error: 'Your request date is outdated. Please enter date now or date in the future.' });
    }

    // Check if the requested date is already saved in skilledDate collection
    const existingSkilledDate = await SkilledDate.findOne({
        skilledDate: reqDate,
        skilled_id,
        isDeleted: 0
    });

    if (existingSkilledDate) {
        res.status(400).json({ error: "The date is marked as unavailable. Please select another date." });
        return;
    }

    
    // Find the ClientReq record based on the provided id
    const clientReqFind = await ClientReq.findById(id);

    if (!clientReqFind) {
        return res.status(404).json({ error: 'Request not found.' });
    }

    // Extract the reqDate from the clientReq record
    const reqDateFind = clientReqFind.reqDate;

    // Find the matching date in the SkilledDate collection
    const findSkilledDate = await SkilledDate.findOne({
        skilledDate: reqDateFind,
        isDeleted: 0
    });

    // Check if a matching date was found
    if (findSkilledDate) {
        console.log('Matching date found in SkilledDate collection');
    } else {
        console.log('No matching date found in SkilledDate collection');
    }

    const matchedDateId = findSkilledDate._id;

    // Update the date in the SkilledDate collection
    const updatedSkilledDate = await SkilledDate.findByIdAndUpdate(
        matchedDateId,
        { skilledDate: reqDate },
        { new: true }
    );

    //update client req date
    const clientReq = await ClientReq.findOneAndUpdate({_id: id},{
        reqDate: reqDate //get new value
    })

    //check if not existing
    if (!clientReq){
        return res.status(404).json({error: 'Request not found.'})
    }

    //this is for the notification
    // Get the name of the skilled user
    const clientInfo = await ClientInfo.findOne({ _id: client_id });
    const clientUsername = clientInfo.username;
    const skilled_idNotif = clientReq.skilled_id;
    // Create a notification after successfully creating new exp
    const notification = await SkilledNotification.create({
        skilled_id: skilled_idNotif,
        message: `${clientUsername} updated labor date.`,
        // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
        urlReact:`/Request/View`
    });
    res.status(200).json({ message: 'Successfully updated.'})
}
//update client req completed
const updateClientSkilledReqCompleted = async(req, res) =>{
    const client_id = req.clientInfo._id;//this is for notification
    const {id} = req.params    
    const {reqStatus} = req.body

      //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }
    //check if skilled haven't update the status of client req
    if(reqStatus==="pending"){
        res.status(400).send({ message: "Please select request status." });
        return
    }

     //delete query
     const clientReq = await ClientReq.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!clientReq){
        return res.status(404).json({error: 'Request not found.'})
    }

    //this is for the notification
    // Get the name of the skilled user
    const clientInfo = await ClientInfo.findOne({ _id: client_id });
    const clientUsername = clientInfo.username;
    const skilled_id = clientReq.skilled_id;
    // Create a notification after successfully creating new exp
    const notification = await SkilledNotification.create({
        skilled_id,
        message: `${clientUsername} marked the labor completed.`,
        // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
        urlReact:`/Request/View`
    });
    res.status(200).json({ message: 'Successfully updated.'})
}
//update client req
const cancelClientSkilledReq = async(req, res) =>{
    const client_id = req.clientInfo._id;//this is for notification
    // const {id} = req.params    
    const {message} = req.body 
        // Check for duplicate messages in request body
    const hasDuplicates = message.some((obj, index) => {
        if (obj.message.trim() === '') {
            return res.status(404).json({error: 'Please select a reason.'})
        }

        let foundDuplicate = false;
        message.forEach((innerObj, innerIndex) => {
        if (index !== innerIndex && obj.message === innerObj.message) {
            foundDuplicate = true;
        }
        });
        return foundDuplicate;
    });

    if (hasDuplicates) {
        return res.status(400).json({ error: 'Please remove repeating reason.' });
    }

    await ClientReq.updateOne({  _id: req.params.id }, { $unset: { message: 1 } });

    // Find the ClientReq record based on the provided id
    const clientReqFind = await ClientReq.findById({_id: req.params.id});

    if (!clientReqFind) {
        return res.status(404).json({ error: 'Request not found.' });
    }

    // Extract the reqDate from the clientReq record
    const reqDateFind = clientReqFind.reqDate;

    // Find the matching date in the SkilledDate collection
    const findSkilledDate = await SkilledDate.findOne({
        skilledDate: reqDateFind,
        isDeleted: 0
    });

    //if it has corresponding date in the skilled date
    let matchedDateId;
    // Check if a matching date was found
    if (findSkilledDate) {
        matchedDateId = findSkilledDate._id;
    } 
   
    // Update the date in the SkilledDate collection
    const updatedSkilledDate = await SkilledDate.findByIdAndUpdate(
        matchedDateId,
        { isDeleted: 1 },
        { new: true }
    );

     //delete query
    const clientReq = await ClientReq.findOneAndUpdate(
        { _id: req.params.id},
        {
            $push: { message },
            $set: { reqStatus:"reqCancelled" },
        },
        { new: true }
    )

    //this is for the notificatio
    //notification
    const clientSkilledNotif = await ClientReq.findOne({  _id: req.params.id })
    .populate('message');
    console.log(clientSkilledNotif)
    const messageIds = clientSkilledNotif.message.map(msg => msg.message)
    let messageNotif = '';
        const messages = await Promise.all(
            messageIds.map(async (msgId) => {
                if (msgId) {
                const msg = await ReasonCancelled.findOne({ _id: msgId });
                return msg.reason;
                }
                return null;
            })
        );
         // Get the name of the skilled user
        const clientInfo = await ClientInfo.findOne({ _id: client_id });
        const clientUsername = clientInfo.username;
        const skilled_id = clientReq.skilled_id;

        messageNotif = `${clientUsername} cancelled request. Reasons: ${messages.join(', ')}.`;

    // Create a notification after successfully creating new exp
    const notification = await SkilledNotification.create({
        skilled_id,
        message: messageNotif,
        // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
        urlReact:`/Request/View`
    });

    res.status(200).json({ message: 'Successfully updated.'})
}
const deleteClientSkilledReq = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const clientReq = await ClientReq.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!clientReq){
        return res.status(404).json({error: 'Request not found'})
    }

    res.status(200).json({ message: 'Request cancelled.'})

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
    getAllSkilledOneComment,
    getOneClientComment,
    deleteClientComment,
    createClientReply,
    updateClientComment,
    getOneSkilledSkill,
    getOneSkilledSkillClient,
    createClientReq,
    getOneClientReply,
    updateClientReply,
    deleteClientReply,
    createSkilledReply,
    updateSkilledReply,
    deleteSkilledReply,
    getAllSkilledReq,
    getAllSkilledReqAccepted,
    getAllSkilledReqCompleted,
    getAllSkilledReqCancelled,
    updateSkilledReqCompleted,
    getAllClientReq,
    getAllClientReqAccepted,
    getAllClientReqCompleted,
    getAllClientReqCancelled,
    updateClientSkilledReqDate,
    updateClientSkilledReqCompleted,
    cancelClientSkilledReq,
    deleteClientSkilledReq
}