const AppDetail = require('../models/appDetail')  
const mongoose = require('mongoose')

//CREATE AppDetail
const createAppDetail = async(req, res)=>{

    try{
        const {appRule, contact} = req.body
        
        //check if valid contact no
        const mobileNumberRegex = /^09\d{9}$|^639\d{9}$/;
        if (!mobileNumberRegex.test(contact)) {
            return res.status(400).json({error: 'Please check the contact you have entered.'});
        }

        //if existing
        const appDetailCheck = await AppDetail.findOne({
            // appRule, 
            contact,
            isDeleted:0
        })
        
        if(appDetailCheck){
            return res.status(400).json({error: "This already exist."})
        }

        //create new skill
        const newAppDetail = new AppDetail({
            appRule, 
            contact
        })
        await newAppDetail.save()
        res.status(200).json({message:"Succesfully added."})
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

//GET ALL AppDetail
const getAllAppDetail = async(req, res)=>{
    try{
        const appDetail = await AppDetail.find({isDeleted: 0})
        .sort({appRule: 1 })
        res.status(200).json(appDetail)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

//GET one AppDetail
const getOneAppDetail = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const appDetail = await AppDetail.findById({_id: id})

    //check if not existing
    if (!appDetail){
        return res.status(404).json({error: 'Application Detail not found.'})
    }

    res.status(200).json(appDetail)   
}

//UPDATE AppDetail
const updateAppDetail = async(req, res) =>{
    const {id} = req.params    
    const {appRule, contact} = req.body

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

    //if existing
    const appDetailCheck = await AppDetail.findOne({
        // appRule, 
        contact,
        isDeleted:0
    })
    
    if(appDetailCheck){
        return res.status(400).json({error: "This already exist."})
    }

    //check if valid contact no
    const mobileNumberRegex = /^09\d{9}$|^639\d{9}$/;
    if (!mobileNumberRegex.test(contact)) {
        return res.status(400).json({error: 'Please check the contact you have entered.'});
    }

     //delete query
     const adminAppDetail = await AppDetail.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!adminAppDetail){
        return res.status(404).json({error: 'Application Detail not found.'})
    }

    res.status(200).json({message: "Successfully updated."})
}

module.exports = {
    createAppDetail,
    getAllAppDetail,
    getOneAppDetail,
    updateAppDetail
}