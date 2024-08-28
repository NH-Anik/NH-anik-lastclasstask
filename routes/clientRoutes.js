import  express from "express";
import {createPostController,updateJobController,jobCountController,jobListController,getSingleJobController,deleteJobController,jobFiltersController,getAllPostController,jobPostPhotoController,getSinglePostController,realtedJobController,searchAllJobController,userPhotoController,searchJobCategoryController} from "../controllers/clientController.js";
import { requestSignIn,isAdmin } from "../middleware/authMidleware.js";
import formidable from "express-formidable";

const router = express.Router();

// routing
// create-products || method post com backend
router.post("/client-post", requestSignIn,isAdmin,formidable(),createPostController)
router.get("/client-alljobpost", getAllPostController)
router.get("/client-jobpostphoto/:pid", jobPostPhotoController)

router.get("/client-userPhotoController/:pid", userPhotoController)
//single post com backend
router.get("/client-singlejobpost/:slug", getSinglePostController);

//similar product
router.get("/related-job/:pid/:cid", realtedJobController);

// search product com backend work start
//search product
// router.get("/search/:categoryId", searchJobController);

router.get("/all-search/:keyword", searchAllJobController);
router.get("/search/:categoryId", searchJobCategoryController);


//filter product
router.post("/job-filters", jobFiltersController);

//delete product com backend
router.delete("/delete-product/:pid", deleteJobController);

//single product com backend
router.get("/get-product/:slug", getSingleJobController);

//pagination with per page com backend work start
//product count
router.get("/product-count", jobCountController);

//product per page
router.get("/product-list/:page", jobListController);

//routes products update com backend
router.put("/update-product/:pid",requestSignIn,formidable(),updateJobController);
export default router