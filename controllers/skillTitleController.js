const Title = require('../models/skillTitle')   
const SkilledInfo = require('../models/skilledInfo')
const SkilledNotification = require('../models/skilledNotification')
const AdminSkill = require('../models/adminSkill')

const mongoose = require('mongoose')

const createTitle = async(req, res)=>{

    try{
        const {skill_id, title, } = req.body

        //required

        if(skill_id === "Select" || skill_id === "Empty" || skill_id === "" || title === ""){
            return res.status(400).json({error: "Please check your entered data."})
        }

        if(skill_id === "Select"){
            return res.status(400).json({error: "Please select skill."})
        }

        if(title === ""){
            return res.status(400).json({error: "Please enter skill title."})
        }

        //if existing
        const skillTitle = await Title.findOne({
            skill_id:skill_id,
            title:title,
            isDeleted: 0
        })

        if(skillTitle){
            return res.status(400).json({error: "Title already exists in the selected skill."})
        }
        
        const skillTitleDeleted = await Title.findOne({
            skill_id:skill_id,
            title:title,
            isDeleted: 1
        })

        if(skillTitleDeleted){
            return res.status(400).json({error: `The skill with title that you have entered has been deleted. Do you want to restore it?`})
        }
        //create new skill
        const newTitle = new Title({title, skill_id})
        await newTitle.save()

        //notification for new skill title
        //notification for all 
        // Fetch all Titleed workers and clients
        const skilledWorkers = await SkilledInfo.find();

        //find the value of categorySkill
        const categorySkillValue = await AdminSkill.findOne({
            _id: skill_id
        })
        console.log(categorySkillValue)
        const skillValue = categorySkillValue.skill
        console.log(skillValue)
 
        // Create notifications for all Titleed workers
        for (const skilledWorker of skilledWorkers) {
            await SkilledNotification.create({
                skilled_id: skilledWorker._id,
                message: `${title} is added in the skill of ${skillValue}.`,
                urlReact: `/Profile/Setting`,
            });
        }
        res.status(200).json(newTitle)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}
//get the title depending on the selected skill
const getAllSkillTitle = async(req, res)=>{
    const skill_id = req.params.skill_id; 
    try{
        const title = await Title.find({isDeleted:0,skill_id:skill_id})
        .sort({title: 1})
        .populate('skill_id')
        // .populate('province_id').sort({ 'province_id.province': 1 })
        res.status(200).json(title)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

const getAllTitle = async(req, res)=>{
    try{
        const title = await Title.find({isDeleted: 0})
        .populate('skill_id')
        .sort({title: 1})
        res.status(200).json(title)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

const getOneTitle = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const title = await Title.findById({_id: id})
    .populate('skill_id')

    //check if not existing
    if (!title){
        return res.status(404).json({error: 'Title not found'})
    }

    res.status(200).json(title)   
}

const updateSkillTitle = async(req, res) =>{
    const {id} = req.params    
    const {skill_id, title} = req.body

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //required
    if(skill_id === "Select"){
        return res.status(400).json({error: "Please select skill."})
    }

    if(title === ""){
        return res.status(400).json({error: "Please enter skill title."})
    }
    
    const existingTitle = await Title.findOne({ skill_id, title,  isDeleted: 0 });
        if (existingTitle) {
            return res.status(400).json({ message: "Title already exists in this skill." });
        }
     //delete query
     const skillTitle = await Title.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!skillTitle){
        return res.status(404).json({error: 'Title not found'})
    }

    //notification for new skill title
    //notification for all 
    // Fetch all Titleed workers and clients
    const skilledWorkers = await SkilledInfo.find();

    //find the value of categorySkill
    const categorySkillValue = await AdminSkill.findOne({
        _id: skill_id
    })
    console.log(categorySkillValue)
    const skillValue = categorySkillValue.skill
    console.log(skillValue)

    // Create notifications for all Titleed workers
    for (const skilledWorker of skilledWorkers) {
        await SkilledNotification.create({
            skilled_id: skilledWorker._id,
            message: `Newly updated title ${title} in the skill of ${skillValue}.`,
            urlReact: `/Profile/Setting`,
        });
    }

    res.status(200).json({message: "Successfully added."})//nadagdag
}

const deleteTitle = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const title = await Title.findOneAndUpdate({_id: id},
        {isDeleted:1}
        )
    
    //check if not existing
    if (!title){
        return res.status(404).json({error: 'Title not found'})
    }

    res.status(200).json(title)

}

//RESTORE
const getAllSkillDeleted = async(req, res)=>{
    try{
        const { skill_id, title } = req.params;
        const skillTitle = await Title.find({skill_id, title, isDeleted:1}).sort({skill: 1})
        res.status(200).json(skillTitle)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

const restoreSkill = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const skillTitle = await Title.findOneAndUpdate({_id: id},
        {isDeleted:0})
    
    //check if not existing
    if (!skillTitle){
        return res.status(404).json({error: 'Skill not found'})
    }

    res.status(200).json(skillTitle)

}
module.exports = {
    createTitle,
    getAllTitle,
    getAllSkillTitle, 
    getOneTitle,
    updateSkillTitle,
    deleteTitle,
    getAllSkillDeleted,
    restoreSkill
}