const mongoose = require('mongoose')

const Schema = mongoose.Schema

const billSchema = new Schema({
    billPhoto:{
        type: String,
        required: true
    },
    billIssuedOn:{
        type: Number,
        required: true
    },
    billIsVerified:{
        type: Number,
        default: 0
    },
    billMessage:{
        type: String,
        default:''
    },
    skilled_id:{
        type: String,
        required: true,
        ref: 'SkilledInfo'
    },

},{timestamps: true})

exports.handler = async (event) => {
    try {
        // update all the documents in the 'SkilledBill' collection that match the specified query
        const bills = await this.updateMany({ billIsVerified: 1 }, { $set: { billIsVerified: 0, billMessage: "Please pay your bill" } });
        return { statusCode: 200, body: 'Bills updated successfully' };
    } catch (err) {
        return { statusCode: 500, body: err.toString() };
    }
};

module.exports = mongoose.model('SkilledBill',billSchema)