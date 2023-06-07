const ClientInfo = require('../models/clientInfo')
const AdminInfo = require('../models/adminInfo')    
const SkilledInfo = require('../models/skilledInfo')  
const AdminSkill = require('../models/adminSkill')      
const jwt = require('jsonwebtoken')

//FILTERING
const getClientSkilledCreatedAtDesc = async(req, res) =>{

    try{
        const skilleInfo = await SkilledInfo
        .find({userIsVerified: 1, isDeleted:0})
        .sort({createdAt: -1})
        .select("-password")
        res.status(200).json(skilleInfo)
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}
const getClientSkilledCreatedAtAsc = async(req, res) =>{

    try{
        const skilleInfo = await SkilledInfo
        .find({userIsVerified: 1, isDeleted:0})
        .sort({createdAt: 1})
        .select("-password")
        res.status(200).json(skilleInfo)
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}
const getClientSkilledUserNameDesc = async(req, res) =>{

    try{
        const skilleInfo = await SkilledInfo
        .find({userIsVerified: 1, isDeleted:0})
        .sort({username: -1})
        .select("-password")
        res.status(200).json(skilleInfo)
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}
const getClientSkilledUserNameAsc = async(req, res) =>{

    try{
        const skilleInfo = await SkilledInfo
        .find({userIsVerified: 1, isDeleted:0})
        .sort({username: 1})
        .select("-password")
        res.status(200).json(skilleInfo)
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}
const getClientSkilledFNameDesc = async(req, res) =>{

    try{
        const skilleInfo = await SkilledInfo
        .find({userIsVerified: 1, isDeleted:0})
        .sort({fname: -1})
        .select("-password")
        res.status(200).json(skilleInfo)
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}
const getClientSkilledFNameAsc = async(req, res) =>{

    try{
        const skilleInfo = await SkilledInfo
        .find({userIsVerified: 1, isDeleted:0})
        .sort({fname: 1})
        .select("-password")
        res.status(200).json(skilleInfo)
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}
const getClientSkilledLNameDesc = async(req, res) =>{

    try{
        const skilleInfo = await SkilledInfo
        .find({userIsVerified: 1, isDeleted:0})
        .sort({lname: -1})
        .select("-password")
        res.status(200).json(skilleInfo)
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}
const getClientSkilledLNameAsc = async(req, res) =>{

    try{
        const skilleInfo = await SkilledInfo
        .find({userIsVerified: 1, isDeleted:0})
        .sort({lname: 1})
        .select("-password")
        res.status(200).json(skilleInfo)
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//get skilled worker with latest registered skill
const getClientSkilledSkillCreatedAtDesc = async (req, res) => {
    try {
        const skillId = req.params._id

        //get all the skilled worker and get their skill
        const skilledInfo = await SkilledInfo.find()
        .populate({
        path: 'skills',
        match: { isDeleted: 0} 
    })

    //get all the skill registered to the admin
    const skillIdDoc = await AdminSkill.findOne
    ({skillId});

    const skilledWorkersWithSkill = skilledInfo.filter((worker) =>
        worker.skills.some((skill) => skill.skillName === skillId)
    );

    if(skilledWorkersWithSkill.length === 0){
        return res.status(400).json({ error: 'No skilled worker availabe to this skill yet.' })
    }

    // Sort the skilled workers by the latest skill's createdAt in descending order final
    skilledWorkersWithSkill.sort((a, b) => {
        const latestSkillA = a.skills
            .filter((skill) => skill.skillName === skillId)
            .reduce((latest, skill) => {
                return skill.createdAt > latest.createdAt ? skill : latest;
            }, { createdAt: new Date(0) });

        const latestSkillB = b.skills
            .filter((skill) => skill.skillName === skillId)
            .reduce((latest, skill) => {
                return skill.createdAt > latest.createdAt ? skill : latest;
            }, { createdAt: new Date(0) });

        return latestSkillB.createdAt - latestSkillA.createdAt;
    });
    
    return res.status(200).json(skilledWorkersWithSkill);
    } catch (err) {
    return res.status(500).json({ message: err.toString() });
    }
};

const getClientSkilledSkillCreatedAtAsc = async (req, res) => {
    try {
        const skillId = req.params._id

        //get all the skilled worker and get their skill
        const skilledInfo = await SkilledInfo.find()
        .populate({
        path: 'skills',
        match: { isDeleted: 0} 
    })

    //get all the skill registered to the admin
    const skillIdDoc = await AdminSkill.findOne
    ({skillId});

    const skilledWorkersWithSkill = skilledInfo.filter((worker) =>
        worker.skills.some((skill) => skill.skillName === skillId)
    );

    if(skilledWorkersWithSkill.length === 0){
        return res.status(400).json({ error: 'No skilled worker availabe to this skill yet.' })
    }

    // Sort the skilled workers by the latest skill's createdAt in ascending order
    skilledWorkersWithSkill.sort((a, b) => {
        const latestSkillA = a.skills
            .filter((skill) => skill.skillName === skillId)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .pop();

        const latestSkillB = b.skills
            .filter((skill) => skill.skillName === skillId)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .pop();

        return new Date(latestSkillA.createdAt) - new Date(latestSkillB.createdAt);
    });

    return res.status(200).json(skilledWorkersWithSkill);
    } catch (err) {
    return res.status(500).json({ message: err.toString() });
    }
};

//get all skilled with skill acc to their username
const getClientSkilledSkillUsernameAsc = async (req, res) => {
    try {
        const skillId = req.params._id

        //get all the skilled worker and get their skill
        const skilledInfo = await SkilledInfo.find()
        .populate({
        path: 'skills',
        match: { isDeleted: 0} 
    })

    //get all the skill registered to the admin
    const skillIdDoc = await AdminSkill.findOne
    ({skillId});

    const skilledWorkersWithSkill = skilledInfo.filter((worker) =>
        worker.skills.some((skill) => skill.skillName === skillId)
    );

    if(skilledWorkersWithSkill.length === 0){
        return res.status(400).json({ error: 'No skilled worker availabe to this skill yet.' })
    }

    // Sort the skilled workers by username in ascending order
    skilledWorkersWithSkill.sort((a, b) => {
        const usernameA = a.username.toLowerCase();
        const usernameB = b.username.toLowerCase();
        return usernameA.localeCompare(usernameB);
    });

    return res.status(200).json(skilledWorkersWithSkill);
    } catch (err) {
    return res.status(500).json({ message: err.toString() });
    }
};

const getClientSkilledSkillUsernameDesc = async (req, res) => {
    try {
        const skillId = req.params._id

        //get all the skilled worker and get their skill
        const skilledInfo = await SkilledInfo.find()
        .populate({
        path: 'skills',
        match: { isDeleted: 0} 
    })

    //get all the skill registered to the admin
    const skillIdDoc = await AdminSkill.findOne
    ({skillId});

    const skilledWorkersWithSkill = skilledInfo.filter((worker) =>
        worker.skills.some((skill) => skill.skillName === skillId)
    );

    if(skilledWorkersWithSkill.length === 0){
        return res.status(400).json({ error: 'No skilled worker availabe to this skill yet.' })
    }

    // Sort the skilled workers by username in descending order
    skilledWorkersWithSkill.sort((a, b) => {
        const usernameA = a.username.toLowerCase();
        const usernameB = b.username.toLowerCase();
        return usernameB.localeCompare(usernameA);
    });

    return res.status(200).json(skilledWorkersWithSkill);
    } catch (err) {
    return res.status(500).json({ message: err.toString() });
    }
};

//FINAL FILTERING
//this is the default, get all skilled worker sort by latest registered
const getFilterSkilled = async(req, res) =>{

    try{
        const skilleInfo = await SkilledInfo
        .find({userIsVerified: 0, isDeleted:0})
        .sort({createdAt: -1})
        .select("-password")
        .populate({
            path: "skills",
            match: { isDeleted: 0 },
            populate: {
              path: "skillName",
              select: "skill", // Assuming 'skill' is the field in 'AdminSkill' model that holds the skill name
            },
        })
        res.status(200).json(skilleInfo)
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}
//on click skill, then get skilled worker sort by latest skilled worker in the skill, address dynamic
const getFilterSkilledSkillDesc = async (req, res) => {
    try {
        const skillId = req.params._id;
        const province = req.query.provinceAddr; // Get the province from the query parameter
        const city = req.query.cityAddr;
        const barangay = req.query.barangayAddr;

        // Get all the skilled workers and their skills
        const skilledInfo = await SkilledInfo.find()
        // .populate({
        //     path: 'skills',
        //     match: { isDeleted: 0 } 
        // });
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
    } catch (err) {
        return res.status(500).json({ message: err.toString() });
    }
};

//on click skill, then get skilled worker sort by latest skilled worker in the skill, address dynamic
const getFilterSkilledSkillAsc = async (req, res) => {
    try {
        const skillId = req.params._id;
        const province = req.query.provinceAddr; // Get the province from the query parameter
        const city = req.query.cityAddr;
        const barangay = req.query.barangayAddr;

        // Get all the skilled workers and their skills
        const skilledInfo = await SkilledInfo.find()
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
    } catch (err) {
        return res.status(500).json({ message: err.toString() });
    }
};
module.exports = {
    getClientSkilledCreatedAtDesc,
    getClientSkilledCreatedAtAsc,
    getClientSkilledUserNameDesc,
    getClientSkilledUserNameAsc,
    getClientSkilledFNameDesc,
    getClientSkilledFNameAsc,
    getClientSkilledLNameDesc,
    getClientSkilledLNameAsc,
    getClientSkilledSkillCreatedAtDesc,
    getClientSkilledSkillCreatedAtAsc,
    getClientSkilledSkillUsernameAsc,
    getClientSkilledSkillUsernameDesc,
    getFilterSkilled,
    getFilterSkilledSkillDesc,
    getFilterSkilledSkillAsc
}