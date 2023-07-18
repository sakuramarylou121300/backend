const mongoose = require('mongoose')    

const Schema = mongoose.Schema

const commentSchema = new Schema({
    star: {
        type: Number,
        default: 0
    },
    comment:{
        type: String
    },
    skill_id:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Skill" 
    },
    client_id:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "ClientInfo"
    },
    skilledId:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "SkilledInfo"
    },
    cloudinary_id:{
        type: String,
    },
    photo: [{
        url: { type: String, required: true },
        public_id: { type: String, required: true },
    }],
    // photo:{
    //     type: String,
    // },
    // cloudinary_id:{
    //     type: String
    // },
    isDeleted:{
        type: Number,
        default: 0,
    },
},
{
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true },
    timestamps: true// So `console.log()` and other functions that use `toObject()` include virtuals
},
{timestamps: true})
commentSchema.virtual('replies', {
    ref: 'Reply',
    localField: '_id',
    foreignField: 'comment_id'
});

module.exports = mongoose.model('ClientComment',commentSchema)
