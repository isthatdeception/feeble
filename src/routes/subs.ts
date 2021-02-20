import { NextFunction, Request, Response, Router } from "express";
import { isEmpty } from "class-validator"; // validating the data
import { getRepository } from "typeorm"; // query-builder

// for files or pics
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";

// relative import
import Sub from "../entities/Sub";
import auth from "../middleware/auth";
import user from "../middleware/user";
import Post from "../entities/Post";
import User from "../entities/User";
import { makeId } from "../utils/helper";

const createSub = async (req: Request, res: Response) => {
  const { name, title, description } = req.body;
  const user = res.locals.user;

  try {
    let errors: any = {};

    // checking or validationg the data
    if (isEmpty(name)) errors.name = "Name must not be empty";
    if (isEmpty(title)) errors.title = "Title must not be empty";

    /**
     * using query builder so that we can find if there is an existing post by the same name
     * exa- if one have the same name in lowercase and one have the same name in upper case
     *
     * query builder is an advanced tool for it
     *
     *  */

    const sub = await getRepository(Sub)
      .createQueryBuilder("sub")
      .where("lower(sub.name) = :name", { name: name.toLowerCase() })
      .getOne();

    if (sub) errors.name = "Sub already exist";
    if (Object.keys(errors).length > 0) {
      throw errors;
    }
  } catch (err) {
    return res.status(400).json(err);
  }

  try {
    const sub = new Sub({ name, description, title, user });
    await sub.save();

    return res.json(sub);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "something went wrong" });
  }
};

// for one single post
const getSub = async (req: Request, res: Response) => {
  const name = req.params.name;

  try {
    const sub = await Sub.findOneOrFail({ name });
    const posts = await Post.find({
      where: { sub },
      order: { createdAt: "DESC" },
      relations: ["comments", "votes"],
    });

    sub.posts = posts;

    if (res.locals.user) {
      sub.posts.forEach((p) => p.setUserVote(res.locals.user));
    }

    return res.json(sub);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ sub: "sub not found!" });
  }
};

// another middle ware to test that it is of their own
const ownSub = async (req: Request, res: Response, next: NextFunction) => {
  const user: User = res.locals.user;

  try {
    const sub = await Sub.findOneOrFail({ where: { name: req.params.name } });

    if (sub.username !== user.username) {
      return res.status(403).json({ error: "You don't own this sub!" });
    }

    res.locals.sub = sub;
    return next();
  } catch (err) {
    return res.status(500).json({ error: "something went wrong!" });
  }
};

// middle ware for upload
const upload = multer({
  storage: multer.diskStorage({
    destination: "test/images",
    filename: (_, file, callback) => {
      const name = makeId(15);
      callback(null, name + path.extname(file.originalname)); // eg: jshj47736 + .png
    },
  }),
  fileFilter: (_, file: any, callback: FileFilterCallback) => {
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
      callback(null, true); // if it is above something, we will accept it
    } else {
      callback(new Error("not an image")); // otherwise reject the image
    }
  },
});

// uploading image to the sub
const uploadSubImage = async (req: Request, res: Response) => {
  const sub: Sub = res.locals.sub;
  try {
    const type = req.body.type;
    console.log(req.file);

    if (type !== "image" && type !== "banner") {
      // if the file is invalid we will delete it from our database
      fs.unlinkSync(req.file.path); // this will delete it
      return res.status(400).json({ error: "Invalid type" });
    }

    /**
     * now we need to see if one have a imageurn or bannerurn from the get go
     * if so, we need to update the new photo to our database and delete the old
     * one ,,, this helps to improve the overall effectiveness of space
     */

    let oldImageUrn: string = "";

    if (type === "image") {
      oldImageUrn = sub.imageUrn ?? "";
      sub.imageUrn = req.file.filename;
    } else if (type === "banner") {
      oldImageUrn = sub.bannerUrn ?? "";
      sub.bannerUrn = req.file.filename;
    }

    await sub.save(); // save the sub

    if (oldImageUrn !== "") {
      fs.unlinkSync(`test\\images\\${oldImageUrn}`);
    }

    // if this is successful we will proceed to upload the image
    return res.json(sub);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong!" });
  }
};

// searching for subs
const searchSubs = async (req: Request, res: Response) => {
  try {
    const name = req.params.name;

    if (isEmpty(name)) {
      return res.status(400).json({ error: "name must not be empty!" });
    }

    /**
     * writing the subs can be different
     * like reactjs and reacrJS can be two different subs
     * as it is case sensitive
     *
     * but our search bar should be able to get that other reactjs as a search result
     *
     * for it, using querybuilder
     */

    const subs = await getRepository(Sub)
      .createQueryBuilder()
      /**
       *
       * ea => react if we use %% sign on both side of the string
       * if we use it like that it gives the sql to know that we are searching for some marginal
       *
       * if one use % on the end point it means one have to put right characters
       * of the starting of the subname so that it will feel like an auto complete
       * and a good prediction
       *
       */
      .where("LOWER(name) LIKE :name", {
        name: `${name.toLowerCase().trim()}%`,
      })
      .getMany();

    // returning the result
    return res.json(subs);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "something went wrong!" });
  }
};

const router = Router();
router.post("/", user, auth, createSub);
router.get("/:name", user, getSub);
router.get("/search/:name", searchSubs);
router.post(
  "/:name/image",
  user,
  auth,
  ownSub,
  upload.single("file"),
  uploadSubImage
);

export default router;
