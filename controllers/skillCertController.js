const Certificate = require('../models/skillCert')
const Info = require('../models/skilledInfo')
const mongoose = require('mongoose')

//CREATE skill cert
const createCertificate = async(req, res)=>{
    const {categorySkill,
            title,
            issuedOn,
            validUntil,
            photo} = req.body
    
    //check empty fields
    let emptyFields = []
    if(!categorySkill){
        emptyFields.push('categorySkill')
    }
    if(!title){
        emptyFields.push('title')
    }
    if(!issuedOn){
        emptyFields.push('issuedOn')
    }
    if(!validUntil){
        emptyFields.push('validUntil')
    }
    if(!photo){
        emptyFields.push('photo')
    }

    //send message if there is an empty fields
    if(emptyFields.length >0){
        return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
    }
    
    try{
        //this is to assign the job to a specific client user, get id from clientInfo
        const skilled_id = req.skilledInfo._id

        const certCheck = await Certificate.findOne({
            categorySkill:categorySkill,
            title:title,
            issuedOn:issuedOn,
            validUntil:validUntil,
            photo:photo,
            skilled_id:skilled_id,
            skillIsVerified:{$in: [0, 1]},
            isDeleted: 0
        })
        
        if(certCheck){
            return res.status(400).json({error: "Skill certificate already exists in this user."})
        }
        //create query
        const certificate = await Certificate.create({
            categorySkill,
            title,
            issuedOn,
            validUntil,
            photo,
            skilled_id
        })
        res.status(200).json(certificate)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

//GET all skill cert
const getAllCertificate = async(req, res)=>{

    try{
        //this is to find skill for specific user
        const skilled_id = req.skilledInfo._id
        //get all query
        const certificate = await Certificate.find({skilled_id,  isDeleted: 0}).sort({createdAt: -1}).populate('skilled_id')
        res.status(200).json(certificate)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET one skill cert
const getOneCertificate = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const certificate = await Certificate.findById({_id: id})

    //check if not existing
    if (!certificate){
        return res.status(404).json({error: 'Skill Certificate not found'})
    }

    res.status(200).json(certificate)   

}

//UPDATE skill cert
const updateCertificate = async(req, res) =>{
    const {id} = req.params   
    const {categorySkill,
        title,
        issuedOn,
        validUntil,
        photo} = req.body 
        const skilled_id = req.skilledInfo._id

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

     //check empty fields
     let emptyFields = []
     if(!categorySkill){
         emptyFields.push('categorySkill')
     }
     if(!title){
         emptyFields.push('title')
     }
     if(!issuedOn){
         emptyFields.push('issuedOn')
     }
     if(!validUntil){
         emptyFields.push('validUntil')
     }
     if(!photo){
         emptyFields.push('photo')
     }
 
     //send message if there is an empty fields
     if(emptyFields.length >0){
         return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
     }

    const certCheck = await Certificate.findOne({
        categorySkill:categorySkill,
        title:title,
        issuedOn:issuedOn,
        validUntil:validUntil,
        photo:photo,
        skilled_id:skilled_id,
        skillIsVerified:{$in: [0, 1]},
        isDeleted: 0
    })
    
    if(certCheck){
        return res.status(400).json({error: "Skill certificate already exists in this user."})
    }

     //delete query
     const certificate = await Certificate.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!certificate){
        return res.status(404).json({error: 'Skill Certificate not found'})
    }

    res.status(200).json(certificate)
}

//DELETE skill cert
const deleteCertificate = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const certificate = await Certificate.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!certificate){
        return res.status(404).json({error: 'Skill Certificate not found'})
    }

    res.status(200).json(certificate)

}
module.exports = {
    createCertificate,
    getAllCertificate,
    getOneCertificate,
    updateCertificate,
    deleteCertificate
}