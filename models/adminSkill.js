const mongoose = require('mongoose')

const Schema = mongoose.Schema

const adminSkill = new Schema({
   
    skill:{
        type: String,
        required: true,
        unique: true
    },

},{timestamps: true})

module.exports = mongoose.model('AdminSkill',adminSkill)