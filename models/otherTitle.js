const mongoose = require('mongoose') 

const Schema = mongoose.Schema

const messageSchema = new Schema({
    message:{
        type: String,
        ref: 'ReasonSkill',
        default: ''
    }
})

const otherTitleSchema = new Schema({
    categorySkill:{
        type: String,
        ref: 'AdminSkill',
        required: true
    },
    otherTitles:{
        type: String,
        default: '',
        trim: true
    },
    skillCert_id:{
        type: String,
        ref: 'SkillCert'
    },
    skilled_id:{
        type: String,
        ref: 'SkilledInfo'
    },
    client_id:{
        type: String,
        ref: 'ClientInfo'
    },
    titleIsVerified:{
        type: String,
        default: "pending"
    },
    message:[messageSchema],
    isDeleted:{
        type: Number,
        default: 0,
    }


},{timestamps: true})

module.exports = mongoose.model('OtherTitle',otherTitleSchema)