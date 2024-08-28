
import clientPostModel from "../model/clientPostModel.js";
import userModel from "../model/userModel.js";

import fs from "fs";
import slugify from "slugify";


import dotenv from "dotenv";
dotenv.config();

// create job post controller com backend
export const createPostController = async (req, res) => {
    try {
        const { name, description,category,user } =req.fields;
        const { photo } = req.files;
        //validation
        
        switch (true) {
          case !name:
            return res.status(500).send({ error: "Name is Required" });
          case !description:
            return res.status(500).send({ error: "Description is Required" });
          case !category:
            return res.status(500).send({ error: "Category is Required" });
          case !user:
            return res.status(500).send({ error: "user is Required" });
          case photo && photo.size > 1000000:
            return res.status(500).send({ error: "photo is Required and should be less then 1mb" });
        }
  
        const products = new clientPostModel({ ...req.fields, slug: slugify(name) });
        if (photo) {
          products.photo.data = fs.readFileSync(photo.path);
          products.photo.contentType = photo.type;
        }
        await products.save();
        res.status(201).send({
          success: true,
          message: "job Created Successfully",
          products,
        });
    } catch (error) {
      res.status(500).send({
        success: false,
        error: error.message,
        message: "Error in creating product",
      });
    }
}


// all job post controller com backend
export const getAllPostController = async (req, res) => {
    try {
      const posts = await clientPostModel
      .find({})
      .populate("category")
      .populate("user")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
      
      res.status(200).send({
        success: true,
        counTotal: posts.length,
        message: "All Post Fetched Successfully",
        posts,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        error: error.message,
        message: "Error in Fetching Posts",
      });
    }
}

// get photo com backend
export const jobPostPhotoController = async (req, res) => {
  try {
    const product = await clientPostModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Erorr while getting photo",
      error,
    });
  }
};

// get single product com backend
export const getSinglePostController = async (req, res) => {
  try {
    const product = await clientPostModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category")
      .populate("user");
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Eror while getitng single product",
      error,
    });
  }
};

// similar products showing
export const realtedJobController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await clientPostModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "error while geting related product",
      error,
    });
  }
};

// search product com backend
export const searchAllJobController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const resutls = await clientPostModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo")
      .populate("user");
    res.json(resutls);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In Search Product API",
      error,
    });
  }
};
 
// user id find profile photo show
export const userPhotoController = async (req, res) => {
  try {

    const product = await userModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }

  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Erorr while getting photo",
      error,
    });
  }
};

//pagination with per page com backend work end 
export const searchJobCategoryController = async(req, res) => {
  const { categoryId } = req.params; 
  try {
    const products = await clientPostModel
    .find({ category: categoryId })
    .populate("user")
    .populate("category");
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found for the given category ID."
      });
    }
    res.status(200).json({
      success: true,
      countTotal: products.length,
      message: "All Products Retrieved Successfully!",
      products: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "An error occurred while searching for products.",
    });
  }
}
  
// filters with radio and checkbox com backend
export const jobFiltersController = async (req, res) => {
  try {
    const { radio } = req.body;
    const products = await clientPostModel
    .find({
      $or: [
        { salary: { $regex: radio, $options: "i" } },
        { overtimehours: { $regex: radio, $options: "i" } },
      ],
    })
    .select("-photo")
    .populate("user")
    .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Filtering Products",
      error,
    });
  }
};

//delete controller com backend
export const deleteJobController = async (req, res) => {
  try {
    await clientPostModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Job Deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

// get single product com backend
export const getSingleJobController = async (req, res) => {
  try {
    const product = await clientPostModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category")
      .populate("user");
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Eror while getitng single product",
      error,
    });
  }
};

//pagination with per page com backend work start 
// product count
export const jobCountController = async (req, res) => {
  try {
    const total = await clientPostModel.find({})
    .estimatedDocumentCount()
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    res.status(400).send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
};
  
// product list base on page
export const jobListController = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await clientPostModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 })
      .populate("user")
      .populate("category");;
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};

//update product controller com backend
export const updateJobController = async (req, res) => {
  try {
    const { name, description,category,user } =req.fields;
    const { photo } = req.files;
    //validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !user:
        return res.status(500).send({ error: "phone is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case photo && photo.size > 1000000:
        return res.status(500).send({ error: "photo is Required and should be less then 1mb" });
    }

    const products = await clientPostModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );

    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    
    await products.save();
    res.status(201).send({
      success: true,
      message: "job Updated Successfully",
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error,
      message: "Error in Update product",
    });
  }
};