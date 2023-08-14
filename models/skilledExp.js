const mongoose = require('mongoose') 

const Schema = mongoose.Schema 

const messageSchema = new Schema({
    message:{
        type: String,
        ref: 'Reason',
        default: ''
    }
})
const skilledExp = new Schema({
    
    categorySkill:{
        type: String,
        ref: 'AdminSkill',
        required: true
    },
    isHousehold:{
        type: String,
        default: 'false'
    },
    company:{
        type: String,
        default: '',
        trim: true
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
        required: true,
        trim: true
    },
    refFname:{
        type: String,
        required: true,
        trim: true
    },
    refMname:{
        type: String,
        default: '',
        trim: true
    },
    refPosition:{
        type: String,
        required: true,
        trim: true
    },
    refOrg:{
        type: String,
        required: true,
        trim: true
    },
    refContactNo:{
        type: Number,
        required: true,
        trim: true
    },
    expIsVerified:{
        type: String,
        default: "pending"
    },
    message:[messageSchema],
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