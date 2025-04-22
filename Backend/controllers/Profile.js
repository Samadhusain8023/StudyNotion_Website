const User = require("../models/User")
const Profile = require("../models/Profile")
const Course = require("../models/Course")
const { uploadImageToCloudinary } = require("../utils/imageUploader")


// Method for updating a profile
exports.updateProfile = async (req,res) =>{
    try{
        // get data
        const {dateOfBirth="",about="",contactNumber,gender}=req.body;

        // getUserId
        const id = req.user.id;

          //validation
        if(!contactNumber || !gender || !id) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        } 
        
        // find profile
        const userDetails = await User.findById(id);
        const profileId =  userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        
        // update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;

        await profileDetails.save();//important line for updation in db
        return res.status(200).json({
            success:true,
            message:'Profile Updated Successfully',
            profileDetails,
        });
         
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            error:error.message,
        });
    }
}


//deleteAccount
//Explore -> how can we schedule this deletion operation
exports.deleteAccount = async (req,res) => {
    try{
        // get id
        const id = req.user.id;

         //validation
         const userDetails = await User.findById(id);
         if(!userDetails) {
             return res.status(404).json({
                 success:false,
                 message:'User not found',
             });
         } 

        //  deleteProfile
        const  ProfileId = await Profile.findById(userDetails.additionalDetails);
        // console.log("salmankhan->",ProfileId);
        await Profile.findByIdAndDelete(ProfileId); 
         
        // HW unenroll user form all enrolled courses
        // await Course.findByIdAndDelete({_id:Course.studentEnrolled.id});


        //delete user
        await User.findByIdAndDelete(id);

        //return response
        return res.status(200).json({
            success:true,
            message:'User Deleted Successfully',
        })

    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:'User cannot be deleted successfully',
        });
    }
};

// get  user li all details
exports.getAllUserDetails = async (req, res) => {

    try {
        //get id
        const id = req.user.id;

        //validation and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        //return response
        return res.status(200).json({
            userDetails,
            success:true,            
            message:'User Data Fetched Successfully',
            
        });
       
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

// display picture update krna
exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
// user's enrolled courses
exports.getEnrolledCourses = async (req, res) => {
    try {
			const userId = req.user.id
			const userDetails = await User.findOne({
				_id: userId,
			})

				.populate("courses")
				.exec()


			if (!userDetails) {
				return res.status(400).json({
				success: false,
				message: `Could not find user with id: ${userDetails}`,
				})
					}

			return res.status(200).json({
				success: true,
				data: userDetails.courses,
			})


    } 
	catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};