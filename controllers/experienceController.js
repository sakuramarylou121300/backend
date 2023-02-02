const Experience = require('../models/experience') 
const Info = require('../models/skilledInfo')
const mongoose = require('mongoose')

//CREATE skill exp
const createExperience = async(req, res)=>{
    const {categorySkill,
            title,
            desc,
            photo,
            refLname, 
            refFname,
            refMname,
            refPosition,
            refOrg,
            refContactNo} = req.body
    
    //check empty fields
    let emptyFields = []
    if(!categorySkill){
        emptyFields.push('categorySkill')
    }
    if(!title){
        emptyFields.push('title')
    }
    if(!photo){
        emptyFields.push('photo')
    }
    if(!photo){
        emptyFields.push('refLname')
    }
    if(!photo){
        emptyFields.push('refFname')
    }
    if(!photo){
        emptyFields.push('refLMame')
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
    
    try{
        //this is to assign the job to a specific client user, get id from clientInfo
        const skilled_id = req.skilledInfo._id

        const expCheck = await Experience.findOne({
            categorySkill:categorySkill,
            title:title,
            desc:desc,
            photo:photo,
            refLname:refLname, 
            refFname:refFname,
            refMname:refMname,
            refPosition:refPosition,
            refOrg:refOrg,
            refContactNo:refContactNo,
            skilled_id:skilled_id,
            isDeleted: 0
        })
        
        if(expCheck){
            return res.status(400).json({error: "Work experience already exists in this user."})
        }
        
        //create query
        const experience = await Experience.create({
            categorySkill,
            title,
            desc,
            photo,
            refLname,
            refFname,
            refMname,
            refPosition,
            refOrg,
            refContactNo,
            skilled_id
        })
        res.status(200).json(experience)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

//GET all skill exp
const getAllExperience = async(req, res)=>{

    try{
        //this is to find skill for specific user
        const skilled_id = req.skilledInfo._id
        //get all query
        const experience = await Experience.find({skilled_id, isDeleted: 0}).sort({createdAt: -1})
        .populate('skilled_id')
        res.status(200).json(experience)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET one skill exp
const getOneExperience = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const experience = await Experience.findById({_id: id})

    //check if not existing
    if (!experience){
        return res.status(404).json({error: 'Skill Experience not found'}) 
    }

    res.status(200).json(experience)   

}

//update or edit address
const editRefName = async(req,res) =>{
    // const arrayId = req.params.arrayId;
    const {lname, fname, mname} = req.body

    try{
        // const skilled_idd = req.skilledInfo._id
        const {id} = req.params   
        
        const experience = await Experience.findByIdAndUpdate(
        {_id: id},
    {
        $set:{
            "refName.lname":lname,
            "refName.fname":fname,
            "refName.mname":mname
        }
    })
    res.status(200).json(experience)

    }catch(error){
        res.status(404).json({error: error.message})
    }
    
}
//UPDATE skill exp
const updateExperience = async(req, res) =>{
    const {id} = req.params 
    const {categorySkill,
        title,
        desc,
        photo,
        refLname, 
        refFname,
        refMname,
        refPosition,
        refOrg,
        refContactNo} = req.body   
        const skilled_id = req.skilledInfo._id

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }
    const expCheck = await Experience.findOne({
        categorySkill:categorySkill,
        title:title,
        desc:desc,
        photo:photo,
        refLname:refLname, 
        refFname:refFname,
        refMname:refMname,
        refPosition:refPosition,
        refOrg:refOrg,
        refContactNo:refContactNo,
        skilled_id:skilled_id,
        isDeleted: 0
    })
    
    if(expCheck){
        return res.status(400).json({error: "Work experience already exists in this user."})
    }
     //delete query
     const experience = await Experience.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!experience){
        return res.status(404).json({error: 'Skill Experience not found'})
    }

    res.status(200).json(experience)
}

//DELETE skill exp
const deleteExperience = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const experience = await Experience.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!experience){
        return res.status(404).json({error: 'Skill Experience not found'})
    }

    res.status(200).json(experience)

}
module.exports = {
    createExperience,
    getAllExperience,
    getOneExperience,
    updateExperience,
    editRefName,
    deleteExperience
}