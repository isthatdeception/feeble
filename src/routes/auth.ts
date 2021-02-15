import { Request, Response, Router } from "express";
import { isEmpty, validate } from "class-validator";

import User from "../entities/User";

// for extra security
import bcrypt from "bcrypt";

// for secure access to the app
import jwt from "jsonwebtoken";
import cookie from "cookie";

// custom middleware
import auth from "../middleware/auth";
import user from "../middleware/user";

// mapping errors
const mapErrors = (errors: Object[]) => {
  // to make an alternate object so we will fectch the first constraint
  // out of all the validations

  // reduce take an initial value

  return errors.reduce((prev: any, err: any) => {
    prev[err.property] = Object.entries(err.constraints)[0][1];
    return prev;
  }, {});
};

// regsiter route
const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  try {
    // VALIDATE DATA
    let errors: any = {};
    const emailUser = await User.findOne({ email });
    const usernameUser = await User.findOne({ username });

    if (emailUser) errors.email = "Email is already taken";
    if (usernameUser) errors.username = "Username is already taken";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    // CREATE THE USER
    const user = new User({ email, username, password });

    errors = await validate(user);
    if (errors.length > 0) {
      return res.status(400).json(mapErrors(errors));
    }
    await user.save();

    // RETURN THE USER
    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

// login route
const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    let errors: any = {};

    // checking that if one put username or password is empty while loging in
    if (isEmpty(username)) errors.username = "Username should not be empty";
    if (isEmpty(password)) errors.password = "Password should not be empty";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    // now we check for the input if we can match a username in our DB
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ username: "user not found!" });

    /**
     * if user got found in db
     * we will match the typed password to the hashed password
     * that is saved in the database
     */

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ password: "password is incorrect" });
    }

    /**
     * tokenizing the login process that is secure and give user
     * more advantages then the traditional login
     */

    const token = jwt.sign({ username }, process.env.JWT_SECRET_KEY!);

    /**
     * Here we are storing token in the form of cookies
     *
     * when we set our cookie by serializing, it checks the options
     * by checking the token like
     *
     *
     * httponly : make it more secure
     * secure: means it can only be opened if our site is open and using
     * https connection, but it will not work in the current development stage
     *
     * by same site 'strict' it means the token is only valid if it came by the
     * same domain
     *
     * max age is the age of our token or the expiration of our cookie
     * which is in seconds when the token dies the user have to automatically
     * login again for using the app
     *
     * path means where the token is valid
     * if '/' means it is valid accross our applicaiton
     *
     */

    res.set(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600,
        path: "/",
      })
    );

    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.json({ error: "Something went wrong" });
  }
};

// route to the user data for himself
const me = async (_: Request, res: Response) => {
  return res.json(res.locals.user);
};

// logout route
const logout = (_: Request, res: Response) => {
  res.set(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    })
  );

  return res.status(200).json({ success: true });
};

/**
 * route to the user routes
 */
const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", user, auth, me);
router.get("/logout", user, auth, logout);

export default router;
