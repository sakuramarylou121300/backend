const OtherSkill = require('../models/otherSkill')
const ReasonSkill = require('../models/reasonSkill')
const SkilledInfo = require('../models/skilledInfo')
const ClientInfo = require('../models/clientInfo')
const AdminSkill = require('../models/adminSkill')
const SkilledNotification = require('../models/skilledNotification')
const ClientNotification = require('../models/clientNotification')

const mongoose = require('mongoose')


//GET all otherSkill
const getAllOtherSkill = async(req, res)=>{     
    try{
        const otherSkill = await OtherSkill
        .find({isDeleted: 0})
        .sort({createdAt: -1})
        .populate({
            path: 'skilled_id'
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
                urlReact: `/Profile/Setting`,
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
  
            messageNotif = `The skill you have requested is not approved. Reason ${messages.filter(msg => msg !== null).join(', ')}.`;
        // }
  
        const skilled_id = otherSkillNotif.skilled_id;
        const skilledInfo = await SkilledInfo.findOne({ _id: skilled_id });
  
        // Create a notification after updating creating barangay
        const notification = await SkilledNotification.create({
            skilled_id,
            message: messageNotif,
            urlReact: `/Profile/Setting`,
        });
  
        res.status(200).json({ message: 'Successfully updated.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getAllOtherSkill,
    updateOtherSkillAccepted,
    updateOtherSkill,
}