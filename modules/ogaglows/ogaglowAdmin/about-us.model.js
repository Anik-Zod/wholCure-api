import mongoose, { Schema } from 'mongoose';

const aboutUsScgena = new Schema({
    firstImage:{
        type:String,
    },
    secondImage:{
        type:String,
    },
    FaqImage:{
        type:String,
    },
    FAQ:[{
        question:{
            type:String,
        },
        answer:{
            type:String,
        }
    }],
    banner:{
        image:{type:String},
        paragraph:{type:String},
        card1:{type:String},
        card2:{type:String},
        card3:{type:String},
        leftButton:{type:String},
        rightButton:{type:String},
    }


})

const aboutUsModel = mongoose.model('aboutUs', aboutUsScgena);

export default aboutUsModel;