const mongoose = require('mongoose')    

const Schema = mongoose.Schema

const skillSchema = new Schema({

    skillName:{
        type: String,
        ref: 'AdminSkill',
        required: true,
    },
    ratings: [
        {
            star: Number,
            //this is the client who rate the skill of the skilled worker
            postedby: { type: mongoose.Schema.Types.ObjectId, ref: "ClientInfo" },
        },
    ],
    totalrating: {
        type: String,
        default: 0,
    },
    //this is where the skill belong
    skilled_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SkilledInfo'
    },
    isDeleted:{
        type: Number,
        default: 0,
    },
},{
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true },
    timestamps: true// So `console.log()` and other functions that use `toObject()` include virtuals
},{timestamps: true})
skillSchema.virtual('comments', {
    ref: 'ClientComment',
    localField: '_id',
    foreignField: 'skill_id'
});

module.exports = mongoose.model('Skill',skillSchema)
