import { Request, Response, Router } from "express";

// relative import
import auth from "../middleware/auth";
import user from "../middleware/user";
import Post from "../entities/Post";
import Sub from "../entities/Sub";
import Comment from "../entities/Comment";

// creating post needs authenticated route
const createPost = async (req: Request, res: Response) => {
  const { title, body, sub } = req.body;

  const user = res.locals.user;

  if (title.trim === "") {
    return res.status(400).json({ title: "title must not be empty" });
  }

  try {
    // find the sub through the database
    const subRecord = await Sub.findOneOrFail({ name: sub });

    const post = new Post({ title, body, user, sub: subRecord });
    await post.save();

    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "something went worng" });
  }
};

/**
 * At homepage
 * one should be able to get all the recent posts
 */

const getPosts = async (req: Request, res: Response) => {
  /**
   * the problem with fetching all the posts is if we grew larger the amount of the
   * post keeps getting bigger because of that, one needs to margin the overall
   * recent posts a user can see
   *
   * to ensure this one can always go to the old school pagination but this is not 90's
   * thats why we will use infinite scrolling
   */

  /**
   * Infinite scroll is mostly used to increase user comfort when navigating a website.
   * This solution means that you don’t have to click the next page number
   * and wait for it to fully load to get the desired content.
   */

  const currentPage: number = (req.query.page || 0) as number;
  const postsPerPage: number = (req.query.count || 8) as number;

  try {
    const posts = await Post.find({
      order: { createdAt: "DESC" },
      relations: ["comments", "votes", "sub"],
      skip: currentPage * postsPerPage,
      take: postsPerPage,
    });

    // if logged in we need to show their vote on the post
    if (res.locals.user) {
      posts.forEach((p) => p.setUserVote(res.locals.user));
    }

    return res.json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

// when only one post is to fetch
const getPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;

  try {
    const post = await Post.findOneOrFail(
      { identifier, slug },
      { relations: ["sub", "votes", "comments"] }
    );

    // user votes
    if (res.locals.user) {
      post.setUserVote(res.locals.user);
    }

    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ error: "Post not found" });
  }
};

// comments on post
const commentOnPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  const body = req.body.body;

  try {
    const post = await Post.findOneOrFail({ identifier, slug });

    const comment = new Comment({ body, user: res.locals.user, post });

    await comment.save(); // saving the comment after checking the validation

    return res.json(comment);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ error: "Post not found!" });
  }
};

// getting comments on post
const getPostComments = async (req: Request, res: Response) => {
  // destructure
  const { identifier, slug } = req.params;

  try {
    const post = await Post.findOneOrFail({ identifier, slug });

    const comments = await Comment.find({
      where: { post },
      order: { createdAt: "DESC" },
      relations: ["votes"],
    });

    if (res.locals.user) {
      comments.forEach((c) => c.setUserVote(res.locals.user));
    }

    return res.json(comments);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "something went wrong!" });
  }
};

const router = Router();
router.post("/", user, auth, createPost); // need to be logged in
router.get("/", user, getPosts); // even not logged in is K
router.get("/:identifier/:slug", user, getPost);
router.post("/:identifier/:slug/comments", user, auth, commentOnPost);
router.get("/:identifier/:slug/comments", user, getPostComments);

export default router;
