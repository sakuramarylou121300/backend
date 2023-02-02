const SkilledBill = require('../models/skilledBill')  
const Info = require('../models/skilledInfo')
const mongoose = require('mongoose')

//CREATE skill cert
const createSkilledBill = async(req, res)=>{
    const {billPhoto,
        billIssuedOn} = req.body
    
    //check empty fields
    let emptyFields = []
    // if(!billPhoto){
    //     emptyFields.push('billPhoto')
    // }
    if(!billIssuedOn){
        emptyFields.push('billIssuedOn')
    }

    //send message if there is an empty fields
    if(emptyFields.length >0){
        return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
    }
    
    try{
        //this is to assign the job to a specific client user, get id from clientInfo
        const skilled_id = req.skilledInfo._id

        const billCheck = await SkilledBill.findOne({
            billPhoto:billPhoto,
            billIssuedOn:billIssuedOn,
            skilled_id:skilled_id,
            isDeleted: 0
        })
        
        if(billCheck){
            return res.status(400).json({error: "Bill exists in this user, please provide your new receipt."})
        }
        
        //create query
        const skilledBill = await SkilledBill.create({
            billPhoto,
            billIssuedOn,
            skilled_id
        })
        res.status(200).json(skilledBill)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

//GET all skill cert
const getAllSkilledBill = async(req, res)=>{

    try{
        //this is to find skill for specific user
        const skilled_id = req.skilledInfo._id
        //get all query
        const skilledBill = await SkilledBill.find({skilled_id, isDeleted: 0}).sort({createdAt: -1})
        // .populate('skilled_id')
        res.status(200).json(skilledBill)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET one skill cert
const getOneSkilledBill = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const skilledBill = await SkilledBill.findById({_id: id})

    //check if not existing
    if (!skilledBill){
        return res.status(404).json({error: 'Bill not found'})
    }

    res.status(200).json(skilledBill)   

}

//UPDATE skill cert
const updateSkilledBill = async(req, res) =>{
    const {id} = req.params  
    const {billPhoto,
        billIssuedOn} = req.body  
    const skilled_id = req.skilledInfo._id

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    const billCheck = await SkilledBill.findOne({
        billPhoto:billPhoto,
        billIssuedOn:billIssuedOn,
        skilled_id:skilled_id,
        isDeleted: 0
    })
    
    if(billCheck){
        return res.status(400).json({error: "Bill exists in this user, please provide your new receipt."})
    }

     //delete query
     const skilledBill = await SkilledBill.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!skilledBill){
        return res.status(404).json({error: 'Bill not found'})
    }

    res.status(200).json(skilledBill)
}

//DELETE skill cert
const deleteSkilledBill = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const skilledBill = await SkilledBill.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!skilledBill){
        return res.status(404).json({error: 'Bill not found'})
    }

    res.status(200).json(skilledBill)

}

module.exports = {
    createSkilledBill,
    getAllSkilledBill,
    getOneSkilledBill,
    updateSkilledBill,
    deleteSkilledBill
}