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
//     barangay:{
//         type:String
//     },
//     city:{
//         type:String
//     },
//     province:{
//         type:String
//     }  
// })

const skilledInfoSchema = new Schema({
    
    username:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    lname:{
        type: String,
        required: true
    },
    fname:{
        type: String,
        required: true
    },
    mname:{
        type: String
    }, 
    contact:{
        type:String,
        required: true
    },
    address:{
        houseNo:{
            type:Number,
            default:0
        },
        street:{
            type:String,
            required: true
        },
        barangay:{
            type:String,
            required: true
        },
        city:{
            type:String,
            default: "San Fernando"},
        prov:{
            type:String,
            default: "Pampanga"
        },
        addIsVerified:{
            type: Number,
            default: 0
        }
    }, 
    bill:{
        billPhoto:{
            type:String},
        billIssuedOn:{
            type: String,
            required: true
        },
        billIsVerified:{
            type: Number,
            default: 0
        }
    },
    brgyClearance:{
        type: String
    },
    nbiClearance:{
        type: String
    },
    idIsVerified:{
        type: Number,
        default: 0
    },
    userIsVerified:{
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
    toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
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

skilledInfoSchema.virtual('experience', {
    ref: 'Experience',
    localField: '_id',
    foreignField: 'skilled_id'
});

skilledInfoSchema.virtual('skillCert', {
    ref: 'SkillCert',
    localField: '_id',
    foreignField: 'skilled_id'
});

skilledInfoSchema.virtual('skilledBill', {
    ref: 'SkilledBill',
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
    address,
    brgyClearance,
    nbiClearance,
    bill
){
    // await userExists(username);
    //validation
    if (!username || !password || !lname || !fname || !contact || 
        !address){
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
    //check if  is existing admin, client and skilled
    const adminExists = await AdminInfo.findOne({username})
    if (adminExists){
        throw Error('Email already in use. Please enter a new unique .')
    }
    const clientExists = await ClientInfo.findOne({username})
    if (clientExists){
        throw Error('Email already in use. Please enter a new unique .')
    }
    const exists = await this.findOne({username})
    if (exists){
        throw Error('Email already in use. Please enter a new unique .')
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
        address,
        brgyClearance,
        nbiClearance,
        bill
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

