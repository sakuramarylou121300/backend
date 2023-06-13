const mongoose = require('mongoose')    

const Schema = mongoose.Schema

const skillSchema = new Schema({

    skillName:{
        type: String,
        ref: 'AdminSkill',
        required: true,
    },
    ratings: [
        {
            star: Number,
            //this is the client who rate the skill of the skilled worker
            postedby: { type: mongoose.Schema.Types.ObjectId, ref: "ClientInfo" },
        },
    ],
    totalrating: {
        type: String,
        default: 0,
    },
    //this is where the skill belong
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
