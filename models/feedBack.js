const mongoose = require('mongoose')

const Schema = mongoose.Schema

const feedBackSchema = new Schema({
    
    refId:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'clientInfo'
    },
    rate:{
        type: String
    },
    comment:{
        type: String
    }
    
},{timestamps: true})

module.exports = mongoose.model('FeedBack',feedBackSchema)