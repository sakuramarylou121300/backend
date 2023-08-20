const OtherSkill = require('../models/otherSkill')
const ReasonSkill = require('../models/reasonSkill')
const SkilledInfo = require('../models/skilledInfo')
const ClientInfo = require('../models/clientInfo')
const AdminSkill = require('../models/adminSkill')
const SkilledNotification = require('../models/skilledNotification')
const ClientNotification = require('../models/clientNotification')
const AdminNotification = require('../models/adminNotification')
const mongoose = require('mongoose')

//create otherSkill for client
const createOtherSkills = async (req, res) => {
    try {
        const { otherSkills } = req.body;
        const client_id = req.clientInfo._id;
        
        //OTHER SKILL
        if (!otherSkills || otherSkills.length === 0) {
            res.status(400).send({ error: "Please enter the skill you want to refer to admin." });
            return; // Add this return statement
        }

        const uniqueOtherSkills = [...new Set(otherSkills)]; // Remove duplicates
        if (uniqueOtherSkills.length !== otherSkills.length) {
            res.status(400).send({ error: "Please remove repeating request skill." });
            return;
        }

         //if otherSkills exists to both OtherSkill and AdminSkill documents
         for (const skill of uniqueOtherSkills) {
            // Check if the otherSkill is already saved in OtherSkill
            const existingOtherSkill = await OtherSkill.findOne({
                otherSkills: skill
            });

            if (existingOtherSkill) {

                //if pending
                if (existingOtherSkill.skillIsVerified === 'pending') {
                    res.status(400).send({ error: `Skill "${skill}" is already requested, please wait for it to be approve.` });
                    return;
                }

                //if false
                if (existingOtherSkill.skillIsVerified === 'false') {
                    res.status(400).send({ error: `Skill "${skill}" is already requested and it was not qualified.` });
                    return;
                }
                
            }

            // Check if the otherSkill is already saved in AdminSkill
            const existingAdminSkill = await AdminSkill.findOne({
                skill: skill
            });

            if (existingAdminSkill) {
                res.status(400).send({ error: `Skill "${skill}" already exists in the list of skills.` });
                return;
            }
        }

        const otherSkillsToAdd = uniqueOtherSkills.map(otherSkill => ({
            client_id,
            otherSkills: otherSkill
        }));

        // Use the create method to insert the array of documents
        const otherSkillsAdded = await OtherSkill.create(otherSkillsToAdd);

        // Create a notification after adding otherSkills
        const otherSkillsMessage = otherSkills && otherSkills.length > 0 ? `${otherSkills.join(', ')}` : '';
        const notification = await AdminNotification.create({
            client_id,
            message: `requested ${otherSkillsMessage} skill.`,
            // url: `https://samplekasawapp.onrender.com/api/admin/getOne/Barangay/${skilledBClearance._id}`,
            urlReact:`/Kasaw-App/SkillOptions-Request`
        });

        res.status(201).send({ message: 'Successfully added.' });
    } catch (error) {
        res.status(400).send(error);
    }
};

//GET all otherSkill, pending
const getAllOtherSkill = async(req, res)=>{     
    try{
        const otherSkill = await OtherSkill
        .find({isDeleted: 0, skillIsVerified: "pending"})
        .sort({createdAt: -1})
        .populate({
            path: 'skilled_id'
        })
        .populate({
            path: 'client_id'
        })
        .populate({
            path: 'message.message',
            model: 'ReasonSkill',
            select: 'reason',
            options: { lean: true },
        })
        res.status(200).json(otherSkill)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET all otherSkill, true
const getAllOtherSkillTrue = async(req, res)=>{     
    try{
        const otherSkill = await OtherSkill
        .find({isDeleted: 0, skillIsVerified: "true"})
        .sort({createdAt: -1})
        .populate({
            path: 'skilled_id'
        })
        .populate({
            path: 'client_id'
        })
        .populate({
            path: 'message.message',
            model: 'ReasonSkill',
            select: 'reason',
            options: { lean: true },
        })
        res.status(200).json(otherSkill)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET all otherSkill, false
const getAllOtherSkillFalse = async(req, res)=>{     
    try{
        const otherSkill = await OtherSkill
        .find({isDeleted: 0, skillIsVerified: "false"})
        .sort({createdAt: -1})
        .populate({
            path: 'skilled_id'
        })
        .populate({
            path: 'client_id'
        })
        .populate({
            path: 'message.message',
            model: 'ReasonSkill',
            select: 'reason',
            options: { lean: true },
        })
        res.status(200).json(otherSkill)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//if accepted
const updateOtherSkillAccepted = async (req, res) => {
    const { otherSkills } = req.body;
  
    try {
        //update if approve or not
        await OtherSkill.updateOne({ _id: req.params.id }, { $unset: { message: 1 } });
        
        if (!otherSkills){
            return res.status(400).json({ error: 'Please do not leave skill field blank.' });
        }
        const otherSkill = await OtherSkill.findOneAndUpdate(
            { _id: req.params.id },
            {
                otherSkills:otherSkills,
                $set: { skillIsVerified: "true" },
            },
            { new: true }
        );

        //add the other skill to skill list
        //create query
        const adminSkill = await AdminSkill.create({
            skill: otherSkills
        })

        //notification for all 
        // Fetch all skilled workers and clients
        const skilledWorkers = await SkilledInfo.find();
        const clients = await ClientInfo.find();
 
        // Create notifications for all skilled workers
        for (const skilledWorker of skilledWorkers) {
            await SkilledNotification.create({
                skilled_id: skilledWorker._id,
                message: `${otherSkills} is added in the list of skills.`,
                urlReact: `/Profile/Setting`,
            });
        }

        // Create notifications for all clients
        for (const client of clients) {
            await ClientNotification.create({
                client_id: client._id,
                message: `${otherSkills} is added in the list of skills.`,
                urlReact: `/`,
            });
        }
  
        res.status(200).json({ message: 'Successfully updated.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

//if not accepted
const updateOtherSkill = async (req, res) => {
    const { message } = req.body;
  
    try {
        // Check for duplicate messages in request body
        const hasDuplicates = message.some((obj, index) => {
            if (obj.message.trim() === '') {
                throw new Error('Please enter a reason.');
            }
            //if there is an existing reason in the body
            let foundDuplicate = false;
            message.forEach((innerObj, innerIndex) => {
            if (index !== innerIndex && obj.message === innerObj.message) {
                foundDuplicate = true;
            }
            });
            return foundDuplicate;
        });
  
        if (hasDuplicates) {
            return res.status(400).json({ error: 'Please remove repeating reason.' });
        }

        //update if approve or not
        await OtherSkill.updateOne({ _id: req.params.id }, { $unset: { message: 1 } });
        const otherSkill = await OtherSkill.findOneAndUpdate(
            { _id: req.params.id },
            {
                $push: { message },
                $set: { skillIsVerified: "false" },
            },
            { new: true }
        );
  
        // Notification
        const otherSkillNotif = await OtherSkill.findOne({ _id: req.params.id }).populate('message');
        
        //detector either the user is skilled_id or client_id,  which one will have the value
        const skilledId = otherSkill.skilled_id;
        const clientId = otherSkill.client_id;

        // Determine who requested the skill and create the appropriate notification
        const skilledInfo = await SkilledInfo.findOne({ _id: skilledId });
        const clientInfo = await ClientInfo.findOne({ _id: clientId });

        const messageIds = otherSkillNotif.message.map(msg => msg.message);
        let messageNotif = '';
        let isVerified = otherSkillNotif.skillIsVerified;
        let isVerifiedValue;
  
        // if (isVerified === 'true') {
        //     isVerifiedValue = 'approved';
        //     messageNotif = `The skill you have requested has been ${isVerifiedValue}.`;
        // } else 
        // if (isVerified === 'false') {
        //     isVerifiedValue = 'disapproved';
    
            const messages = await Promise.all(
            messageIds.map(async (msgId) => {
                if (msgId) {
                const msg = await ReasonSkill.findOne({ _id: msgId });
                return msg.reason;
                }
                return null;
            })
            );
  
            messageNotif = `The skill you have requested is not approved. Reason: ${messages.filter(msg => msg !== null).join(', ')}.`;
        // }
  
        // const skilled_id = otherSkillNotif.skilled_id;
        // const skilledInfo = await SkilledInfo.findOne({ _id: skilled_id });
  
        // // Create a notification after updating creating barangay
        // const notification = await SkilledNotification.create({
        //     skilled_id,
        //     message: messageNotif,
        //     urlReact: `/Profile/Setting`,
        // });
        //NOTIFICATION WILL DETECT EITHER SKILLED OR CLIENT REQUESTED THE SKILL
        if (skilledInfo) {
            // Requester is a skilled
            const notification = await SkilledNotification.create({
                skilled_id: skilledId,
                message: messageNotif,
                urlReact: `/Profile/Setting`,
            });
        } else if (clientInfo) {
            // Requester is a client
            const notification = await ClientNotification.create({
                client_id: clientId,
                message: messageNotif,
                urlReact: `/Profile/Setting`,
            });
        }
  
        res.status(200).json({ message: 'Successfully updated.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createOtherSkills,
    getAllOtherSkill,
    getAllOtherSkillTrue, 
    getAllOtherSkillFalse,
    updateOtherSkillAccepted,
    updateOtherSkill,
}