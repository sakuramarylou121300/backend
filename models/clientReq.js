const mongoose = require('mongoose') 

const Schema = mongoose.Schema

const messageSchema = new Schema({
    message:{
        type: String,
        ref: 'ClientCancelReq',
        default: ''
    }
})

const clientReqSchema = new Schema({
    skill_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
    }, 
    skilled_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "SkilledInfo",
    },
    adminSkill_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "AdminSkill",
    },
    reqStatus:{
        type: String,
        default: 'pending',
        enum:[
            'pending',
            'reqAccepted',
            'reqCompleted',
            'reqCancelled'
        ]
    },
    message:[messageSchema],
    client_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ClientInfo"
    },
    reqDate:{
        type: Date
    },
    isDeleted:{
        type: Number,
        default: 0,
    }

},{timestamps: true})

module.exports = mongoose.model('ClientReq',clientReqSchema)