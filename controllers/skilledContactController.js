const Contact = require('../models/skilledContact')
const Info = require('../models/skilledInfo')
const mongoose = require('mongoose')

//CREATE contact
const createContact = async(req, res)=>{
    const {
            contactType, 
            contactNo, 
            emailAcc} = req.body
    
    //check empty fields
    let emptyFields = []
    
    if(!contactType){
        emptyFields.push('contactType')
    }
    if(!contactNo){
        emptyFields.push('contactNo')
    }

    //send message if there is an empty fields
    if(emptyFields.length >0){
        return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
    }
    
    try{
        //this is to assign the job to a specific client user, get id from clientInfo
        const skilled_id = req.skilledInfo._id

        //create query
        const contact = await Contact.create({
            contactType, 
            contactNo, 
            emailAcc,
            skilled_id 
        })
        res.status(200).json(contact)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

//GET all contact
const getAllContact = async(req, res)=>{

    try{
        //this is to find contact for specific user
        const skilled_id = req.skilledInfo._id

        //get all query
        const contact = await Contact.find({skilled_id}).sort({createdAt: -1})
        .populate('skilled_id')
        res.status(200).json(contact)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET one contact
const getOneContact = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

    //find query
    const contact = await Contact.findById({_id: id})

    //check if not existing
    if (!contact){
        return res.status(404).json({error: 'Contact not found.'})
    }

    res.status(200).json(contact)   

}

//UPDATE contact
const updateContact = async(req, res) =>{
    const {id} = req.params    

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

     //delete query
     const contact = await Contact.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!contact){
        return res.status(404).json({error: 'Contact not found.'})
    }

    res.status(200).json({message: 'Successfully updated'})
}

//DELETE contact
const deleteContact = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

    //delete query
    const contact = await Contact.findOneAndDelete({_id: id})
    
    //check if not existing
    if (!contact){
        return res.status(404).json({error: 'Contact not found'})
    }

    res.status(200).json({message: 'Successfully deleted'})

}

module.exports = {
    createContact,
    getAllContact,
    getOneContact,
    updateContact,
    deleteContact
}