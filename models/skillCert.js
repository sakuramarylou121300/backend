const mongoose = require('mongoose')   
 
const Schema = mongoose.Schema 

const messageSchema = new Schema({
    message:{
        type:  String,
        ref: 'Reason',
        default: ''
    }
})

const skillCertSchema = new Schema({
    categorySkill:{
        type: String,
        ref: 'AdminSkill',
        required: true
    },
    title:{
        type: String,
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
    message:[messageSchema],
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