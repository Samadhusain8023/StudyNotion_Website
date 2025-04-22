const Category = require("../models/Category"); // Ensure this is correctly imported

// createCategory
exports.createCategory = async (req, res) => {
	try {
		const { name, description } = req.body;
		if (!name) {
			return res
				.status(400)
				.json({ success: false, message: "All fields are required" });
		}
		const CategorysDetails = await Category.create({
			name: name,
			description: description,
		});
		console.log(CategorysDetails);
		return res.status(200).json({
			success: true,
			message: "Categorys Created Successfully",
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};


// get all category handler
exports.showAllCategory = async (req, res) => {
    try{
        const allCategory = await Category.find({}, {name:true, description:true}); 
        res.status(200).json({
            success:true,
            message:"All Category returned successfully",
            allCategory,
        })
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};


// categoryPageDetails 
exports.categoryPageDetails = async (req, res) => {
    try {
        // Get categoryId from request body
        const { categoryId } = req.body;
        

        // Validate categoryId
        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Category ID is required",
            });
        }

        // Fetch the selected category and its courses
        const selectedCategory = await Category.findById(categoryId)
            .populate("courses") // ✅ Corrected from "course" to "courses"
            .exec();

        // Validate if category exists
        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        // Fetch courses for different categories (excluding the selected category)
        const differentCategories = await Category.find({ _id: { $ne: categoryId } })
            .populate("courses") // ✅ Corrected from "course" to "courses"
            .exec();

        // Return response
        return res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategories,
            },
        });

    } catch (error) {
        console.error("Error in categoryPageDetails:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
