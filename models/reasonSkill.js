const mongoose = require('mongoose')

const Schema = mongoose.Schema

const reasonSkillSchema = new Schema({
    
    reason:{
        type: String,
        default: ''
    },
    isDeleted:{
        type: Number,
        default: 0
    }

},{timestamps: true})

module.exports = mongoose.model('ReasonSkill',reasonSkillSchema)