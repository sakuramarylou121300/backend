const mongoose = require('mongoose')

const Schema = mongoose.Schema

const reasonSkillSchema = new Schema({
    
    reason:{
        type: String,
        default: ''
    },
    reasonType:{
        type: String,
        enum:[
            'skill',
            'title',
        ]
    },
    isDeleted:{
        type: Number,
        default: 0
    }

},{timestamps: true})

module.exports = mongoose.model('ReasonSkill',reasonSkillSchema)