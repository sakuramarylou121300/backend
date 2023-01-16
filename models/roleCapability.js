const mongoose = require('mongoose')

const Schema = mongoose.Schema

const roleCapabilitySchema = new Schema({

    role_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    capability_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    adminInfo_id:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'AdminInfo'
    }

},{timestamps: true})

module.exports = mongoose.model('RoleCapability',roleCapabilitySchema)