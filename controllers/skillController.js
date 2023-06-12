const Skill = require('../models/skill')
const SkilledInfo = require('../models/skilledInfo')
const Notification = require('../models/adminNotification')
const AdminInfo = require('../models/adminInfo')
const ClientInfo = require('../models/clientInfo')

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

//this is for the rating
// const rating = async(req, res)=>{
//     // const {_id} = req.clientInfo //to get who rate the skille worker
//     const _id = req.clientInfo._id;
//     const {star, skill_id, comment} = req.body

//     try{
//         const skill = await Skill.findById(skill_id);

//         //find if client already rated the product
//         let alreadyRated = skill.ratings.find((client_id)=>client_id.postedby.toString()=== _id.toString()
//         )   
//         if(alreadyRated){
//             const updateRating = await Skill.updateOne(
//                 {
//                     ratings:{$elemMatch: alreadyRated },
//                 },
//                 {
//                     $set:{"ratings.$.star":star, "ratings.$.comment":comment}
//                 },{
//                     new: true
//                 })
//                 // res.json(updateRating)
//         }else{
//             const rateSkill = await Skill.findByIdAndUpdate(
//                 skill_id, {
//                     $push:{
//                         ratings:{
//                             star:star,
//                             comment: comment,
//                             postedby: _id,
//                         }
//                     }
//                 }, {new: true}
//             )
//             // res.json(rateSkill)
//             }
            
//         //this is to get all ratings
//         const getAllRatings = await Skill.findById(skill_id)
//         let totalRating = getAllRatings.ratings.length;
//         //find the sum of arrray from totalRating with the use of reduce 
//         let ratingSum = getAllRatings.ratings.map((item)=>item.star)
//         .reduce((prev, curr)=>prev + curr, 0)
//         //sum divided by the number of posted rating
//         let actualRating = Math.round(ratingSum/totalRating)
//         let finalSkillRate = await Skill.findByIdAndUpdate(skill_id, {
//             totalrating: actualRating
//         }, {new: true
//         })
//         res.json(finalSkillRate)
//     }
//     catch(error){
//         throw new Error(error)
//     }
// }
const rating = async (req, res) => {
    const _id = req.clientInfo._id;
    const { star, comment } = req.body;
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
                $set: { "ratings.$.star": star, "ratings.$.comment": comment },
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
                comment: comment,
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

module.exports = {
    createSkills,
    createSkill,
    getAllSkill,
    getOneSkill,
    updateSkill,
    deleteSkill,
    rating
}