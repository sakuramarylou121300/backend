const Reason = require('../models/clientCancelReq')  
const mongoose = require('mongoose')

//CREATE reason
const createReasonReq = async(req, res)=>{

    try{
        const {reason} = req.body
        
        const reasonCheck = await Reason.findOne({
            reason,
            isDeleted: 0
        })
        
        if(reasonCheck){
            return res.status(400).json({error: "Reason already exist."})
        }

        //create new skill
        const newReason = new Reason({reason})
        await newReason.save()
        res.status(200).json(newReason)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

//GET ALL reason
const getAllReasonReq = async(req, res)=>{
    try{
        const reason = await Reason.find({isDeleted: 0})
        .sort({reason: 1 })
        res.status(200).json(reason)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

//GET one reason
const getOneReasonReq = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const reason = await Reason.findById({_id: id})

    //check if not existing
    if (!reason){
        return res.status(404).json({error: 'Reason not found'})
    }

    res.status(200).json(reason)   
}

//UPDATE reason
const updateReasonReq = async(req, res) =>{
    const {id} = req.params    
    const {reason} = req.body

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }
    const existingReason = await Reason.findOne({reason, isDeleted:0});
        if (existingReason) {
            return res.status(400).json({ message: "Reason already exists." });
        }
     //delete query
     const adminReason = await Reason.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!adminReason){
        return res.status(404).json({error: 'Reason not found'})
    }

    res.status(200).json(adminReason)
}

//DELETE reason
const deleteReasonReq = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const reason = await Reason.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!reason){
        return res.status(404).json({error: 'Reason not found'})
    }

    res.status(200).json(reason)

}
module.exports = {
    createReasonReq,
    getAllReasonReq,
    getOneReasonReq,
    updateReasonReq,
    deleteReasonReq
}