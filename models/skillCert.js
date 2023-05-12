const mongoose = require('mongoose')   
 
const Schema = mongoose.Schema 

const skillCertSchema = new Schema({
    categorySkill:{
        type: String,
        ref: 'AdminSkill',
        required: true
    },
    title:{
        type: String,
        required: true,
        trim: true
    },
    validUntil:{
        type: Date,
        required: true
    },
    photo:{
        type: String,
        required: true
    },
    cloudinary_id:{
        type: String
    },
    skillIsVerified:{
        type: String,
        default: "pending"
    },
    message:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reason',
        default: ""
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
    isExpired:{
        type: Number,
        default: 0
    },
    isDeleted:{
        type: Number,
        default: 0
    },

},{timestamps: true})

module.exports = mongoose.model('SkillCert',skillCertSchema)