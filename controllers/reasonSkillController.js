const ReasonSkill = require('../models/reasonSkill')  
const mongoose = require('mongoose')

//CREATE ReasonSkill
const createReasonSkill = async(req, res)=>{

    try{
        const {reason} = req.body
        
        const reasonSkillCheck = await ReasonSkill.findOne({
            reason,
            reasonType: "skill",
            isDeleted: 0
        })
        
        if(reasonSkillCheck){
            return res.status(400).json({error: "Reason already exist."})
        }

        //create new skill
        const newReasonSkill = new ReasonSkill({
            reason,
            reasonType: "skill"
        })
        await newReasonSkill.save()
        res.status(200).json({message: "Successfully added."})
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

const createReasonTitle = async(req, res)=>{

    try{
        const {reason} = req.body
        
        const reasonSkillCheck = await ReasonSkill.findOne({
            reason,
            reasonType: "title",
            isDeleted: 0
        })
        
        if(reasonSkillCheck){
            return res.status(400).json({error: "Reason already exist."})
        }

        //create new skill
        const newReasonSkill = new ReasonSkill({
            reason,
            reasonType: "title"
        })
        await newReasonSkill.save()
        res.status(200).json({message: "Successfully added."})
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

//GET ALL ReasonSkill
const getAllReasonSkill = async(req, res)=>{
    try{
        const reasonSkill = await ReasonSkill.find({
            reasonType: "skill",
            isDeleted: 0
        })
        .sort({reason: 1 })
        res.status(200).json(reasonSkill)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

const getAllReasonTitle = async(req, res)=>{
    try{
        const reasonSkill = await ReasonSkill.find({
            reasonType: "title",
            isDeleted: 0
        })
        .sort({reason: 1 })
        res.status(200).json(reasonSkill)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

//GET one ReasonSkill
const getOneReasonSkill = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const reasonSkill = await ReasonSkill.findById({_id: id})

    //check if not existing
    if (!reasonSkill){
        return res.status(404).json({error: 'Reason not found'})
    }

    res.status(200).json(reasonSkill)   
}

//UPDATE ReasonSkill
const updateReasonSkill = async(req, res) =>{
    const {id} = req.params    
    const {reason} = req.body

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }
    const existingReasonSkill = await ReasonSkill.findOne({reason, isDeleted:0});
        if (existingReasonSkill) {
            return res.status(400).json({ message: "Reason already exists." });
        }
     //delete query
     const adminReasonSkill = await ReasonSkill.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!adminReasonSkill){
        return res.status(404).json({error: 'ReasonSkill not found'})
    }

    res.status(200).json({message: "Successfully updated."})
}

//DELETE ReasonSkill
const deleteReasonSkill = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const reasonSkill = await ReasonSkill.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!reasonSkill){
        return res.status(404).json({error: 'Reason not found'})
    }

    res.status(200).json({message: "Successfully deleted."})

}
module.exports = {
    createReasonSkill,
    createReasonTitle,
    getAllReasonSkill,
    getAllReasonTitle,
    getOneReasonSkill,
    updateReasonSkill,
    deleteReasonSkill
}