// Import necessary modules
const Section = require("../models/Section");
const SubSection = require("../models/Subsection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");



// function isFileTypeSupported(type, supportedTypes) {
//   return supportedTypes.includes(type);
// }

// Create a new sub-section for a given section
exports.createSubSection = async (req, res) => {
  try {
      // Extract necessary information from the request body
      const { sectionId, title, description } = req.body;
      const file = req.files.videoFile;

      // Check if all necessary fields are provided
      if (!sectionId || !title || !description || !file) {
          return res.status(404).json({
              success: false,
              message: "All Fields are Required",
          });
      }

      // // Validation
      // const supportedTypes = ["mp4", "mov"];
      // const fileType = file.name.split('.').pop().toLowerCase();
      // console.log("File Type:", fileType);

      // // TODO: Add an upper limit of 5MB for Video
      // if (!isFileTypeSupported(fileType, supportedTypes)) {
      //     return res.status(400).json({
      //         success: false,
      //         message: "File format not supported",
      //     });
      // }

      // File format is supported
      console.log("Uploading to Cloudinary");
      const uploadDetails = await uploadImageToCloudinary(file, process.env.FOLDER_NAME);
      console.log("Upload successful:", uploadDetails);

      // Create a new sub-section with the necessary information
      const SubSectionDetails = await SubSection.create({
          title: title,
          timeDuration: `${uploadDetails.duration}`,
          description: description,
          videoUrl: uploadDetails.secure_url,
      });

      // Update the corresponding section with the newly created sub-section
      const updatedSection = await Section.findByIdAndUpdate(
          { _id: sectionId },
          { $push: { subSection: SubSectionDetails._id } },
          { new: true }
      ).populate("subSection");

      // Return the updated section in the response
      return res.status(200).json({
          success: true,
          data: updatedSection,
      });
  } catch (error) {
      // Handle any errors that may occur during the process
      console.error("Error creating new sub-section:", error);
      return res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message,
      });
  }
};


// updateSubSection
exports.updateSubSection = async (req, res) => {
    try {
        const { subSectionId, title, description } = req.body;
        const subSection = await SubSection.findById(subSectionId);

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        // Update title and description if provided
        if (title !== undefined) {
            subSection.title = title;
        }

        if (description !== undefined) {
            subSection.description = description;
        }

        // If a new video file is provided
        if (req.files && req.files.videoFile) {
            const video = req.files.videoFile;

            console.log("Uploading new video to Cloudinary...");
            const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

            // Ensure upload was successful before updating
            if (uploadDetails && uploadDetails.secure_url) {
                console.log("Upload successful:", uploadDetails);

                subSection.videoUrl = uploadDetails.secure_url;
                subSection.timeDuration = `${uploadDetails.duration}`;
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Failed to upload video",
                });
            }
        }

        // Save updated subsection
        await subSection.save();

        return res.status(200).json({
            success: true,
            message: "SubSection updated successfully",
            data: subSection,
        });

    } catch (error) {
        console.error("Error updating subsection:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the subsection",
            error: error.message,
        });
    }
};

  
  // deleteSubSection
  exports.deleteSubSection = async (req, res) => {
    try {
      const { subSectionId, sectionId } = req.body
      await Section.findByIdAndUpdate(
        { _id: sectionId },
        {
          $pull: {
            subSection: subSectionId,
          },
        }
      )
      const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
  
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }
  
      return res.json({
        success: true,
        message: "SubSection deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
  }