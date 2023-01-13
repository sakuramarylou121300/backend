const mongoose = require('mongoose')

const Schema = mongoose.Schema

const experienceSchema = new Schema({
   
    categorySkill:{
        type: String,
        required: true
    },
    title:{
        type: String,
        required: true
    },
    desc:{
        type: String
    },
    photo:{
        type: String,
        required: true
    },
    refName:{
        lname:{
            type: String,
            required: true
        },
        fname:{
            type: String,
            required: true
        },
        mname:{
            type: String,
        }
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
        type: String,
        required: true
    },
    expIsVerified:{
        type: Number,
        default: 0
    },
    skilled_id:{
        type: String,
        required: true,
        ref: 'SkilledInfo'
    },

},{timestamps: true})

module.exports = mongoose.model('Experience',experienceSchema)