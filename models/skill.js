const mongoose = require('mongoose')

const Schema = mongoose.Schema

const skillSchema = new Schema({
   
    skillName:{
        type: String,
        required: true,
    },
    skilled_id:{
        type: String,
        required: true,
        ref: 'SkilledInfo'
    },

},{timestamps: true})

module.exports = mongoose.model('Skill',skillSchema)