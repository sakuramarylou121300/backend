const mongoose = require('mongoose') 

const Schema = mongoose.Schema

const clientReqSchema = new Schema({
    skill_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
    },
    skilled_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "SkilledInfo",
    },
    reqStatus:{
        type: String,
        default: 'pending',
        enum:[
            'pending',
            'requestAccepted',
            'reqCompleted',
            'reqToRate',
            'reqRated'
        ]
    },
    client_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ClientInfo"
    },
    isDeleted:{
        type: Number,
        default: 0,
    }

},{timestamps: true})

module.exports = mongoose.model('ClientReq',clientReqSchema)