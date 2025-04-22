const {instance} = require("../config/razorpay");
const User = require("../models/User");
const Course = require("../models/Course");
const mailSender = require("../utils/mailSender");
const { default: mongoose } = require("mongoose");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");

//capture the payment and initiate the Razorpay order
exports.capturePayment = async (req,res) => {
    
        // get courseId and userId 
        const { course_id } = req.body;
        const userId = req.user.id;

        // validation
        if(!course_id){
            return res.status(400).json({
                success:false,
                message:`Please provide valid course ID`
            })
        }

        let course;
        // vaid courseDateail
        try{
            course = await Course.findById(course_id);
            if(!course) {
                return res.json({
                    success:false,
                    message:'Could not find the course',
                });
            }

             //user already pay for the same course
            //  user ki id ko object id me change krna
            const uid =new mongoose.Types.ObjectId(userId);//convert string to objectid

            if(course.studentEnrolled.includes(uid))
            {
                return res.status(200).json({
                    success:false,
                    message:'Student is already enrolled',
                });
            }


        }
        catch(error){
            console.error(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            });

        }

        // order  create
        const amount = course.price;
        const currency = "INR";

        const option = {
            amount:amount*100,
            currency,
            receipt: Math.random(Date.now()).toString(),
            notes:{
                courseId:course_id,
                userId,
            }
        };

        try{
            //initiate the payment using razorpay
            const paymentResponse = await instance.orders.create(option);
            console.log(paymentResponse);

             //return response
            return res.status(200).json({
                success:true,
                courseName:course.courseName,
                courseDescription:course.courseDescription,
                thumbnail: course.thumbnail,
                orderId: paymentResponse.id,
                currency:paymentResponse.currency,
                amount:paymentResponse.amount,
            });

        }
        catch(error)
        {
            console.log(error);
            res.json({
                success:false,
                message:"Could not initiate order",
            });

        }

};


// verify signature of razorpay and server
exports.verifySignature = async (req,res) =>{
    const webHookSecret = "123456";

    const signature = req.headers["x-razorpay-signature"];

    // imp. 3 steps for encryption of our key
    const shasum = crypto.createHmac("sha256",webHookSecret);
    shasum.update(JSON.stringify(req.body));//strinf me convert kr rhe hai apni secretkey ko
    const digest = shasum.digest("hex");//hexadecimal m convert kr rhe hai

    if(signature === digest)
    {
        console.log("Payment is authorized");
        // ab action perfoem krenge phle courseid or userid ko order k notes se nikal lenge
        const {courseId, userId} = req.body.payload.payment.entity.notes;
        
        try
        {
            //fulfil the action

            //find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                                            {_id: courseId},
                                            {$push:{studentsEnrolled: userId}},
                                            {new:true},
            );

            if(!enrolledCourse) {
                return res.status(500).json({
                    success:false,
                    message:'Course not Found',
                });
            }

            console.log(enrolledCourse);

            //find the student andadd the course to their list enrolled courses me 
            const enrolledStudent = await User.findOneAndUpdate(
                                            {_id:userId},
                                            {$push:{courses:courseId}},
                                            {new:true},
            );

            console.log(enrolledStudent);

            //mail send krdo confirmation wala 
            const emailResponse = await mailSender(
                                    enrolledStudent.email,
                                    "Congratulations from CodeHelp",
                                    "Congratulations, you are onboarded into new CodeHelp Course",
            );

            console.log(emailResponse);
            return res.status(200).json({
                success:true,
                message:"Signature Verified and COurse Added",
            });
       
        }       
        catch(error) 
           {
                console.log(error);
                return res.status(500).json({
                    success:false,
                    message:error.message,
                });
            }
    }
    else{
        return res.status(400).json({
            success:false,
            message:'Invalid request',
        });
    }


};
