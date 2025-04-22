const User = require("../models/User");
const bcrypt = require("bcrypt");
const mailSender = require("../utils/mailSender")

// jb forgot password krenge na tab mail jayega email pr reset krne k liye

// resetPasswordToken
exports.resetPasswordToken = async (req,res) => {
    try{
        //fetch email
        const email = req.body.email;
        const user = await User.findOne({email:email});
        if(!user) {
            return res.json({success:false,
            message:'Your Email is not registered with us'});
        }

        // generate token
        const resetToken = crypto.randomUUID();//isse unique id milegi apno ko url k liye

        
        
        // update user by token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
            { email:email},
            { 
                resetToken:resetToken,
                resetPasswordExpires:Date.now()+5*60*1000,
            },
            {
                new:true,
             }
            );
     
     

    // create URL
    const url = `http://localhost:3000/update-password/${resetToken}`;
    console.log("updatedDetails ye rhi->",updatedDetails);
    console.log("ye rha reset link ka url->",url);

    // send mail containing the url
    await mailSender(email,"Password Reset Link",`Password Reset Link: ${url}`);

    //return response
    return res.json({
        success:true,
        message:'ResetLink sent successfully, please check email and change pwd',
    });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while sending reset pwd mail'
        })

    }
}

// reset password
exports.resetPassword = async (req,res) => {
    try{
        // data fetch 
        const {password,confirmPassword,resetToken} = req.body;//is token ko url se body me frontend ne dala hai
        // validation
        if(password !== confirmPassword) {
            return res.json({
                success:false,
                message:'Password not matching',
            });
        }

        // get user details from db using token
        const userDetails = await User.findOne({resetToken:resetToken});
        // if no entry invalisd token
        if(!userDetails) {
            return res.json({
                success:false,
                message:'Token is invalid',
            });
        }

        // token time check
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.json({
                success:false,
                message:'Token is expired, please regenerate your token',
            });
        }

        // hash pwd
        const hashedPassword = await bcrypt.hash(password, 10);

        // password update
        await User.findOneAndUpdate({resetToken:resetToken},
            {password:hashedPassword},
            {new:true},
        );
         //return response
         return res.status(200).json({
            success:true,
            message:'Password reset successful',
        });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while sending reset pwd mail'
        })

    }
}