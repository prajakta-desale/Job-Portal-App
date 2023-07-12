import userController from "../../Controllers/User.controller";
import path from "path";
import express from "express";
import { celebrate } from "celebrate";
import UserSchema from "../../Constants/Schema/User.schema";
import passport from "passport";

const router = express.Router();
router.post(
  "/sign-in",
  // celebrate(UserSchema.login),
  userController.login
);
router.post(
  "/register",
  // celebrate(UserSchema.register),
  userController.register
);

/*Google authentication routes*/
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/sign-in" }),
  userController.registerGoogleUser
);

// routes for testing purpose : -

router.get("/logout", (req, res) => {
  req.logout((err: any) => {
    if (err) {
      console.log(err);
    }
  });
  res.send("user logout");
});

router.get("/test-google-protected", (req, res) => {
  res.send({ valid: req.isAuthenticated() });
});

export default router;
