import ApiResponse from "../utilities/ApiResponse";
import httpStatusCodes from "http-status-codes";
import IController from "../Types/IController";
import UserService from "../Services/User.service";
import constants from "../Constants";

const login: IController = async (req: any, res: any) => {
  try {
    console.log(" login data : ", req.body);
    let user: any = await UserService.userLogin(req.body);
    console.log("login data : ", user);
    if (user instanceof Error) {
      console.log("Controller Error : ", user.message);
      ApiResponse.error(res, httpStatusCodes.BAD_REQUEST, user.message);
    } else {
      ApiResponse.result(res, user, httpStatusCodes.CREATED);
    }
  } catch (error) {
    console.log("Controller Error : ", error);
    ApiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const register: IController = async (req: any, res: any) => {
  let user;
  try {
    user = await UserService.createUser(req.body);
  } catch (e: any) {
    console.log(e.message);
    // @ts-ignore
    if (e.code === constants.ErrorCodes.DUPLICATE_ENTRY) {
      ApiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        "MOBILE_AND_EMAIL_ALREADY_EXISTS"
      );
    } else {
      ApiResponse.error(res, httpStatusCodes.BAD_REQUEST, e.message);
    }
    return;
  }
  if (user) {
    ApiResponse.result(res, user, httpStatusCodes.CREATED);
  } else {
    ApiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const registerGoogleUser: IController = async (req: any, res: any) => {
  const { user } = req;
  try {
    const userData = {
      first_name: user.name.givenName,
      last_name: user.name.familyName,
      email: user.emails[0].value,
      role_id: 0,
      googleId: user.id,
      login_method: "google",
      password: "google_user",
    };
    const googleUSer = await UserService.UserAccessManager(userData);
    if (googleUSer) {
      ApiResponse.result(res, googleUSer, httpStatusCodes.ACCEPTED);
    } else {
      ApiResponse.error(res, httpStatusCodes.BAD_REQUEST);
    }
  } catch (e: any) {
    console.log(e.message);
    ApiResponse.error(res, httpStatusCodes.BAD_REQUEST, e.message);
  }
};

export default {
  login,
  register,
  registerGoogleUser,
};
