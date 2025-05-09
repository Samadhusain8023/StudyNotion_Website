const Section = require("../models/Section");
const Course =  require("../models/Course");

// CREATE a section
exports.createSection = async (req,res) =>{
    try{

        // data fetch
        const {sectionName,courseId} = req.body;
        // data validation
        if(!sectionName || ! courseId){
            return res.status(400).json({
                success:false,
                message:`missing properties`,
            });
        }

        // create section
        const newSection = await Section.create({ sectionName});

      //update course with section ObjectID
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId,
            {
                $push:{
                    courseContent:newSection._id,
                }
            },
            {new:true},
        )
        //HW: use populate to replace sections/sub-sections both in the updatedCourseDetails
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        })
        .exec();

         
        //return response
        return res.status(200).json({
            success:true,
            message:'Section created successfully',
            updatedCourseDetails,
        })
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:"Unable to create Section, please try again",
            error:error.message,
        });
    }
};

// UPDATE a section
exports.updateSection = async (req,res) => {
    try {

        //data input
        const {sectionName, sectionId} = req.body;
        //data validation
        if(!sectionName || !sectionId) {
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
        }

        //update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});

        //return res
        return res.status(200).json({
            success:true,
            message:'Section Updated Successfully',
        });

    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:"Unable to update Section, please try again",
            error:error.message,
        });
    }
};

// DELETE a section
exports.deleteSection = async (req,res) => {
    try {
        //get ID - assuming that we are sending ID in params
        const {sectionId,courseId} = req.body

         // Find the course that contains the section and remove it from courseContent
         const updatedCourse = await Course.findByIdAndUpdate(
            courseId, // The ID of the course to update
            { $pull: { courseContent: sectionId } }, // Remove the section from the courseContent array
            { new: true } // Return the updated course after modification
        );

        //use findByIdandDelete
        await Section.findByIdAndDelete(sectionId);
    

        //return response
        return res.status(200).json({
            success:true,
            message:"Section Deleted Successfully",
        })

    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:"Unable to delete Section, please try again",
            error:error.message,
        });
    }
}