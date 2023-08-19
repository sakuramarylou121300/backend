const ClientInfo = require('../models/clientInfo')
const AdminInfo = require('../models/adminInfo')    
const SkilledInfo = require('../models/skilledInfo')  
const AdminSkill = require('../models/adminSkill')   
const Skill = require('../models/skill') 
const Certificate = require('../models/skillCert')
const Experience = require('../models/skilledExp')  
const SkilledBClearance = require('../models/skilledBClearance') 
const SkilledNClearance = require('../models/skilledNClearance') 
const ClientBClearance = require('../models/clientBClearance') 
const ClientNClearance = require('../models/clientNClearance') 
const SkilledDate = require('../models/skilledDate') 
const ClientReq = require('../models/clientReq')
const ClientComment = require('../models/clientComment')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

//FINAL FILTERING
//USED
const getFilterSkilled = async (req, res) => {
    try {

        //CLIENT
        var currentDate = new Date();//date today
        await ClientBClearance.updateMany({ bClearanceExp: {$lt:currentDate}}, 
            {$set: 
                { bClearanceIsVerified: "expired" } });

        //update all expired nclearance
        var currentDate = new Date();//date today
        await ClientNClearance.updateMany({ nClearanceExp: {$lt:currentDate} }, 
            {$set: 
                { nClearanceIsVerified: "expired" } });
        
            const clientInfo = await ClientInfo.find({ userIsVerified: {$in: [0, 1]}, isDeleted: 0 })
            .sort({ createdAt: -1 })
            .select("-password")
            .populate("clientBarangay")
            .populate("clientNbi");
    
            if (clientInfo) {
                const updatedClientInfo = clientInfo.map((client) => {
                if (
                    client.addIsVerified === 1 &&
                    client.clientBarangay.some((brgy) => brgy.bClearanceIsVerified === "true") &&
                    client.clientNbi.some((nbi) => nbi.nClearanceIsVerified === "true")
                ) {
                    return ClientInfo.findByIdAndUpdate(client._id, { $set: { userIsVerified: 1 } }, { new: true });
                } else if (
                    client.addIsVerified === 0 ||
                    client.clientBarangay.every((brgy) => brgy.bClearanceIsVerified === "false" || brgy.bClearanceIsVerified === "pending") ||
                    client.clientNbi.every((nbi) => nbi.nClearanceIsVerified === "false" || nbi.nClearanceIsVerified === "pending" )
                ) {
                    return ClientInfo.findByIdAndUpdate(client._id, { $set: { userIsVerified: 0 } }, { new: true });
                } else {
                    return client;
                }
                });
                const updatedClientInfoResults = await Promise.all(updatedClientInfo);
            }
        
        //SKILLED WORKER 
        //update all expired bclearance
        var currentDate = new Date();//date today
        await SkilledBClearance.updateMany({ bClearanceExp: {$lt:currentDate}}, 
            {$set: 
                { bClearanceIsVerified: "expired" } });

        //update all expired nclearance
        var currentDate = new Date();//date today
        await SkilledNClearance.updateMany({ nClearanceExp: {$lt:currentDate} }, 
            {$set: 
                { nClearanceIsVerified: "expired" } });
        
        //update all certificate
        var currentDate = new Date();//date today
        await Certificate.updateMany({ validUntil: {$lt:currentDate} }, 
            {$set: 
                { skillIsVerified: "expired" } });
                
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
                skilled.skillBarangay.every((brgy) => brgy.bClearanceIsVerified === "false" || brgy.bClearanceIsVerified === "pending") ||
                skilled.skillNbi.every((nbi) => nbi.nClearanceIsVerified === "false" || nbi.nClearanceIsVerified === "pending" )
            ) {
                return SkilledInfo.findByIdAndUpdate(skilled._id, { $set: { userIsVerified: 0 } }, { new: true });
            } else {
                return skilled;
            }
            });
  
        const updatedSkilledInfoResults = await Promise.all(updatedSkilledInfo);
        const skilledInfoUpdated = await SkilledInfo.find({ userIsVerified: 1, isDeleted: 0 })
        .sort({ createdAt: -1 })
        .select("-password -otp -contact")
        .populate({
            path: "skills",
            match: { isDeleted: 0 },
            populate: {
                path: "skillName",
                select: "skill",
            },
        })
        .populate({
            path: "skilledReq",
            match: { 
                reqStatus: "reqCompleted",
                // adminSkill_id: skillId // Filter based on the specific skill_id 
            },
            populate: ({
                path: "skill_id",
                select: "skillName", // Assuming 'skill' is the field in 'AdminSkill' model that holds the skill name
                populate:{
                    path: 'skillName',
                    select: 'skill',
                    // match: {
                    //     "skillName._id": skillId
                    // }
                }
            }),
        })
        .populate({
            path: "skilledReview",
            match: { 
                isDeleted: 0,
                // adminSkill_id: skillId // Filter based on the specific skill_id  
            }
        })

        //output
        // Create a new array with the required properties, including the address
        const filteredWorkers = skilledInfoUpdated.map((worker) => {

            // Count the completed requests with reqStatus: "reqCompleted"
            const completedReqCount = worker.skilledReq.filter((req) => req.reqStatus === "reqCompleted").length;
            // Count the completed requests with reqStatus: "reqCompleted"
            const countReview = worker.skilledReview.filter((req) => req.isDeleted === 0).length;

            return{
                _id: worker._id,
                username: worker.username,
                password: worker.password,
                lname: worker.lname,
                fname: worker.fname,
                mname: worker.mname,
                // contact: worker.contact,
                houseNo: worker.houseNo,
                street: worker.street,
                barangayAddr: worker.barangayAddr,
                cityAddr: worker.cityAddr,
                provinceAddr: worker.provinceAddr,
                regionAddr: worker.regionAddr,
                addIsVerified: worker.addIsVerified,
                // otp: worker.otp,
                idIsVerified: worker.idIsVerified,
                userIsVerified: worker.userIsVerified,
                isDeleted: worker.isDeleted,
                skilledDeact: worker.skilledDeact,
                message: worker.message,
                createdAt: worker.createdAt,
                updatedAt: worker.updatedAt,
                __v: worker.__v,
                skills: worker.skills,
                skilledReq: worker.skilledReq, // Include the skilledReq field
                skilledReview: worker.skilledReview, // Include the skilledReview field
                completedReqCount: completedReqCount, // Include the completedReqCount
                countReview: countReview, // Include the reviews
                id: worker.id
            }

        });
  
        res.status(200).json(filteredWorkers);
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
        
        //update all certificate
        var currentDate = new Date();//date today
        await Certificate.updateMany({ validUntil: {$lt:currentDate} }, 
            {$set: 
                { skillIsVerified: "false", isExpired: 1 } });
            
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
                skilled.skillBarangay.every((brgy) => brgy.bClearanceIsVerified === "false" || brgy.bClearanceIsVerified === "pending") ||
                skilled.skillNbi.every((nbi) => nbi.nClearanceIsVerified === "false" || nbi.nClearanceIsVerified === "pending")
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
            skills: worker.skills.filter((skill) => skill.skillName && skill.skillName._id.toString() === skillId),
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
        
        //update all certificate
        var currentDate = new Date();//date today
        await Certificate.updateMany({ validUntil: {$lt:currentDate} }, 
            {$set: 
                { skillIsVerified: "false", isExpired: 1 } });

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
                skilled.skillBarangay.every((brgy) => brgy.bClearanceIsVerified === "false" || brgy.bClearanceIsVerified === "pending") ||
                skilled.skillNbi.every((nbi) => nbi.nClearanceIsVerified === "false" || nbi.nClearanceIsVerified === "pending")
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
            skills: worker.skills.filter((skill) => skill.skillName && skill.skillName._id.toString() === skillId),
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

const getFilterSkilledSkillTopRate = async (req, res) => {
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
        
        //update all certificate
        var currentDate = new Date();//date today
        await Certificate.updateMany({ validUntil: {$lt:currentDate} }, 
            {$set: 
                { skillIsVerified: "false", isExpired: 1 } });
            
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
                skilled.skillBarangay.every((brgy) => brgy.bClearanceIsVerified === "false" || brgy.bClearanceIsVerified === "pending") ||
                skilled.skillNbi.every((nbi) => nbi.nClearanceIsVerified === "false" || nbi.nClearanceIsVerified === "pending")
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

        // Sort the skilled workers by the skill with the highest total rating
        skilledWorkersWithSkill.sort((a, b) => {
            const skillA = a.skills.find(
            (skill) => skill.skillName && skill.skillName._id.toString() === skillId
            );
            const skillB = b.skills.find(
            (skill) => skill.skillName && skill.skillName._id.toString() === skillId
            );
        
            const totalRatingA = skillA ? skillA.totalrating : 0;
            const totalRatingB = skillB ? skillB.totalrating : 0;
        
            return totalRatingB - totalRatingA;
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
            skills: worker.skills.filter((skill) => skill.skillName && skill.skillName._id.toString() === skillId),
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

//USED
const getFilterSkilledSkill = async (req, res) => {
    try {
        const skillId = req.params._id;
        const region = req.query.regionAddr;
        const province = req.query.provinceAddr; // Get the province from the query parameter
        const city = req.query.cityAddr;
        const barangay = req.query.barangayAddr;
        const sort = req.query.sort; // Get the sort parameter (values: 'earliest', 'latest', 'topRate')

         //update all expired bclearance
         var currentDate = new Date();//date today
         await SkilledBClearance.updateMany({ bClearanceExp: {$lt:currentDate}}, 
             {$set: 
                 { bClearanceIsVerified: "expired"} });
 
         //update all expired nclearance
         var currentDate = new Date();//date today
         await SkilledNClearance.updateMany({ nClearanceExp: {$lt:currentDate} }, 
             {$set: 
                 { nClearanceIsVerified: "expired" } });
        
        //update all certificate
        var currentDate = new Date();//date today
        await Certificate.updateMany({ validUntil: {$lt:currentDate} }, 
            {$set: 
                { skillIsVerified: "expired"} });
            
        const skilledInfoToVer = await SkilledInfo.find({ userIsVerified: {$in: [0, 1]}, isDeleted: 0 })
        .sort({ createdAt: -1 })
        .select("-password -otp -contact")
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
                skilled.skillBarangay.every((brgy) => brgy.bClearanceIsVerified === "false" || brgy.bClearanceIsVerified === "pending") ||
                skilled.skillNbi.every((nbi) => nbi.nClearanceIsVerified === "false" || nbi.nClearanceIsVerified === "pending")
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
        .populate({
            path: "skilledReq",
            match: { 
                reqStatus: "reqCompleted",
                adminSkill_id: skillId // Filter based on the specific skill_id 
            },
            populate: ({
                path: "skill_id",
                select: "skillName", // Assuming 'skill' is the field in 'AdminSkill' model that holds the skill name
                populate:{
                    path: 'skillName',
                    select: 'skill',
                    // match: {
                    //     "skillName._id": skillId
                    // }
                }
            }),
        })
        .populate({
            path: "skilledReview",
            match: { 
                isDeleted: 0,
                adminSkill_id: skillId // Filter based on the specific skill_id  
            }
        })
        // Get all the skills registered to the admin
        const skillIdDoc = await AdminSkill.findOne({ skillId });

        // Filter skilled workers with the specified skill and province (if provided)
        let skilledWorkersWithSkill = skilledInfo.filter((worker) =>
            worker.skills.some((skill) => skill.skillName && skill.skillName._id.toString() === skillId)
        );
        if (region) {
                skilledWorkersWithSkill = skilledWorkersWithSkill.filter((worker) =>
                worker.regionAddr.toLowerCase() === region.toLowerCase() 
            );
        }
        if (province) {
            skilledWorkersWithSkill = skilledWorkersWithSkill.filter((worker) =>
                worker.regionAddr.toLowerCase() === region.toLowerCase() &&
                worker.provinceAddr.toLowerCase() === province.toLowerCase()
            );
        }

        if (city) {
            skilledWorkersWithSkill = skilledWorkersWithSkill.filter((worker) =>
                worker.regionAddr.toLowerCase() === region.toLowerCase() &&    
                worker.provinceAddr.toLowerCase() === province.toLowerCase() &&
                worker.cityAddr.toLowerCase() === city.toLowerCase()
            );
        }
        
        if (barangay) {
            skilledWorkersWithSkill = skilledWorkersWithSkill.filter((worker) =>
                worker.regionAddr.toLowerCase() === region.toLowerCase() &&
                worker.provinceAddr.toLowerCase() === province.toLowerCase() &&
                worker.cityAddr.toLowerCase() === city.toLowerCase() &&
                worker.barangayAddr.toLowerCase() === barangay.toLowerCase()
            );
        }

        if (skilledWorkersWithSkill.length === 0) {
            return res.status(400).json({ error: 'No skilled worker available.' });
        }

        // Sort the skilled workers based on the 'sort' parameter
        switch (sort) {
            case 'latest':
                skilledWorkersWithSkill.sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt));
                break;
            case 'topRate':
                            // Sort the skilled workers by the skill with the highest total rating
            skilledWorkersWithSkill.sort((a, b) => {
            const skillA = a.skills.find(
                (skill) => skill.skillName && skill.skillName._id.toString() === skillId
            );
            const skillB = b.skills.find(
                (skill) => skill.skillName && skill.skillName._id.toString() === skillId
            );

            const totalRatingA = skillA ? parseFloat(skillA.totalrating) : 0;
            const totalRatingB = skillB ? parseFloat(skillB.totalrating) : 0;

            return totalRatingB - totalRatingA;
            });

            break;
                  
            default:
                skilledWorkersWithSkill.sort((a, b) => new Date(a?.createdAt) - new Date(b?.createdAt));
        }

        // Create a new array with the required properties, including the address
        const filteredWorkers = skilledWorkersWithSkill.map((worker) => {

            // Count the completed requests with reqStatus: "reqCompleted"
            const completedReqCount = worker.skilledReq.filter((req) => req.reqStatus === "reqCompleted").length;
            // Count the completed requests with reqStatus: "reqCompleted"
            const countReview = worker.skilledReview.filter((req) => req.isDeleted === 0).length;

            return{
                _id: worker._id,
                username: worker.username,
                password: worker.password,
                lname: worker.lname,
                fname: worker.fname,
                mname: worker.mname,
                // contact: worker.contact,
                houseNo: worker.houseNo,
                street: worker.street,
                barangayAddr: worker.barangayAddr,
                cityAddr: worker.cityAddr,
                provinceAddr: worker.provinceAddr,
                regionAddr: worker.regionAddr,
                addIsVerified: worker.addIsVerified,
                // otp: worker.otp,
                idIsVerified: worker.idIsVerified,
                userIsVerified: worker.userIsVerified,
                isDeleted: worker.isDeleted,
                skilledDeact: worker.skilledDeact,
                message: worker.message,
                createdAt: worker.createdAt,
                updatedAt: worker.updatedAt,
                __v: worker.__v,
                skills: worker.skills.filter((skill) => skill.skillName && skill.skillName._id.toString() === skillId),
                skilledReq: worker.skilledReq, // Include the skilledReq field
                skilledReview: worker.skilledReview, // Include the skilledReview field
                completedReqCount: completedReqCount, // Include the completedReqCount
                countReview: countReview, // Include the reviews
                id: worker.id
            }

        });
        return res.status(200).json(filteredWorkers);
    }} catch (error) {
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
    const skilledInfo = await SkilledInfo
    .findById({_id: id})
    .select("-password -otp -contact")

    //check if not existing
    if (!skilledInfo){
        return res.status(404).json({error: 'Skilled Worker not found'})
    }

    res.status(200).json(skilledInfo)   
}

const getClientSkilledSkill = async (req, res) => {
    const _id = req.params._id; // this is for the skilled worker _id

    try {
        const skilledInfo = await SkilledInfo.findOne({ _id: _id });

        if (!skilledInfo) {
            return res.status(404).json({ error: 'Skilled Worker not found' });
        }

        const skilledWorkerSkills = await Skill.find({
            skilled_id: skilledInfo._id,
            isDeleted: 0
        }).populate('skillName');

        //count completed and reviews 
        const populatedSkills = await Promise.all(
            skilledWorkerSkills.map(async (skill) => {
                const skilledReqCount = await ClientReq.countDocuments({
                    reqStatus: 'reqCompleted',
                    skill_id: skill._id
                });

                const skilledReviewCount = await ClientComment.countDocuments({
                    isDeleted: 0,
                    skill_id: skill._id
                });

                return {
                    ...skill._doc,
                    skilledReqCount,
                    skilledReviewCount
                };
            })
        );

        res.status(200).json(populatedSkills);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

//get one skilled worker, get skilled worker cert
const getClientSkilledCert = async(req, res)=>{ 

    try{
        const skilledWorkerId  = req.params._id//this is to get the _id of skilled worker first
        const skillId  = req.params.skillId; // Get the skill ID

       //find skill worker first
        const skilledInfo = await SkilledInfo.findOne({_id: skilledWorkerId })
        //check if not existing
        if (!skilledInfo){
            return res.status(404).json({error: 'Skilled Worker not found'})
        }
        // Find skilled_id document based on username
        const skillIdDoc = await AdminSkill.findOne({
            _id: skillId });

        const skillCert = await Certificate
        .find({
            skilled_id: skilledInfo._id, 
            categorySkill: skillIdDoc._id,
            skillIsVerified: "true",
            isDeleted: 0,
            isExpired:{$ne: 1},})
        .populate('categorySkill')
        // .populate('skilled_id')
        .populate({
            path: 'skilled_id',
            select: '-otp -contact'
        })
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
        const skillId  = req.params.skillId; // Get the skill ID

       //find skill worker first
        const skilledInfo = await SkilledInfo.findOne({_id: skilledWorkerId })
        //check if not existing
        if (!skilledInfo){
            return res.status(404).json({error: 'Skilled Worker not found'})
        }
        // Find skilled_id document based on username
        const skillIdDoc = await AdminSkill.findOne({
            _id: skillId});

        const skilledExp = await Experience
        .find({
            skilled_id: skilledInfo._id, 
            categorySkill: skillIdDoc._id,
            expIsVerified: "true",
            isDeleted: 0})
        .populate('categorySkill')
        // .populate('skilled_id')
        .populate({
            path: 'skilled_id',
            select: '-otp -contact'
        })
        .sort({createdAt: -1})
        res.status(200).json(skilledExp)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
} 

//get one skilled date
const getClientSkilledDate = async(req, res)=>{ 
    try{
        const skilledWorkerId  = req.params._id//this is to get the _id of skilled worker first

       //find skill worker first
        const skilledInfo = await SkilledInfo.findOne({_id: skilledWorkerId })
        //check if not existing
        if (!skilledInfo){
            return res.status(404).json({error: 'Skilled Worker not found'})
        }

        const skilledDateFind = await SkilledDate
        .find({
            skilled_id: skilledInfo._id, 
            isDeleted: 0
        })
        // .populate('client_id')
        .populate({
            path:'client_id',
            select: '-otp -contact'
        })

        .sort({skilledDate: 1})
        res.status(200).json(skilledDateFind)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
} 
module.exports = {
    getFilterSkilled,
    getFilterSkilledSkillDesc,
    getFilterSkilledSkillAsc,
    getFilterSkilledSkillTopRate,
    getFilterSkilledSkill,
    getClientSkilledInfo,
    getClientSkilledSkill,
    getClientSkilledCert,
    getClientSkilledExp,
    getClientSkilledDate
}