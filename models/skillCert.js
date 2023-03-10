const mongoose = require('mongoose')   
 
const Schema = mongoose.Schema

const skillCertSchema = new Schema({
    categorySkill:{
        type: String,
        required: true
    },
    title:{
        type: String,
        required: true,
        trim: true
    },
    issuedOn:{
        type: String,
        required: true
    },
    validUntil:{
        type: String,
        required: true
    },
    photo:{
        type: String,
        required: true
    },
    skillIsVerified:{
        type: String,
        default: "false"
    },
    skilled_id:{
        type: String,
        required: true,
        ref: 'SkilledInfo'
    },
    isRead:{
        type: Number,
        default: 0
    },
    isDeleted:{
        type: Number,
        default: 0
    },

},{timestamps: true})

module.exports = mongoose.model('SkillCert',skillCertSchema)