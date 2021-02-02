import { NextFunction, Request, Response } from "express";

export default (req: Request, res: Response, next: NextFunction) => {
  /**
   * here password can be used as space so one must check for the password too
   * for the occurence of the space and not trim it together with all the body elements
   * of the app
   *
   * we will use exceptions for solving the problem
   * const exceptions
   */

  const exceptions = ["password"];

  Object.keys(req.body).forEach((key) => {
    if (!exceptions.includes(key) && typeof req.body[key] === "string") {
      req.body[key] = req.body[key].trim();
    }
  });
  next();
};
