import categoryModel from "../model/categoryModel.js";
import slugify from "slugify";
import clientPostModel from "../model/clientPostModel.js";

// create category
export const createCategoryController = async (req, res) => {
    try {
        const { name } = req.body;
        if(!name) {
            return res.status(401).send({ message: "Name is required" });
        }
        const existingCategory = await categoryModel.findOne({ name });
        if(existingCategory) {
            return res.status(200).send({
                success: true,
                message: "Category Already Exists"
            });
        }
        const category = await new categoryModel({
            name,
            slug: slugify(name)
        }).save();

        res.status(201).send({
            success: true,
            message: "Category created successfully",
            category
        })
    } catch (error) {
        res.state(500).send({ 
            success: false,
            error,
            message: "Error in creating category" 
        });
    }
}

// update category
export const updateCategoryController = async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params;
        const category = await categoryModel.findByIdAndUpdate(
            id,
            { name, slug: slugify(name) },
            { new: true }
        );
        res.status(200).send({
            success: true,
            message: "Category updated successfully",
            category
        })
    } catch (error) {
        res.state(500).send({
            success: false,
            message: "Error while updating category",
            error
        })
    }
}

// get all category
export const categoryController = async (req, res) => {
    try {
        const category = await categoryModel.find({});
        res.status(200).send({
            success: true,
            message: "All Categories",
            category
        })  
    } catch (error) {
        res.state(500).send({
            success: false,
            message: "Error while getting all categories",
            error
        })
    }
}

// get single category select with slug
export const singleCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.findOne({ slug: req.params.slug });
        res.status(200).send({
            success: true,
            message: "Get single category successfully",
            category
        })    
    } catch (error) {
        res.state(500).send({
            success: false,
            message: "Error while getting single category",
            error
        })
    }
}

// delete category selected id
export const deleteCategoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await clientPostModel.findOne({ category: id });
        if (post) {
            return res.status(200).send({
                success: false,
                message: "Please delete all posts under this category"
            })
        }

        await categoryModel.findByIdAndDelete(id);
        res.status(200).send({
            success: true,
            message: "Category deleted successfully",
        }) 
        
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error while deleting category",
            error
        })
    }
}

