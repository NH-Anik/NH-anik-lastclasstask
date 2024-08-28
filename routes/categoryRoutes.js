import  express from "express";
import {createCategoryController, updateCategoryController, categoryController, singleCategoryController, deleteCategoryController} from "../controllers/categoryController.js";
import { requestSignIn,isAdmin } from "../middleware/authMidleware.js";
const router = express.Router();

// routing
// create-category || method post
router.post("/create-category",requestSignIn,isAdmin , createCategoryController)

// create-category update
router.put("/update-category/:id",requestSignIn,isAdmin , updateCategoryController)

// create-category update
router.get("/get-category",categoryController)

//single create-category update
router.get("/single-category/:slug",singleCategoryController)

// delete create-category 
router.delete("/delete-category/:id",requestSignIn,isAdmin , deleteCategoryController)

export default router