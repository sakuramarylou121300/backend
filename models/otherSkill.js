const mongoose = require('mongoose') 

const Schema = mongoose.Schema

const messageSchema = new Schema({
    message:{
        type: String,
        ref: 'ReasonSkill',
        default: ''
    }
})

const otherSkillSchema = new Schema({
    otherSkills:{
        type: String,
        default: '',
        trim: true
    },
    skilled_id:{
        type: String,
        ref: 'SkilledInfo'
    },
    client_id:{
        type: String,
        ref: 'ClientInfo'
    },
    skillIsVerified:{
        type: String,
        default: "pending"
    },
    message:[messageSchema],
    isDeleted:{
        type: Number,
        default: 0,
    }


},{timestamps: true})

module.exports = mongoose.model('OtherSkill',otherSkillSchema)