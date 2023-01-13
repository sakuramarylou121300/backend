const mongoose = require('mongoose')

const Schema = mongoose.Schema

const skillCertSchema = new Schema({
    categorySkill:{
        type: String,
        required: true
    },
    title:{
        type: String,
        required: true
    },
    issuedOn:{
        type: String,
        required: true
    },
    validUntil:{
        type: String,
        required: true
    },
    desc:{
        type: String
    },
    photo:{
        type: String,
        required: true
    },
    skillIsVerified:{
        type: Number,
        default: 0
    },
    skilled_id:{
        type: String,
        required: true,
        ref: 'SkilledInfo'
    },

},{timestamps: true})

module.exports = mongoose.model('SkillCert',skillCertSchema)