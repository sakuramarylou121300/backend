const mongoose = require('mongoose')    
const bcrypt = require('bcrypt')
const validator = require('validator') 

const Schema = mongoose.Schema

// const contactSchema = new Schema({
//     contactNo:{
//         type:String
//     }
// })

// const addressSchema = new Schema({
//     houseNo:{
//         type:String
//     },
//     street:{
//         type:String
//     },
//     barangayAddr:{
//         type:String
//     },
//     cityAddr:{
//         type:String
//     },
//     provinceAddrince:{
//         type:String
//     }  
// })

const skilledInfoSchema = new Schema({
    
    username:{
        type: String,
        required: true,
        trim: true
    },
    password:{
        type: String,
        required: true,
    },
    lname:{
        type: String,
        required: true,
        trim: true
    },
    fname:{
        type: String,
        required: true,
        trim: true
    },
    mname:{
        type: String,
        trim: true,
        default: ''
    }, 
    contact:{
        type: String,
        required: true,
        trim: true
    },
    houseNo:{
        type:Number,
        required: true,
        trim: true
    },
    street:{
        type:String,
        required: true,
        trim: true
    },
    barangayAddr:{
        type:String,
        required: true
    },
    cityAddr:{
        type:String,
        required: true
    },
    provinceAddr:{
        type:String,
        required: true
    },
    regionAddr:{
        type:String,
        required: true
    },
    addIsVerified:{
        type: Number,
        default: 0
    },
    idIsVerified:{
        type: Number,
        default: 0
    },
    userIsVerified:{
        type: Number,
        default: 0
    },
    isDeleted:{
        type: Number,
        default: 0
    }
    // validId:{
    //     type:String
    // },
    // profilePicture: {String},
    // profile:{
    //     type: String,
    //     default: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
    // },
    // contact:[contactSchema],
    // address:[addressSchema],
    // avatar:{
    //     type: String,
    //     default: 'https://res.cloudinary.com/dvq3isfr1/image/upload/v1672211059/avatar/blank-profile-picture-973460_1280-1-705x705_y25ybm.png'
    // }
},{
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true },
    timestamps: true// So `console.log()` and other functions that use `toObject()` include virtuals
},
{timestamps: true})

skilledInfoSchema.virtual('contacts', {
    ref: 'SkilledContact',
    localField: '_id',
    foreignField: 'skilled_id'
  });
  
skilledInfoSchema.virtual('location', {
ref: 'SkilledAddress',
localField: '_id',
foreignField: 'skilled_id'
});

skilledInfoSchema.virtual('skills', {
    ref: 'Skill',
    localField: '_id',
    foreignField: 'skilled_id'
});
skilledInfoSchema.virtual('skillExp', {
    ref: 'SkilledExp',
    localField: '_id',
    foreignField: 'skilled_id'
});
skilledInfoSchema.virtual('skillCert', {
    ref: 'SkillCert',
    localField: '_id',
    foreignField: 'skilled_id'
});
skilledInfoSchema.virtual('skillBarangay', {
    ref: 'SkilledBClearance',
    localField: '_id',
    foreignField: 'skilled_id'
});
skilledInfoSchema.virtual('skillBarangay', {
    ref: 'SkilledBClearance',
    localField: '_id',
    foreignField: 'skilled_id'
});
skilledInfoSchema.virtual('skillNbi', {
    ref: 'SkilledNClearance',
    localField: '_id',
    foreignField: 'skilled_id'
});
//static sign up method
//when using this, suggest to use regular function
skilledInfoSchema.statics.signup = async function (
    username, 
    password,
    lname,
    fname,
    mname,
    contact,
    houseNo,
    street,
    barangayAddr,
    cityAddr,
    provinceAddr,
    regionAddr
){
    // await userExists(username);
    //validation
    if (!username || !password || !lname || !fname || !contact || 
        !houseNo || !street || !barangayAddr || !cityAddr || !provinceAddr || !regionAddr){
        throw Error('Please fill in all the blank fields.')
    }

    //check  length
    if(username.length <8){
        throw Error('Please enter atleast 8 characters in user name.')
    }
    //check if strong password
    if(password.length <8){
        throw Error('Please enter atleast 8 characters in password.')
    }
    const mobileNumberRegex = /^09\d{9}$|^639\d{9}$/;
        
    if (!mobileNumberRegex.test(contact)) {
        throw new Error('Please check your contact number.');
    }

    //check if  is existing admin, client and skilled
    const adminExists = await AdminInfo.findOne({username})
    if (adminExists){
        throw Error('Username already in use.')
    }
    const clientExists = await ClientInfo.findOne({username})
    if (clientExists){
        throw Error('Username already in use.')
    }
    const exists = await this.findOne({username})
    if (exists){
        throw Error('Username already in use.')
    }

    const skilledInfoWithSameDetails = await this.findOne({
        fname: fname,
        mname: mname,
        lname: lname,
        contact: contact,
        houseNo: houseNo,
        street: street,
        barangayAddr: barangayAddr,
        cityAddr: cityAddr,
        provinceAddr: provinceAddr,
        regionAddr: regionAddr,
        isDeleted:{$in: [0, 1]}
    });

    if (skilledInfoWithSameDetails) {
    throw Error("User already exist.");
    }

    //salt for additional security of the system
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const skilledInfo = await this.create({
        username, 
        password: hash,// defining the value to password password with hash 
        lname,
        fname,
        mname,
        contact,
        houseNo,
        street,
        barangayAddr,
        cityAddr,
        provinceAddr,
        regionAddr
    })
    return skilledInfo
}

//static login method
skilledInfoSchema.statics.login = async function(username, password){

    if (!username || !password){
        throw Error('Please fill in all the blank fields.')
    }

    //check if  is existing
    const skilledInfo = await this.findOne({username})
    if (!skilledInfo){
        throw Error('Incorrect username.')
    }
      //check if the user is deleted
      if (skilledInfo.isDeleted === 1) {
        throw Error('Incorrect username.');
    }

    //check if the password and password hash in match
    const match = await bcrypt.compare(password, skilledInfo.password)
    //if not match
    if(!match){
        throw Error('Incorrect password.')
    }

    return skilledInfo
}

// exports.updateVerifiedUsers = async (event) => {
//     try {
//         // update all the documents in the 'skilledInfo' collection that match the specified query
//         const skilledInfos = await this.updateMany({
//             idIsVerified: 1,
//             "address.addIsVerified": 1,
//             skilledBill: { $elemMatch: { billIsVerified: 1 } }
//         }, { $set: { userIsVerified: 1 } });
//         return { statusCode: 200, body: 'Users updated successfully' };
//     } catch (err) {
//         return { statusCode: 500, body: err.toString() };
//     }
// };

// exports.updateNotVerifiedUsers = async (event) => {
//     try {
//         // update all the documents in the 'skilledInfo' collection that match the specified query
//         const skilledInfos = await this.updateMany({
//             $or: [
//                 { idIsVerified: 0 },
//                 { "address.addIsVerified": 0},
//                 { $and: [{ skilledBill: { $exists: true } }, 
//                     { skilledBill: { $not: { $elemMatch: { billIsVerified: 1 } } } }] }
//             ]
//         }, { $set: { userIsVerified: 0 } });
//         return { statusCode: 200, body: 'Users updated successfully' };
//     } catch (err) {
//         return { statusCode: 500, body: err.toString() };
//     }
// };

module.exports = mongoose.model('SkilledInfo', skilledInfoSchema)
const AdminInfo = require('../models/adminInfo') 
const ClientInfo = require('../models/clientInfo') 

