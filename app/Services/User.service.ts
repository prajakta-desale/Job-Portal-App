import { UserModel } from "../Models/User/User.model";
import Encryption from "../utilities/Encryption";
import formidable from "formidable";
import fs from "fs";
import path from "path";

const userLogin = async (data: any) => {
  try {
    let result = await new UserModel().getUser(data);
    // console.log("user login service---------->", result);
    if (result.length === 0) throw new Error("Invalid email or password");
    const match = await new Encryption().verifypassword(
      data.password,
      result[0].password
    );
    if (!match) throw new Error("Invalid password");
    delete result[0].password;
    if (result[0].status !== 1) throw new Error("Your account is not active");
    let role;
    switch (result[0].role_id) {
      case 1:
        result[0].role = "admin";
        break;
      case 2:
        result[0].role = "JobProvider";
        break;
      case 3:
        result[0].role = "JobSeeker";
        break;
    }
    delete result[0].role_id;
    return {
      token: await Encryption.generateJwtToken({
        id: result[0].id,
        role: result[0].role,
      }),
      user: result,
    };
  } catch (error: any) {
    console.log("error:", error.message);
    return error;
  }
};
const createUser = async (data: any) => {
  try {
    let role_id = await new UserModel().getUserRole(data.role);
    // console.log("in service-------------->", role_id);
    if (role_id.length === 0) throw new Error("invalid role");
    // if (data.password !== data.confirm_password)
    //   throw new Error("password did not match");
    let hash = await new Encryption().generateHash(data.password, 10);
    data.password = hash;
    // delete data.confirm_password;
    delete data.role;
    data.role_id = role_id[0].id;
    let user = await new UserModel().createUser(data);
    return user;
  } catch (error: any) {
    throw error;
  }
};
const UserAccessManager = async (data: any) => {
  try {
    const existingUser = await new UserModel().getUserByGoogleId(data.googleId);
    if (existingUser.length !== 0) {
      console.log("Existing Google User", existingUser[0]);
      delete existingUser[0].password;
      delete existingUser[0].googleId;
      return {
        token: await Encryption.generateJwtToken({ id: existingUser[0].id }),
        user: existingUser[0],
      };
    }
    const newUser = await new UserModel().createUserByGoogleAuth(data);
    const user = await new UserModel().getUserById(newUser.insertId);
    console.log("New Google User", user[0]);
    if (user.length !== 0) {
      delete user[0].password;
      delete user[0].googleId;
      return {
        token: await Encryption.generateJwtToken({ id: user[0].id }),
        user: user[0],
      };
    }
    return { message: "Something Went Wrong", suc: false };
  } catch (error: any) {
    console.log("Error google auth:", error.message);
    return error;
  }
};

const userProfile = async (req: any) => {
  let fields,
    files,
    data: any = {};
  try {
    // @ts-ignore
    ({ fields, files } = await new Promise((resolve) => {
      new formidable.IncomingForm().parse(
        req,
        async (err: any, fields: any, files: any) => {
          resolve({ fields: fields, files: files });
        }
      );
    }));
    console.log("files in service--------->", files.profile_image);
    if (!files?.profile_image) throw new Error("image is required");
    else {
      if (fileNotValid(files.profile_image.mimetype))
        throw new Error(
          "Only .png, .jpg , .jpeg and .pdf format allowed! for image"
        );
      var file = files.profile_image;
    }
    const oldPath = file.filepath;
    const uniqueFileName = `public/${file.originalFilename}-${Date.now()}`;
    const newPath = path.join(uniqueFileName);
    data.profile_image = newPath;
    //@ts-ignore
    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        // Handle the error
        console.log("error while uploading file");
        return;
      }
      console.log("file uploaded successfully");
    });
    if (!fields.first_name) throw new Error(" first name is required");
    data.first_name = fields.first_name;
    if (!fields.last_name) throw new Error("last name is required");
    data.last_name = fields.last_name;
    if (!fields.mobile) throw new Error(" mobile no  is required");
    data.mobile = fields.mobile;
    if (!fields.email) throw new Error("email  is required");
    data.email = fields.email;
    if (!fields.birth_date) throw new Error("birth_date is required");
    data.DOB = fields.birth_date;
    if (!fields.gender) throw new Error("gender is required");
    data.Gender = fields.gender;
    if (!fields.age) throw new Error(" age is required");
    data.age = fields.age;
    if (!fields.area) throw new Error("area is required");
    data.area = fields.area;
    if (!fields.city) throw new Error("city is required");
    data.city = fields.city;
    if (!fields.state) throw new Error("state is required");
    data.state = fields.state;
    if (!fields.country) throw new Error(" country  is required");
    data.country = fields.country;
    let user = await new UserModel().getUserId();
    data.user_id = user[0].id;
    console.log("user profile service------------->", data);
    let result = await new UserModel().createUserProfile(data);
    return result;
  } catch (error: any) {
    throw error;
  }
};

const fileNotValid = (type: any) => {
  if (
    type == "image/jpeg" ||
    type == "image/jpg" ||
    type == "image/png" ||
    type == "image/pdf"
  ) {
    return false;
  }
  return true;
};
export default {
  userLogin,
  createUser,
  UserAccessManager,
  userProfile,
};
