const Province = require('../models/adminProvince') 
const mongoose = require('mongoose')

//CREATE prov exp
const createProvince = async(req, res)=>{

    try{
        const {province} = req.body
        //search if existing
        const provinceCheck = await Province.findOne({
            province:province,
            isDeleted: 0
        })
        
        if(provinceCheck){
            return res.status(400).json({error: "Province already exists."})
        }
        
        //create new skill
        const newProvince = new Province({province})
        await newProvince.save()
        res.status(200).json(newProvince)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

//GET all prov
const getAllProvince = async(req, res)=>{
    try{
        const province = await Province.find({isDeleted: 0}).sort({createdAt: -1})
        res.status(200).json(province)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

//GET one prov
const getOneProvince = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const province = await Province.findById({_id: id})

    //check if not existing
    if (!province){
        return res.status(404).json({error: 'Province not found'})
    }

    res.status(200).json(province)   
}

//UPDATE prov
const updateProvince = async(req, res) =>{
    const {id} = req.params   
    const {province} = req.body 

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }
    const checkProvince = await Province.findOne({province})
    if(checkProvince) return res.status(400).json({messg: 'This province already exists.'})
    
     //delete query
     const adminProvince = await Province.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!adminProvince){
        return res.status(404).json({error: 'Province not found'})
    }

    res.status(200).json(adminProvince)//nadagdag
}

//DELETE skill
const deleteProvince = async(req, res)=>{
     const {id} = req.params   
    // const {isDeleted} = req.body 

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }
     //delete query
     const adminProvince = await Province.findOneAndUpdate({_id: id},
        {isDeleted:1}
        )
    
     //check if not existing
     if (!adminProvince){
        return res.status(404).json({error: 'Province not found'})
    }

    res.status(200).json(adminProvince)//nadagdag
}
module.exports = {
    createProvince,
    getAllProvince,
    getOneProvince,
    updateProvince,
    deleteProvince
}