const Job = require('../models/job')
const mongoose = require('mongoose')


//CREATE job
const createJob = async(req, res)=>{
    const {
            title, 
            desc, 
            salary,
            company, 
            barangay, 
            city,
            prov, 
            start,
            end,
            status} = req.body
    try{
        //this is to assign the job to a specific client user, get id from clientInfo
        const client_id = req.clientInfo._id
        const client_name = req.clientInfo.lname

        //create query
        const job = await Job.create({
            title,
            desc,
            salary,
            company,
            barangay,
            city,
            prov,
            start,
            end,
            status,
            client_id
        })
        res.status(200).json(job)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

//GET all job
const getAllJob = async(req, res)=>{

    try{
        //this is to find job for specific user
        const client_id = req.clientInfo._id
        //get all query
        const job = await Job.find({client_id}).sort({createdAt: -1})
        res.status(200).json(job)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET one job
const getOneJob = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const job = await Job.findById({_id: id})

    //check if not existing
    if (!job){
        return res.status(404).json({error: 'Job not found'})
    }

    res.status(200).json(job)   

}

//UPDATE job
const updateJob = async(req, res) =>{
    const {id} = req.params    

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

     //delete query
     const job = await Job.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!job){
        return res.status(404).json({error: 'No such job'})
    }

    res.status(200).json({message: 'Successfully updated'})
}

//DELETE job
const deleteJob = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const job = await Job.findOneAndDelete({_id: id})
    
    //check if not existing
    if (!job){
        return res.status(404).json({error: 'No such job'})
    }

    res.status(200).json({message: 'Successfully deleted'})

}


module.exports = {
    createJob,
    getAllJob,
    getOneJob,
    updateJob,
    deleteJob   
}