// userModel schema import
import userModel from "../model/userModel.js";
// import orderModel from "../model/orderModel.js";  
import { hashPassword,comparePassword } from '../helper/authHelper.js';
import Jwt  from "jsonwebtoken";
import dotenv from 'dotenv'
import cloudinary from  '../helper/cloudinary.js';

// config dotenv 
dotenv.config()
import nodemailer from 'nodemailer'

// check username
export const checkUsername = async (req,res) => {
  try {
    const {username} = req.body;
    const user = await userModel.findOne({username});
    if(user){
      return res.status(200).send({
        success: false,
        message: "Username Already Exisiting",
      });
    }
    
    res.status(200).send({
      success: true,
      message: "Username Available",
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
}
    
// register post request controller
export const registerController = async (req,res) => {
  try {
    const {firstname,lastname,username,email,password}=req.body;
    // validation
    if(!firstname){
      return res.send({message:"firstname is Required"})
    }
    if(!lastname){
      return res.send({message:"lastname is Required"})
    }
    if(!username){
      return res.send({message:"username is Required"})
    }
    if(!email){
      return res.send({message:"Email is Required"})
    }
    if(!password){
      return res.send({message:"Password is Required"})
    }

    // check user
    const exisitingEmail=await userModel.findOne({email});
    // exisitingUser user
    if(exisitingEmail){
      return res.status(200).send({
        success: false,
        message: "Already Register please login",
      });
    }

    // check user
    const exisitingUser=await userModel.findOne({username});
    // exisitingUser user
    if(exisitingUser){
      return res.status(200).send({
        success: false,
        message: "Already Register please login",
      });
    }
    // hash password
    const hashedPassword = await hashPassword(password);
    // Create new user with verification token
    const verificationToken=Jwt.sign({username,email},process.env.JWT_SECRET,{expiresIn:"30m"})
    // save
    const user=await new userModel({firstname,lastname,username,email,password:hashedPassword,verificationToken })
    .save()
    sendVerificationEmail(email, verificationToken);
    res.status(201).send({
      success: true,
      message: "Check your email and verify your account",
      user,
    })
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Registration",
      error: error.message,
    });
  }
};

// Route to handle email verification
export const verifyEmailController= async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).send({
        success: false,
        error: 'Verification token is required'
      })
    }
    const decoded = Jwt.verify(token, process.env.JWT_SECRET);
    // Find user by verification token
    const user = await userModel.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).send({
        success: false, 
        error: 'Invalid verification token' 
      });
    }
    // Update user to mark as verified
    user.isVerified = true;
    user.verificationToken = null; // Clear verification token
    await user.save();
    res.status(200).send({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).send({ error: 'Server error' });
  }
}

function sendVerificationEmail(email, token) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
    port: 587,
    secure: false, 
    auth: {
        user: process.env.AUTH_EMAIL, 
        pass: process.env.AUTH_PASS
    }
  });
  const verificationLink = `${process.env.BASE_URL}/verify-email?token=${token}`;
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: 'Email Verification',
    text: `Please click on the following link to verify your email: ${verificationLink}`,
    html:`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <title>Email Confirmation</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style type="text/css">
        @media screen {
          @font-face {
            font-family: 'Source Sans Pro';
            font-style: normal;
            font-weight: 400;
            src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
          }
          @font-face {
            font-family: 'Source Sans Pro';
            font-style: normal;
            font-weight: 700;
            src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
          }
        }
        body,
        table,
        td,
        a {
          -ms-text-size-adjust: 100%;
          -webkit-text-size-adjust: 100%;
        }
        table,
        td {
          mso-table-rspace: 0pt;
          mso-table-lspace: 0pt;
        }
        img {
          -ms-interpolation-mode: bicubic;
        }
        a[x-apple-data-detectors] {
          font-family: inherit !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
          color: inherit !important;
          text-decoration: none !important;
        }
        div[style*="margin: 16px 0;"] {
          margin: 0 !important;
        }
    
        body {
          width: 100% !important;
          height: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        table {
          border-collapse: collapse !important;
        }
        a {
          color: #1a82e2;
        }
        img {
          height: auto;
          line-height: 100%;
          text-decoration: none;
          border: 0;
          outline: none;
        }
      </style>
    </head>
    <body style="background-color: #e9ecef;">
      <div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
        A preheader is the short summary text that follows the subject line when an email is viewed in the inbox.
      </div>
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" bgcolor="#e9ecef">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
              <tr>
                <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
                  <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Blog - $5</h1>
                  <h2 style="margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -1px; line-height: 48px;">Confirm Your Email Address</h2>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" bgcolor="#e9ecef">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
              <tr>
                <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                  <p style="margin: 0;">Tap the button below to confirm your email address. If you didn't create an account with you can safely delete this email.</p>
                </td>
              </tr>
              <tr>
                <td align="left" bgcolor="#ffffff">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center" bgcolor="#ffffff" style="padding: 12px;">
                        <table border="0" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" bgcolor="#1a82e2" style="border-radius: 6px;">
                              <a href="${verificationLink}" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">Confirm Email</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
                  <p style="margin: 0;">Author :,<br>Blog - $5</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(500).send({ error: 'Failed to send email' });
    } else {
      res.status(200).send({ message: 'Email sent successfully' });
    }
  });
}

// login post request controller

export const loginController = async (req, res) => {
  try {
    const { login, password } = req.body;

    // Find user by either username or email
    const user = await userModel.findOne({
      $or: [{ username: login }, { email: login }],
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // check if user is verified
    if (!user.isVerified) {
      return res.json({
        success: false,
        message: "Please verify your email first",
      });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid password",
      });
    }

    // token generation
    const token = Jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).send({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        firstname:user.firstname,
        lastname:user.lastname,
        username: user.username,
        email: user.email,
        image: user.image,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in login",
      error: error.message,
    });
  }
};

// update username

export const updateUsername = async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    await userModel.findByIdAndUpdate(id, { username });
    res.status(200).send({
      success: true,
      message: "Username updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while updating username",
      error,
    });
  }
};

// update email

export const updateEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    await userModel.findByIdAndUpdate(id, { email });
    res.status(200).send({
      success: true,
      message: "Email updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while updating email",
      error,
    });
  }
};

// Forgot- controller

// Function to generate a random 4-digit OTP
export const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

export const forgotPasswordController = async (req,res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }
    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email not found",
      });
    }
    const otp = generateOTP(); // Generate OTP
    // Save the OTP to the database
    user.otp = otp;
    await user.save();

    sendVerificationOTP(email, otp);
    res.status(200).send({
      success: true,
      message: "Check your email",
      data: { email, otp }
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error
    });
  }
}

function sendVerificationOTP(email, otp) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
    port: 587,
    secure: false, 
    auth: {
        user: process.env.AUTH_EMAIL, 
        pass: process.env.AUTH_PASS
    }
  });
  const verificationLink = otp;
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: 'Email Verification',
    text: `Please click on the following link to verify your email: ${verificationLink}`,
    html:`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <title>Email Confirmation</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style type="text/css">
        @media screen {
          @font-face {
            font-family: 'Source Sans Pro';
            font-style: normal;
            font-weight: 400;
            src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
          }
    
          @font-face {
            font-family: 'Source Sans Pro';
            font-style: normal;
            font-weight: 700;
            src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
          }
        }
        body,
        table,
        td,
        a {
          -ms-text-size-adjust: 100%;
          -webkit-text-size-adjust: 100%;
        }
        table,
        td {
          mso-table-rspace: 0pt;
          mso-table-lspace: 0pt;
        }
        img {
          -ms-interpolation-mode: bicubic;
        }
        a[x-apple-data-detectors] {
          font-family: inherit !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
          color: inherit !important;
          text-decoration: none !important;
        }
        div[style*="margin: 16px 0;"] {
          margin: 0 !important;
        }
    
        body {
          width: 100% !important;
          height: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        table {
          border-collapse: collapse !important;
        }
        a {
          color: #1a82e2;
        }
    
        img {
          height: auto;
          line-height: 100%;
          text-decoration: none;
          border: 0;
          outline: none;
        }
      </style>
    </head>
    <body style="background-color: #e9ecef;">
      <div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
        A preheader is the short summary text that follows the subject line when an email is viewed in the inbox.
      </div>
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" bgcolor="#e9ecef">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
              <tr>
                <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
                  <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Blog - $5</h1>
                  <h2 style="margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -1px; line-height: 48px;">Confirm Your OTP</h2>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" bgcolor="#e9ecef">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
              <tr>
                <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                  <p style="margin: 0;">Tap the button below to confirm your email address. If you didn't create an account with you can safely delete this email.</p>
                </td>
              </tr>
              <tr>
                <td align="left" bgcolor="#ffffff">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center" bgcolor="#ffffff" style="padding: 12px;">
                        <table border="0" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" bgcolor="#1a82e2" style="border-radius: 6px;">
                              <h1  style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">${verificationLink}</h1>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
                  <p style="margin: 0;">Author :,<br>Blog - $5</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    
    </html>`
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(500).send({ error: 'Failed to send email' });
    } else {
      res.status(200).send({ message: 'OTP sent successfully' });
    }
  });
}

// // Forgot- controller-otp match
export const forgotOtpPasswordController = async (req,res) => {
  try {
    const {email, otp, newPassword}=req.body;
    if(!email){
      return res.status(400).send({message: "Email is required"})
    }
    if(!otp){
      return res.status(400).send({message: "otp is required"})
    }
    if(!newPassword){
      return res.status(400).send({message: "New password is required"})
    }
    // check
    const user=await userModel.findOne({email, otp});
    // validation
    if(!user){
      return res.status(404).send({
        success: false,
        message: "Wrong Email or otp",
      })
    }
    // password hashing
    const hashed=await hashPassword(newPassword);
    const otpa ="";
    // update password
    await userModel.findByIdAndUpdate(user._id, {password: hashed,otp:otpa});
    res.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    })
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error
    })
    
  }
}

// test controller
export const testController = (req,res) => {
  try {
    res.send("Protected Routes");
  } catch (error) {
    res.send({error})
  }
}

//update profile
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password,address,country,phone} = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({ error: "Passsword is required and 6 character long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        address,
        country,
        phone
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error WHile Update profile",
      error,
    });
  }
};

// profile pic update update Profile Pic Controller
export const updateProfilePicController =  async (req, res) => {
  try {
    const { id } = req.params;
    const result = await cloudinary.uploader.upload(req.file.path);
    const user = await userModel.findByIdAndUpdate(id,
      {
        image: result.secure_url,
        cloudinary_id: result.public_id
      },
      {new: true}
      );
    res.status(200).send({
      success: true,
      message: "Profile Updated SUccessfully",
      user
    })
  }
  catch (error) {
    res.status(400).send({
      success: false,
      message: "Error WHile Update profile",
    })
  }
}

//orders user profile show
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};

//orders admin profile show
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};

// only last order show
export const getLastOrderShow = async (req, res) => {
  try {
    const lastOrder = await orderModel
      .findOne({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: -1 });
    if (!lastOrder) {
      return res.status(404).json({ success: false, message: "No orders found." });
    }
    res.json(lastOrder);
  } catch (error) {
    console.error("Error while getting last order:", error);
    res.status(500).json({ success: false, message: "Error while getting last order.", error });
  }
}

//order status
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error While Updating Order",
      error,
    });
  }
};

// all order delete
export const deleteOrderController = async (req, res) => {
  try {
    const { id } = req.params;
    const orders = await orderModel.findByIdAndDelete(id);
    res.json(orders);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error While Deleting Order",
      error,
    });
  }
}

// total order collection delete
export const totalDeleteOrderController = async (req, res) => {
  try {
    const orders = await orderModel.deleteMany();
    res.json(orders);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error While Deleting Order",
      error,
    });
  }
}


// all user show
export const getAllUser = async (req, res) => {
  try {
    const users = await userModel.find({});
    res.json(users);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error WHile Getting All Users",
      error,
    });
  }
}
// online user show
export const liveConsol = async (req, res) => {
  try {
    const users = await userModel.find({"role": 0});
    res.json(users);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error WHile Getting All Users",
      error,
    });
  }
}


// user delete
export const deleteUser = async (req, res) => {
  try {
    const {id} = req.params;
    const user = await userModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "User deleted successfully",
    })
  }
  catch(error){
    res.status(500).send({
      success: false,
      message: "Error While Deleting User",
      error,
    })
  }
}

// user update
export const updateUser = async (req, res) => {
  try {
    const {role} = req.body;
    const {id} = req.params;
    const user = await userModel.findByIdAndUpdate(id,
      {
        role: role
      },
      {new: true});
    res.status(200).send({
      success: true,
      message: "User updated successfully",
      user
    })
  }
  catch(error){
    res.status(500).send({
      success: false,
      message: "Error While Updating User",
      error,
    })
  }
}
