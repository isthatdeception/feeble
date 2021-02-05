import { Request, Response, Router } from "express";
import { isEmpty } from "class-validator"; // validating the data
import { getRepository } from "typeorm"; // query-builder

// relative import
import User from "../entities/User";
import Sub from "../entities/Sub";
import auth from "../middleware/auth";

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

const router = Router();
router.post("/", auth, createSub);

export default router;
