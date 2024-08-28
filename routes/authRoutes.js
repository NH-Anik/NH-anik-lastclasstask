import  express from "express";
import {checkUsername,updateUsername,updateEmail,registerController, loginController, forgotPasswordController, testController,updateProfileController,
    getAllUser,deleteUser,updateUser,verifyEmailController,updateProfilePicController,forgotOtpPasswordController,} from "../controllers/authController.js";
import { requestSignIn,isAdmin } from "../middleware/authMidleware.js";
import update   from "../middleware/multer.js";

const router = express.Router();

// routing
// register || method post
router.post("/checkusername",checkUsername)

router.put("/updateusername/:id",requestSignIn,updateUsername)
router.put("/updateemail/:id",requestSignIn,updateEmail)

router.post("/register",registerController)

// login || method post
router.post("/login", loginController)

// forgot || method post
router.post("/forgot-password", forgotPasswordController)
router.post("/forgot-passwordOtp", forgotOtpPasswordController)

// test middleware || method post
router.get("/test",requestSignIn,isAdmin , testController)

// protected user route auth
router.get("/user-auth",requestSignIn,(req,res)=>{
    res.send({ok:true})
})
// protected admin route auth
router.get("/admin-auth",requestSignIn,isAdmin,(req,res)=>{
    res.send({ok:true})
})
//update profile
router.put("/profile", requestSignIn, updateProfileController);


// all user show
router.get("/all-user",requestSignIn,isAdmin, getAllUser);

// live consol all user
router.get("/live-consol",getAllUser);

// user delete 
router.delete("/delete-user/:id",requestSignIn,isAdmin, deleteUser);

//create  user update
router.put("/update-user/:id",requestSignIn,isAdmin, updateUser);

// verify email
router.post("/verify-email", verifyEmailController);

// update profile pic
router.put("/profile-pic/:id", requestSignIn, update.single("image"),updateProfilePicController)


export default router