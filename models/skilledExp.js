const mongoose = require('mongoose') 

const Schema = mongoose.Schema 

const skilledExp = new Schema({
    
    categorySkill:{
        type: String,
        required: true
    },
    isHousehold:{
        type: String,
        default: 'false'
    },
    company:{
        type: String,
        default: ''
    },
    isWorking:{
        type: String,
        default: 'false'
    },
    workStart:{
        type: String,
        required: true
    },
    workEnd:{
        type: String,
        default: ''
    },
    photo: [{
        url: { type: String, required: true },
        public_id: { type: String, required: true },
    }],
    refLname:{
        type: String,
        required: true
    },
    refFname:{
        type: String,
        required: true
    },
    refMname:{
        type: String,
        default: ''
    },
    refPosition:{
        type: String,
        required: true
    },
    refOrg:{
        type: String,
        required: true
    },
    refContactNo:{
        type: Number,
        required: true
    },
    expIsVerified:{
        type: String,
        default: "pending"
    },
    message:{
        type: String,
        default: ""
    },
    cloudinary_id:{
        type: String,
        required: true,
    },
    skilled_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'SkilledInfo'
    },
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
},{timestamps: true})

module.exports = mongoose.model('SkilledExp',skilledExp)