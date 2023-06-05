    const mongoose = require('mongoose')    

    const Schema = mongoose.Schema

    const skillSchema = new Schema({
    
        skillName:{
            type: String,
            ref: 'AdminSkill',
            required: true,
        },
        skilled_id:{
            type: String,
            required: true,
            ref: 'SkilledInfo'
        },
        isDeleted:{
            type: Number,
            default: 0,
        },
    },{timestamps: true})

    module.exports = mongoose.model('Skill',skillSchema)