const ClientInfo = require('../models/clientInfo')
const AdminInfo = require('../models/adminInfo')    
const SkilledInfo = require('../models/skilledInfo')  
const AdminSkill = require('../models/adminSkill')   
const Skill = require('../models/skill') 
const Certificate = require('../models/skillCert')
const Experience = require('../models/skilledExp')  
const SkilledBClearance = require('../models/skilledBClearance') //for CRUD of skill (admin)
const SkilledNClearance = require('../models/skilledNClearance') //for CRUD of skill (admin)
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

//FINAL FILTERING
const getFilterSkilled = async (req, res) => {
    try {
        //update all expired bclearance
        var currentDate = new Date();//date today
        await SkilledBClearance.updateMany({ bClearanceExp: {$lt:currentDate}}, 
            {$set: 
                { bClearanceIsVerified: "false", isExpired: 1 } });

        //update all expired nclearance
        var currentDate = new Date();//date today
        await SkilledNClearance.updateMany({ nClearanceExp: {$lt:currentDate} }, 
            {$set: 
                { nClearanceIsVerified: "false", isExpired: 1 } });
        

        const skilledInfo = await SkilledInfo.find({ userIsVerified: {$in: [0, 1]}, isDeleted: 0 })
            .sort({ createdAt: -1 })
            .select("-password")
            .populate("skillBarangay")
            .populate("skillNbi");
  
        if (skilledInfo) {
            const updatedSkilledInfo = skilledInfo.map((skilled) => {
            if (
                skilled.addIsVerified === 1 &&
                skilled.skillBarangay.some((brgy) => brgy.bClearanceIsVerified === "true") &&
                skilled.skillNbi.some((nbi) => nbi.nClearanceIsVerified === "true")
            ) {
                return SkilledInfo.findByIdAndUpdate(skilled._id, { $set: { userIsVerified: 1 } }, { new: true });
            } else if (
                skilled.addIsVerified === 0 ||
                skilled.skillBarangay.some((brgy) => brgy.bClearanceIsVerified === "false") ||
                skilled.skillNbi.some((nbi) => nbi.nClearanceIsVerified === "false")
            ) {
                return SkilledInfo.findByIdAndUpdate(skilled._id, { $set: { userIsVerified: 0 } }, { new: true });
            } else {
                return skilled;
            }
            });
  
        const updatedSkilledInfoResults = await Promise.all(updatedSkilledInfo);

        const skilledInfoUpdated = await SkilledInfo.find({ userIsVerified: 1, isDeleted: 0 })
        .sort({ createdAt: -1 })
        .select("-password")
        .populate({
        path: "skills",
        match: { isDeleted: 0 },
        populate: {
            path: "skillName",
            select: "skill",
        },
        })
  
        res.status(200).json(skilledInfoUpdated);
      } else {
        return res.status(404).json({ message: "Skilled worker not found" });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
};
    
//on click skill, then get skilled worker sort by latest skilled worker in the skill, address dynamic
const getFilterSkilledSkillDesc = async (req, res) => {
    try {
        const skillId = req.params._id;
        const province = req.query.provinceAddr; // Get the province from the query parameter
        const city = req.query.cityAddr;
        const barangay = req.query.barangayAddr;

         //update all expired bclearance
         var currentDate = new Date();//date today
         await SkilledBClearance.updateMany({ bClearanceExp: {$lt:currentDate}}, 
             {$set: 
                 { bClearanceIsVerified: "false", isExpired: 1 } });
 
         //update all expired nclearance
         var currentDate = new Date();//date today
         await SkilledNClearance.updateMany({ nClearanceExp: {$lt:currentDate} }, 
             {$set: 
                 { nClearanceIsVerified: "false", isExpired: 1 } });
         
        const skilledInfoToVer = await SkilledInfo.find({ userIsVerified: {$in: [0, 1]}, isDeleted: 0 })
        .sort({ createdAt: -1 })
        .select("-password")
        .populate("skillBarangay")
        .populate("skillNbi");
  
        if (skilledInfoToVer) {
            const updatedSkilledInfo = skilledInfoToVer.map((skilled) => {
            if (
                skilled.addIsVerified === 1 &&
                skilled.skillBarangay.some((brgy) => brgy.bClearanceIsVerified === "true") &&
                skilled.skillNbi.some((nbi) => nbi.nClearanceIsVerified === "true")
            ) {
                return SkilledInfo.findByIdAndUpdate(skilled._id, { $set: { userIsVerified: 1 } }, { new: true });
            } else if (
                skilled.addIsVerified === 0 ||
                skilled.skillBarangay.some((brgy) => brgy.bClearanceIsVerified === "false") ||
                skilled.skillNbi.some((nbi) => nbi.nClearanceIsVerified === "false")
            ) {
                return SkilledInfo.findByIdAndUpdate(skilled._id, { $set: { userIsVerified: 0 } }, { new: true });
            } else {
                return skilled;
            }
            });
  
        const updatedSkilledInfoResults = await Promise.all(updatedSkilledInfo);

        // Get all the skilled workers and their skills
        const skilledInfo = await SkilledInfo.find({ userIsVerified: 1, isDeleted: 0 })
        .populate({
            path: "skills",
            match: { isDeleted: 0 },
            populate: {
              path: "skillName",
              select: "skill", // Assuming 'skill' is the field in 'AdminSkill' model that holds the skill name
            },
        })
        
        // Get all the skills registered to the admin
        const skillIdDoc = await AdminSkill.findOne({ skillId });

        // Filter skilled workers with the specified skill and province (if provided)
        let skilledWorkersWithSkill = skilledInfo.filter((worker) =>
            worker.skills.some((skill) => skill.skillName && skill.skillName._id.toString() === skillId)
        );
        if (province) {
            skilledWorkersWithSkill = skilledWorkersWithSkill.filter((worker) =>
                worker.provinceAddr.toLowerCase() === province.toLowerCase()
            );
        }

        if (city) {
            skilledWorkersWithSkill = skilledWorkersWithSkill.filter((worker) =>
                worker.provinceAddr.toLowerCase() === province.toLowerCase() &&
                worker.cityAddr.toLowerCase() === city.toLowerCase()
            );
        }
        
        if (barangay) {
            skilledWorkersWithSkill = skilledWorkersWithSkill.filter((worker) =>
                worker.provinceAddr.toLowerCase() === province.toLowerCase() &&
                worker.cityAddr.toLowerCase() === city.toLowerCase() &&
                worker.barangayAddr.toLowerCase() === barangay.toLowerCase()
            );
        }

        if (skilledWorkersWithSkill.length === 0) {
            return res.status(400).json({ error: 'No skilled worker available for this skill and province yet.' });
        }

        // Sort the skilled workers by the latest skill's createdAt in descending order
        // Sort the skilled workers by the latest skill's createdAt in descending order
        skilledWorkersWithSkill.sort((a, b) => {
        const latestSkillA = a.skills
            .filter((skill) => skill.skillName && skill.skillName._id.toString() === skillId)
            .sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt))
            .pop();
        
        const latestSkillB = b.skills
            .filter((skill) => skill.skillName && skill.skillName._id.toString() === skillId)
            .sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt))
            .pop();
        
        return new Date(latestSkillB?.createdAt) - new Date(latestSkillA?.createdAt);
        });
          


        // Create a new array with the required properties, including the address
        const filteredWorkers = skilledWorkersWithSkill.map((worker) => ({
            _id: worker._id,
            username: worker.username,
            password: worker.password,
            lname: worker.lname,
            fname: worker.fname,
            mname: worker.mname,
            contact: worker.contact,
            houseNo: worker.houseNo,
            street: worker.street,
            barangayAddr: worker.barangayAddr,
            cityAddr: worker.cityAddr,
            provinceAddr: worker.provinceAddr,
            regionAddr: worker.regionAddr,
            addIsVerified: worker.addIsVerified,
            otp: worker.otp,
            idIsVerified: worker.idIsVerified,
            userIsVerified: worker.userIsVerified,
            isDeleted: worker.isDeleted,
            skilledDeact: worker.skilledDeact,
            message: worker.message,
            createdAt: worker.createdAt,
            updatedAt: worker.updatedAt,
            __v: worker.__v,
            skills: worker.skills,
            id: worker.id
        }));

        return res.status(200).json(filteredWorkers);
    } else {
        return res.status(404).json({ message: "Skilled worker not found" });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
};

//on click skill, then get skilled worker sort by latest skilled worker in the skill, address dynamic
const getFilterSkilledSkillAsc = async (req, res) => {
    try {
        const skillId = req.params._id;
        const province = req.query.provinceAddr; // Get the province from the query parameter
        const city = req.query.cityAddr;
        const barangay = req.query.barangayAddr;
        //update all expired bclearance
        var currentDate = new Date();//date today
        await SkilledBClearance.updateMany({ bClearanceExp: {$lt:currentDate}}, 
            {$set: 
                { bClearanceIsVerified: "false", isExpired: 1 } });

        //update all expired nclearance
        var currentDate = new Date();//date today
        await SkilledNClearance.updateMany({ nClearanceExp: {$lt:currentDate} }, 
            {$set: 
                { nClearanceIsVerified: "false", isExpired: 1 } });

        const skilledInfoToVer = await SkilledInfo.find({ userIsVerified: {$in: [0, 1]}, isDeleted: 0 })
            .sort({ createdAt: -1 })
            .select("-password")
            .populate("skillBarangay")
            .populate("skillNbi");
  
        if (skilledInfoToVer) {
            const updatedSkilledInfo = skilledInfoToVer.map((skilled) => {
            if (
                skilled.addIsVerified === 1 &&
                skilled.skillBarangay.some((brgy) => brgy.bClearanceIsVerified === "true") &&
                skilled.skillNbi.some((nbi) => nbi.nClearanceIsVerified === "true")
            ) {
                return SkilledInfo.findByIdAndUpdate(skilled._id, { $set: { userIsVerified: 1 } }, { new: true });
            } else if (
                skilled.addIsVerified === 0 ||
                skilled.skillBarangay.some((brgy) => brgy.bClearanceIsVerified === "false") ||
                skilled.skillNbi.some((nbi) => nbi.nClearanceIsVerified === "false")
            ) {
                return SkilledInfo.findByIdAndUpdate(skilled._id, { $set: { userIsVerified: 0 } }, { new: true });
            } else {
                return skilled;
            }
            });
  
        const updatedSkilledInfoResults = await Promise.all(updatedSkilledInfo);

        // Get all the skilled workers and their skills
        const skilledInfo = await SkilledInfo.find({ userIsVerified: 1, isDeleted: 0 })
        .populate({
            path: "skills",
            match: { isDeleted: 0 },
            populate: {
              path: "skillName",
              select: "skill", // Assuming 'skill' is the field in 'AdminSkill' model that holds the skill name
            },
        })

        // Get all the skills registered to the admin
        const skillIdDoc = await AdminSkill.findOne({ skillId });

        // Filter skilled workers with the specified skill and province (if provided)
        let skilledWorkersWithSkill = skilledInfo.filter((worker) =>
            worker.skills.some((skill) => skill.skillName && skill.skillName._id.toString() === skillId)
        );

        if (province) {
            skilledWorkersWithSkill = skilledWorkersWithSkill.filter((worker) =>
                worker.provinceAddr.toLowerCase() === province.toLowerCase()
            );
        }

        if (city) {
            skilledWorkersWithSkill = skilledWorkersWithSkill.filter((worker) =>
                worker.provinceAddr.toLowerCase() === province.toLowerCase() &&
                worker.cityAddr.toLowerCase() === city.toLowerCase()
            );
        }
        
        if (barangay) {
            skilledWorkersWithSkill = skilledWorkersWithSkill.filter((worker) =>
                worker.provinceAddr.toLowerCase() === province.toLowerCase() &&
                worker.cityAddr.toLowerCase() === city.toLowerCase() &&
                worker.barangayAddr.toLowerCase() === barangay.toLowerCase()
            );
        }

        if (skilledWorkersWithSkill.length === 0) {
            return res.status(400).json({ error: 'No skilled worker available for this skill and province yet.' });
        }
        // Sort the skilled workers by the latest skill's createdAt in ascending order
        skilledWorkersWithSkill.sort((a, b) => {
            const latestSkillA = a.skills
              .filter((skill) => skill.skillName && skill.skillName._id.toString() === skillId)
              .sort((a, b) => new Date(a?.createdAt) - new Date(b?.createdAt))
              .shift();
          
            const latestSkillB = b.skills
              .filter((skill) => skill.skillName && skill.skillName._id.toString() === skillId)
              .sort((a, b) => new Date(a?.createdAt) - new Date(b?.createdAt))
              .shift();
          
            return new Date(latestSkillA?.createdAt) - new Date(latestSkillB?.createdAt);
          });
          

        // Create a new array with the required properties, including the address
        const filteredWorkers = skilledWorkersWithSkill.map((worker) => ({
            _id: worker._id,
            username: worker.username,
            password: worker.password,
            lname: worker.lname,
            fname: worker.fname,
            mname: worker.mname,
            contact: worker.contact,
            houseNo: worker.houseNo,
            street: worker.street,
            barangayAddr: worker.barangayAddr,
            cityAddr: worker.cityAddr,
            provinceAddr: worker.provinceAddr,
            regionAddr: worker.regionAddr,
            addIsVerified: worker.addIsVerified,
            otp: worker.otp,
            idIsVerified: worker.idIsVerified,
            userIsVerified: worker.userIsVerified,
            isDeleted: worker.isDeleted,
            skilledDeact: worker.skilledDeact,
            message: worker.message,
            createdAt: worker.createdAt,
            updatedAt: worker.updatedAt,
            __v: worker.__v,
            skills: worker.skills,
            id: worker.id
        }));

        return res.status(200).json(filteredWorkers);
    } else {
        return res.status(404).json({ message: "Skilled worker not found" });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
};

//ALL GET ONE
//get one skilled worker, get skilled worker info
const getClientSkilledInfo = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const skilledInfo = await SkilledInfo.findById({_id: id})

    //check if not existing
    if (!skilledInfo){
        return res.status(404).json({error: 'Skilled Worker not found'})
    }

    res.status(200).json(skilledInfo)   
}
//get one skilled worker, get skilled worker skills
const getClientSkilledSkill = async(req, res)=>{
    const _id = req.params._id//this is for the skille worker _id

    //find skill worker first
    const skilledInfo = await SkilledInfo.findOne({_id: _id})
    //check if not existing
    if (!skilledInfo){
        return res.status(404).json({error: 'Skilled Worker not found'})
    }

    const skilledWorkerSkill = await Skill
    .find({
        skilled_id: skilledInfo._id, 
        isDeleted: 0})
    .populate('skillName')
    .populate('skilled_id')

    res.status(200).json(skilledWorkerSkill)   
}
//get one skilled worker, get skilled worker cert
const getClientSkilledCert = async(req, res)=>{ 

    try{
        const skilledWorkerId  = req.params._id//this is to get the _id of skilled worker first
        const skillName  = req.params.skillName //this is to get the skill from AdminSkill

       //find skill worker first
        const skilledInfo = await SkilledInfo.findOne({_id: skilledWorkerId })
        //check if not existing
        if (!skilledInfo){
            return res.status(404).json({error: 'Skilled Worker not found'})
        }
        // // Find skilled_id document based on username
        // const skillIdDoc = await AdminSkill.findOne({
        //     skill: skillName});

        const skillCert = await Certificate
        .find({
            skilled_id: skilledInfo._id, 
            // categorySkill: skillIdDoc._id,
            skillIsVerified: "true",
            isDeleted: 0,
            isExpired:{$ne: 1},})
        .populate('categorySkill')
        .populate('skilled_id')
        .sort({createdAt: -1})
        res.status(200).json(skillCert)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
} 
//get one skilled worker, get skilled worker exp
const getClientSkilledExp = async(req, res)=>{ 

    try{
        const skilledWorkerId  = req.params._id//this is to get the _id of skilled worker first
        const skillName  = req.params.skillName //this is to get the skill from AdminSkill

       //find skill worker first
        const skilledInfo = await SkilledInfo.findOne({_id: skilledWorkerId })
        //check if not existing
        if (!skilledInfo){
            return res.status(404).json({error: 'Skilled Worker not found'})
        }
        // Find skilled_id document based on username
        // const skillIdDoc = await AdminSkill.findOne({
        //     skill: skillName});

        const skilledExp = await Experience
        .find({
            skilled_id: skilledInfo._id, 
            // categorySkill: skillIdDoc._id,
            expIsVerified: "true",
            isDeleted: 0})
        .populate('categorySkill')
        .populate('skilled_id')
        .sort({createdAt: -1})
        res.status(200).json(skilledExp)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
} 
module.exports = {
    getFilterSkilled,
    getFilterSkilledSkillDesc,
    getFilterSkilledSkillAsc,
    getClientSkilledInfo,
    getClientSkilledSkill,
    getClientSkilledCert,
    getClientSkilledExp
}