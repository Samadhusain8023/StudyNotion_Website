const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,

    },
    otp:{
        type:String,

    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60*1000,
    }
});

// a function to send email
async function sendVerificationEmail(email,otp)
{
    try{
        const mailResponse = await mailSender(email,"Verification email from studynotion",otp);
        console.log("mail sent hone k bad jo nodemailer ne return kiya hai=>", mailResponse);
    }
    catch(error) {
        console.log("error occured while sending mails: ", error);
        throw error;
    }
}

// ye hai na otp ko db me save krne se just  phle otp ka verification mail bhej dega qki isme pre hook lga hai
OTPSchema.pre("save",async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})

module.exports = mongoose.model("OTP",OTPSchema);