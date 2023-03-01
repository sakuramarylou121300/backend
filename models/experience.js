const mongoose = require('mongoose') 

const Schema = mongoose.Schema

const experienceSchema = new Schema({
   
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
    // photo:{
    //     type: String,
    //     required: true
    // },
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
        default: ''
    },
    refOrg:{
        type: String,
        default: ''
    },
    refContactNo:{
        type: Number,
        required: true
    },
    expIsVerified:{
        type: Number,
        default: 0
    },
    isDeleted:{
        type: Number,
        default: 0
    },
    skilled_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'SkilledInfo'
    },

},{timestamps: true})

module.exports = mongoose.model('Experience',experienceSchema)