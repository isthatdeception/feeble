import { Request, Response, Router } from "express";
import { getConnection } from "typeorm";

// relative import
import Post from "../entities/Post";
import User from "../entities/User";
import Vote from "../entities/Vote";
import Comment from "../entities/Comment";
import Sub from "../entities/Sub";

// middleware auth
import auth from "../middleware/auth";
import user from "../middleware/user";

// misc routes that can be dynamic
const vote = async (req: Request, res: Response) => {
  // destructable object
  const { identifier, slug, commentIdentifier, value } = req.body;

  // validate vote value
  if (![-1, 0, 1].includes(value)) {
    return res.status(400).json({ value: "Value must be -1, 0 or 1" });
  }

  // try-catch block if one had some error
  try {
    const user: User = res.locals.user;
    let post = await Post.findOneOrFail({ identifier, slug });
    let vote: Vote | undefined;
    let comment: Comment | undefined;

    // checking if there is a comment or vote present
    if (commentIdentifier) {
      // if there is a comment identifier find vote by comment
      comment = await Comment.findOneOrFail({ identifier: commentIdentifier });
      vote = await Vote.findOne({ user, comment });
    } else {
      // else find vote by post
      vote = await Vote.findOne({ user, post });
    }

    if (!vote && value === 0) {
      // if no vote and value = 0 and return error
      return res.status(404).json({ error: "Vote not found" });
    } else if (!vote) {
      // if we didn't found the existing vote we make a new vote
      vote = new Vote({ user, value });

      /**
       * here we still don't know that the vote is related
       * to post or the comment
       */

      if (comment) vote.comment = comment;
      else vote.post = post;
      await vote.save(); // we save the new vote
    } else if (value === 0) {
      // if vote exists and value = 0 then remove vote from DB
      await vote.remove();
    } else if (vote.value !== value) {
      // if vote and value has changed, we just update vote
      vote.value = value;
      await vote.save(); // updating the vote
    }

    post = await Post.findOneOrFail(
      { identifier, slug },
      { relations: ["comments", "comments.votes", "sub", "votes"] }
    );

    // before refecthing the post
    post.setUserVote(user);
    post.comments.forEach((c) => c.setUserVote(user));

    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

// route for top Subs / side-bar
const topSubs = async (_: Request, res: Response) => {
  /**
   * SELECT s.title, s.name,
   * COALESCE('http://localhost:5000/images/' || s."imageUrn" , 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y') as imageUrl,
   * count(p.id) as "postCount"
   * FROM subs s
   * LEFT JOIN posts p ON s.name = p."subName"
   * GROUP BY s.title, s.name, imageUrl
   * ORDER BY "postCount" DESC
   * LIMIT 5;
   */

  try {
    /**
     * top bar
     *
     * we will select the top 5 ranked sub topics and show it to the bar
     *
     * ordering them by their post count
     */

    const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/' || s."imageUrn" , 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y')`;

    // select query builder // ***
    // https://typeorm.io/#/select-query-builder/what-is-querybuilderhttps://typeorm.io/#/select-query-builder/what-is-querybuilder

    const subs = await getConnection()
      .createQueryBuilder()
      .select(
        `s.title, s.name, ${imageUrlExp} as "imageUrl", count(p.id) as "postCount"`
      )
      .from(Sub, "s")
      .leftJoin(Post, "p", `s.name = p."subName"`)
      .groupBy('s.title, s.name, "imageUrl"')
      .orderBy(`"postCount"`, "DESC")
      .limit(5)
      .execute();

    return res.json(subs);
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong!" });
  }
};

const router = Router();
router.post("/vote", user, auth, vote);
router.get("/top-subs", topSubs);

export default router;
