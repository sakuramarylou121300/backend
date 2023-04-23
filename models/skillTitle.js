const mongoose = require('mongoose')

const Schema = mongoose.Schema

const skillTitleSchema = new Schema({
    
    title:{
        type: String,
        required: true,
        trim: true
    },
    skill_id:{
        type: String, 
        ref: 'AdminSkill'
    },
    isDeleted:{
        type: Number,
        default: 0
    },

},{timestamps: true})

module.exports = mongoose.model('SkillTitle',skillTitleSchema)