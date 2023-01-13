const mongoose = require('mongoose')

const Schema = mongoose.Schema

const qualificationSchema = new Schema({
    
    refId:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'skilledInfo'
    },
    qualificationName:{
        type: String
    }

},{timestamps: true})

module.exports = mongoose.model('Qualification',qualificationSchema)