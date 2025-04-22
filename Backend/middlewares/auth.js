const jwt = require("jsonwebtoken");
const User = require("../models/User")
require("dotenv").config();

// authentication

exports.auth = async (req,res,next)=> {
    try{
        // extract token
        const authToken = req.cookies.authToken || req.body.authToken || req.header("Authentication").replace("Bearer","");
        // console.log("ye rha token---",token);
        // if tokem missing the return response
            if(!authToken)
            {
                return res.status(401).json({
                    success:false,
                    message:`authToken is missing`,
                });
            }

        // verify the token
        try{
            const payload =jwt.verify(authToken,process.env.JWT_SECRET);
            //ab token k andar ke payload ki info bi decode me aa gai hai
            console.log(payload);


            // user me payload vali info bhi insetr kr rhe hai{email,accountType,id ye sab}
            req.user = payload; // important line

        }
        catch(err){
             //verification - issue
             return res.status(401).json({
                success:false,
                message:'authToken is invalid',
            });
        }
        next();

        }
    catch(error){
        return res.status(401).json({
            success:false,
            message:'Something went wrong while validating the authToken',
        });

    }

}


// isStudent 
exports.isStudent = async (req,res,next) => {
    try{
        if(req.user.accoutType !=="Student")
        {
            return res.status(401).json({
                success:false,
                message:`This is a protected route for Students only`,

            });
        }
        next();

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified, please try again'
        })

    }
}


//isInstructor
exports.isInstructor = async (req, res, next) => {
    try{
           if(req.user.accountType !== "Instructor") {
               return res.status(401).json({
                   success:false,
                   message:'This is a protected route for Instructor only',
               });
           }
           next();
    }
    catch(error) {
       return res.status(500).json({
           success:false,
           message:'User role cannot be verified, please try again'
       })
    }
   }


//isAdmin
exports.isAdmin = async (req, res, next) => {
    try{
           if(req.user.accountType !== "Admin") {
               return res.status(401).json({
                   success:false,
                   message:'This is a protected route for Admin only',
               });
           }
           next();
    }
    catch(error) {
       return res.status(500).json({
           success:false,
           message:'User role cannot be verified, please try again'
       })
    }
   }