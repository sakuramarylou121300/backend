const Address = require('../models/clientAddress')
const Info = require('../models/clientInfo')
const mongoose = require('mongoose')

//CREATE address
const createAddress = async(req, res)=>{
    const {
            houseNo, 
            street, 
            barangay,
            city,
            prov} = req.body
    
    //check empty fields
    let emptyFields = []
    
    if(!houseNo){
        emptyFields.push('houseNo')
    }
    if(!street){
        emptyFields.push('street')
    }
    if(!barangay){
        emptyFields.push('barangay')
    }
    if(!city){
        emptyFields.push('city')
    }
    if(!prov){
        emptyFields.push('prov')
    }

    //send message if there is an empty fields
    if(emptyFields.length >0){
        return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
    }
    
    try{
        //this is to assign the job to a specific client user, get id from clientInfo
        const client_id = req.clientInfo._id

        //create query
        const address = await Address.create({
            houseNo, 
            street, 
            barangay,
            city,
            prov,
            client_id
        })
        res.status(200).json(address)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

//GET all address
const getAllAddress = async(req, res)=>{

    try{
        //this is to find contact for specific user
        const client_id = req.clientInfo._id

        //get all query
        const address = await Address.find({client_id}).sort({createdAt: -1})
        .populate('client_id')
        res.status(200).json(address)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET one address
const getOneAddress = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

    //find query
    const address = await Address.findById({_id: id})

    //check if not existing
    if (!address){
        return res.status(404).json({error: 'Address not found.'})
    }

    res.status(200).json(address)   

}

//UPDATE address
const updateAddress = async(req, res) =>{
    const {id} = req.params    

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

     //delete query
     const address = await Address.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!address){
        return res.status(404).json({error: 'Address not found.'})
    }

    res.status(200).json({message: 'Successfully updated'})
}

//DELETE address
const deleteAddress = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

    //delete query
    const address = await Address.findOneAndDelete({_id: id})
    
    //check if not existing
    if (!address){
        return res.status(404).json({error: 'Address not found'})
    }

    res.status(200).json({message: 'Successfully deleted'})

}

module.exports = {
    createAddress,
    getAllAddress,
    getOneAddress,
    updateAddress,
    deleteAddress
}