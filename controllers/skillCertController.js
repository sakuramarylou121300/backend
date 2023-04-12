const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Certificate = require('../models/skillCert')
const Info = require('../models/skilledInfo')
const mongoose = require('mongoose')

const createCertificate = async(req, res)=>{
    const {categorySkill,
        title,
        issuedOn,
        validUntil
    } = req.body
    
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

    //send message if there is an empty fields
    if(emptyFields.length >0){
        return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
    }
    
    if (!req.file) {
        return res.status(400).json({error: 'Please upload your certificate photo.'})
    }
    
    try{
        //this is to assign the job to a specific client user, get id from clientInfo
        const skilled_id = req.skilledInfo._id

        const certCheck = await Certificate.findOne({
            categorySkill:categorySkill,
            title:title,
            issuedOn:issuedOn,
            validUntil:validUntil,
            skilled_id:skilled_id,
            skillIsVerified:{$in: ["false", "true"]},
            isDeleted: 0
        })
        
        if(certCheck){
            return res.status(400).json({error: "Skill certificate already exists in this user."})
        }
        
        if (categorySkill === "Select") {
            res.status(400).send({ error: "Please enter your skill" });
            return;
        }
        // Convert the validUntil date string to a Date object
        const validUntilDate = new Date(validUntil);

        // Check if the validUntil date is less than today's date
        if (validUntilDate < new Date()) {
        return res.status(400).json({ error: 'Your certificate is outdated. Please submit a valid one.' });
        }

        if (issuedOn >= validUntil) {
            res.status(400).send({ error: "Please check your certificate issued on and valid until" });
            return;
        }

        // let issuedOnDate = new Date(issuedOn)
        // console.log(issuedOnDate)
  
        result = await cloudinary.uploader.upload(req.file.path)
        let certificate = new Certificate({
            categorySkill,
            title,
            issuedOn,
            validUntil,
            photo: result.secure_url,     
            cloudinary_id: result.public_id,
            skilled_id
        })
        await certificate.save()
        console.log(certificate)

        res.status(200).json(certificate)
    }
    catch(error){
        console.log(error)
        res.status(404).json({error: error.message})
    }
}

const getAllCertificate = async(req, res)=>{

    try{
        //this is to find skill for specific user
        const skilled_id = req.skilledInfo._id
        //get all query
        const certificate = await Certificate
        .find({skilled_id,  isDeleted: 0})
        .sort({createdAt: -1})
        .populate('skilled_id')
        res.status(200).json(certificate)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

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

const updateCertificate = async(req,res)=>{

    try{
        const skilled_id = req.skilledInfo._id
        let certificate = await Certificate.findById(req.params.id)

        // // check if certificate already exists with the same categorySkill, title, issuedOn, and validUntil
        // const existingCertificate = await Certificate.findOne({
        //     categorySkill: req.body.categorySkill || certificate.categorySkill,
        //     title: req.body.title || certificate.title,
        //     issuedOn: req.body.issuedOn || certificate.issuedOn,
        //     validUntil: req.body.validUntil || certificate.validUntil,
        //     skillIsVerified:{$in: ["false", "true"]},
        //     isDeleted:0,
        //     skilled_id:skilled_id
        // });

        // if (existingCertificate) {
        //     return res.status(400).json({
        //         message: "This certificate already exists."
        //     });
        // }
        
        //remove the recent image
        await cloudinary.uploader.destroy(certificate.cloudinary_id)
        //upload the new image
        let result
        if(req.file){
            result = await cloudinary.uploader.upload(req.file.path)
        }
        const data = {
            categorySkill: req.body.categorySkill || certificate.categorySkill,
            title: req.body.title || certificate.title,
            issuedOn: req.body.issuedOn || certificate.issuedOn,
            validUntil: req.body.validUntil || certificate.validUntil,
            photo: result?.secure_url || certificate.photo,
            cloudinary_id: result?.public_id || certificate.cloudinary_id
        }

        certificate = await Certificate.findByIdAndUpdate(req.params.id, 
            data, {new: true})
            res.json(certificate)
   }
   catch(error){
        res.status(404).json({error: error.message})
    }
}

//UPDATE skill cert
// const updateCertificate = async(req, res) =>{
//     const {id} = req.params   
//     const {categorySkill,
//         title,
//         issuedOn,
//         validUntil,
//         photo} = req.body 
//         const skilled_id = req.skilledInfo._id

//     //check if id is not existing
//     if(!mongoose.Types.ObjectId.isValid(id)){
//         return res.status(404).json({error: 'Invalid id'})
//     }

//      //check empty fields
//      let emptyFields = []
//      if(!categorySkill){
//          emptyFields.push('categorySkill')
//      }
//      if(!title){
//          emptyFields.push('title')
//      }
//      if(!issuedOn){
//          emptyFields.push('issuedOn')
//      }
//      if(!validUntil){
//          emptyFields.push('validUntil')
//      }
//      if(!photo){
//          emptyFields.push('photo')
//      }
 
//      //send message if there is an empty fields
//      if(emptyFields.length >0){
//          return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
//      }

//     const certCheck = await Certificate.findOne({
//         categorySkill:categorySkill,
//         title:title,
//         issuedOn:issuedOn,
//         validUntil:validUntil,
//         photo:photo,
//         skilled_id:skilled_id,
//         skillIsVerified:{$in: ["false", "true"]},
//         isDeleted: 0
//     })
    
//     if(certCheck){
//         return res.status(400).json({error: "Skill certificate already exists in this user."})
//     }

//     if (issuedOn >= validUntil) {
//         res.status(400).send({ error: "Please check your certificate issued on and valid until" });
//         return;
//     }

//      //delete query
//      const certificate = await Certificate.findOneAndUpdate({_id: id},{
//          ...req.body //get new value
//      })
    
//      //check if not existing
//      if (!certificate){
//         return res.status(404).json({error: 'Skill Certificate not found'})
//     }

//     res.status(200).json(certificate)
// }

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