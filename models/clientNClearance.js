const mongoose = require('mongoose') 

const Schema = mongoose.Schema 

const messageSchema = new Schema({
    message:{
        type: String,
        ref: 'Reason',
        default: ''
    }
})

const clientNClearance = new Schema({
    photo: [{
        url: { type: String, required: true },
        public_id: { type: String, required: true },
    }],
    cloudinary_id:{
        type: String
    },
    nClearanceExp:{
        type: Date,
        required: true,
    },
    nClearanceIsVerified:{
        type: String,
        default: "pending",
    },
    message:[messageSchema],
    isRead:{
        type: Number,
        default: 0,
    },
    isExpired:{
        type: Number,
        default: 0,
    },
    isDeleted:{
        type: Number,
        default: 0,
    },
    client_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ClientInfo'
    },
},{timestamps: true})

module.exports = mongoose.model('ClientNClearance',clientNClearance)