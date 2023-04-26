const mongoose = require('mongoose') 

const Schema = mongoose.Schema

const adminSkill = new Schema({
   
    skill:{
        type: String,
        required: true,
        trim: true
    },
    isDeleted:{
        type: Number,
        default: 0
    },

},{timestamps: true})

module.exports = mongoose.model('AdminSkill',adminSkill)