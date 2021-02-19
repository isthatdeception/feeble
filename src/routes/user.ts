/**
 * user page
 *
 * here one can fetch all the posts related to the user
 * as well as his top submissions that are sorted by
 * [ created at ]
 *
 */

// package-imports
import { Request, Response, Router } from "express";

// relative import
import user from "../middleware/user";
import Post from "../entities/Post";
import User from "../entities/User";
import Comment from "../entities/Comment";

const getUserSubmissions = async (req: Request, res: Response) => {
  try {
    // finding user
    const user = await User.findOneOrFail({
      where: { username: req.params.username },
      select: ["username", "createdAt"],
    });

    // finding posts
    const posts = await Post.find({
      where: { user },
      relations: ["comments", "votes", "sub"],
    });

    const comments = await Comment.find({
      where: { user },
      relations: ["post"],
    });

    // populating it
    // by knowing votes on posts and comments
    if (res.locals.user) {
      posts.forEach((p) => p.setUserVote(res.locals.user));
      comments.forEach((c) => c.setUserVote(res.locals.user));
    }

    // now we need to concatenate it
    // with votes and posts
    // all the submissions
    let submissions: any[] = [];
    posts.forEach((p) => submissions.push({ type: "Post", ...p.toJSON() }));
    comments.forEach((c) =>
      submissions.push({ type: "Comment", ...c.toJSON() })
    );

    // now to sort the submissions after fetching them
    submissions.sort((a, b) => {
      if (b.createdAt > a.createdAt) return 1;
      if (b.createdAt < a.createdAt) return -1;
      return 0;
    });

    return res.json({ user, submissions });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "something went wrong!" });
  }
};

const router = Router();
router.get("/:username", user, getUserSubmissions); // this is for fetching the post

export default router;
