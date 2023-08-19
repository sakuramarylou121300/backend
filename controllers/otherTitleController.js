const OtherTitle = require('../models/otherTitle')
const SkillTitle = require('../models/skillTitle')
const AdminSkill = require('../models/adminSkill')
const ReasonSkill = require('../models/reasonSkill')
const SkilledInfo = require('../models/skilledInfo')
const ClientInfo = require('../models/clientInfo')
const SkilledNotification = require('../models/skilledNotification')
const ClientNotification = require('../models/clientNotification')
const Certificate = require('../models/skillCert')

const mongoose = require('mongoose')

//GET all otherTitle
const getAllOtherTitle = async(req, res)=>{     
    try{
        const otherTitle = await OtherTitle
        .find({isDeleted: 0, titleIsVerified: "pending"})
        .sort({createdAt: -1})
        .populate({
            path: 'skilled_id'
        })
        .populate({
            path: 'categorySkill'
        })
        .populate({
            path: 'message.message',
            model: 'ReasonSkill',
            select: 'reason',
            options: { lean: true },
        })
        res.status(200).json(otherTitle)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET all otherTitle
const getAllOtherTitleTrue = async(req, res)=>{     
    try{
        const otherTitle = await OtherTitle
        .find({isDeleted: 0, titleIsVerified: "true"})
        .sort({createdAt: -1})
        .populate({
            path: 'skilled_id'
        })
        .populate({
            path: 'categorySkill'
        })
        .populate({
            path: 'message.message',
            model: 'ReasonSkill',
            select: 'reason',
            options: { lean: true },
        })
        res.status(200).json(otherTitle)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET all otherTitle
const getAllOtherTitleFalse = async(req, res)=>{     
    try{
        const otherTitle = await OtherTitle
        .find({isDeleted: 0, titleIsVerified: "false"})
        .sort({createdAt: -1})
        .populate({
            path: 'skilled_id'
        })
        .populate({
            path: 'categorySkill'
        })
        .populate({
            path: 'message.message',
            model: 'ReasonSkill',
            select: 'reason',
            options: { lean: true },
        })
        res.status(200).json(otherTitle)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
//if accepted
const updateOtherTitleAccepted = async (req, res) => {
    const { categorySkill, otherTitles,  skillCert_id} = req.body;
  
    try {
        //update if approve or not
        await OtherTitle.updateOne({ _id: req.params.id }, { $unset: { message: 1 } });
        
        if (!otherTitles){
            return res.status(400).json({ error: 'Please enter title.' });
        }
        const otherTitle = await OtherTitle.findOneAndUpdate(
            { _id: req.params.id },
            {
                categorySkill: categorySkill,
                otherTitles: otherTitles,
                $set: { titleIsVerified: "true" },
            },
            { new: true }
        );

        //add the other Title to Title list
        //create query
        const adminTitle = await SkillTitle.create({
            skill_id: categorySkill, 
            title: otherTitles
        })

        //update skilled worker skill
        const updateSkilledWorkerCert = await Certificate.findOneAndUpdate({_id: skillCert_id},{
            title: otherTitles
        })
        console.log(updateSkilledWorkerCert)

        //notification for all 
        // Fetch all Titleed workers and clients
        const skilledWorkers = await SkilledInfo.find();

        //find the value of categorySkill
        const categorySkillValue = await AdminSkill.findOne({
            _id: categorySkill
        })
        console.log(categorySkillValue)
        const skillValue = categorySkillValue.skill
        console.log(skillValue)
 
        // Create notifications for all Titleed workers
        for (const skilledWorker of skilledWorkers) {
            await SkilledNotification.create({
                skilled_id: skilledWorker._id,
                message: `${otherTitles} is added in the skill of ${skillValue}.`,
                urlReact: `/Profile/Setting`,
            });
        }
  
        res.status(200).json({ message: 'Successfully updated.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

//if not accepted
const updateOtherTitle = async (req, res) => {
    const { skillCert_id, message } = req.body;
  
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
        await OtherTitle.updateOne({ _id: req.params.id }, { $unset: { message: 1 } });
        const otherTitle = await OtherTitle.findOneAndUpdate(
            { _id: req.params.id },
            {
                $push: { message },
                $set: { titleIsVerified: "false" },
            },
            { new: true }
        );
        //if declined
        //find the category skill, and other skill based on skillCert_id
        const skillCert_idValue = await OtherTitle.findOne({_id: req.params.id})
        console.log(skillCert_idValue)
        //find the value of otherTitles
        otherTitlesValue = skillCert_idValue.otherTitles

        //update skilled worker skill
        const updateSkilledWorkerCert = await Certificate.findOneAndUpdate({_id: skillCert_id},{
            title: `Requested ${otherTitlesValue} title not approved.`
        })
        console.log(updateSkilledWorkerCert)
  
        // Notification
        const otherTitleNotif = await OtherTitle.findOne({ _id: req.params.id }).populate('message');
        const messageIds = otherTitleNotif.message.map(msg => msg.message);
        let messageNotif = '';
        let isVerified = otherTitleNotif.titleIsVerified;
        let isVerifiedValue;
  
            const messages = await Promise.all(
            messageIds.map(async (msgId) => {
                if (msgId) {
                const msg = await ReasonSkill.findOne({ _id: msgId });
                return msg.reason;
                }
                return null;
            })
            );
  
            messageNotif = `The certificate ${otherTitlesValue} title you have requested is not approved. Reason ${messages.filter(msg => msg !== null).join(', ')}. Please update your certificate detail.`;
  
        const skilled_id = otherTitleNotif.skilled_id;
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
    getAllOtherTitle,
    getAllOtherTitleTrue,
    getAllOtherTitleFalse,
    updateOtherTitleAccepted,
    updateOtherTitle,
}