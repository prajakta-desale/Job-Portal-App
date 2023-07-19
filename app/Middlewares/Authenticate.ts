import express from "express";
import httpStatusCodes from "http-status-codes";
import apiResponse from "../utilities/ApiResponse";
import Encryption from "../utilities/Encryption";
import { extractCookieFromRequest } from "../utilities/ApiUtilities";
import application from "../Constants/application";
import { UserModel } from "../Models/User/User.model";
/**
 * Route authentication middleware to verify a token
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 *
 */

export default async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (application.authorizationIgnorePath.indexOf(`${req.path}`) === -1) {
    const authorizationHeader = extractCookieFromRequest(req, "x-fleet-token");
    console.log("authorizationHeader ->", authorizationHeader);
    if (authorizationHeader) {
      const decoded = await new Encryption().verifyJwtToken(
        authorizationHeader
      );
      // @ts-ignore
      if (decoded) {
        req.user = decoded.id;
        let user = await new UserModel().getUserById(req.user);
        if (!user) throw new Error("user not found");
        console.log("Token Verified Successfully");
      } else {
        apiResponse.error(res, httpStatusCodes.UNAUTHORIZED);
        return;
      }
    } else {
      apiResponse.error(res, httpStatusCodes.FORBIDDEN);
      return;
    }
  }

  next();
};
