const ReasonDeact = require('../models/reasonDeact')  
const mongoose = require('mongoose')

//CREATE ReasonDeact
const createReasonDeact = async(req, res)=>{

    try{
        const {reason} = req.body
        
        const reasonDeactCheck = await ReasonDeact.findOne({
            reason,
            isDeleted: 0
        })
        
        if(reasonDeactCheck){
            return res.status(400).json({error: "Reason already exist."})
        }

        //create new skill
        const newReasonDeact = new ReasonDeact({reason})
        await newReasonDeact.save()
        res.status(200).json(newReasonDeact)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

//GET ALL ReasonDeact
const getAllReasonDeact = async(req, res)=>{
    try{
        const reasonDeact = await ReasonDeact.find({isDeleted: 0})
        .sort({reason: 1 })
        res.status(200).json(reasonDeact)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

//GET one ReasonDeact
const getOneReasonDeact = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const reasonDeact = await ReasonDeact.findById({_id: id})

    //check if not existing
    if (!reasonDeact){
        return res.status(404).json({error: 'Reason not found'})
    }

    res.status(200).json(reasonDeact)   
}

//UPDATE ReasonDeact
const updateReasonDeact = async(req, res) =>{
    const {id} = req.params    
    const {reason} = req.body

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }
    const existingReasonDeact = await ReasonDeact.findOne({reason, isDeleted:0});
        if (existingReasonDeact) {
            return res.status(400).json({ message: "Reason already exists." });
        }
     //delete query
     const adminReasonDeact = await ReasonDeact.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!adminReasonDeact){
        return res.status(404).json({error: 'ReasonDeact not found'})
    }

    res.status(200).json(adminReasonDeact)
}

//DELETE ReasonDeact
const deleteReasonDeact = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const reasonDeact = await ReasonDeact.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!reasonDeact){
        return res.status(404).json({error: 'Reason not found'})
    }

    res.status(200).json(reasonDeact)

}
module.exports = {
    createReasonDeact,
    getAllReasonDeact,
    getOneReasonDeact,
    updateReasonDeact,
    deleteReasonDeact
}