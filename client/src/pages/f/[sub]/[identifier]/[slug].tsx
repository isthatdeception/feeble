// dynamic single post page

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";
import Axios from "axios";
import classNames from "classnames";
import { FormEvent, useEffect, useState } from "react";

// extra time plugin
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// relative import
import { Post, Comment } from "../../../../types";
import Sidebar from "../../../../components/Sidebar";
import { useAuthState } from "../../../../context/auth";
import ActionButton from "../../../../components/ActionButton";

dayjs.extend(relativeTime);

// code
export default function PostPage() {
  /// local state
  const [newComment, setNewComment] = useState("");
  const [description, setDescription] = useState("");

  ///global state
  const { authenticated, user } = useAuthState();

  /// utils
  const router = useRouter();
  const { identifier, sub, slug } = router.query;

  const { data: post, error } = useSWR<Post>(
    identifier && slug ? `/posts/${identifier}/${slug}` : null
  );

  const { data: comments, revalidate } = useSWR<Comment[]>(
    identifier && slug ? `/posts/${identifier}/${slug}/comments` : null
  );

  if (error) router.push("/");

  useEffect(() => {
    if (!post) return;
    let desc = post.body || post.title;
    desc.substring(0, 159).concat(".."); // like hello world..
    setDescription(desc);
  }, [post]);

  // for vote action
  const vote = async (value: number, comment?: Comment) => {
    // checking if the user is logged in or not
    // if not we will redirect him to login page as he click
    // to vote

    if (!authenticated) router.push("/login");

    // if vote is the same reset vote
    if (
      (!comment && value === post.userVote) ||
      (comment && comment.userVote === value)
    )
      value = 0;

    try {
      await Axios.post("/misc/vote", {
        identifier,
        slug,
        commentIdentifier: comment?.identifier,
        value,
      });

      // refetch the component for frequent updation
      revalidate();
    } catch (err) {
      console.log(err);
    }
  };

  const submitComment = async (event: FormEvent) => {
    // form event to prevent the default loading of page
    event.preventDefault();

    // if comment is empty do not submit
    if (newComment.trim() === "") return;

    try {
      await Axios.post(`/posts/${post.identifier}/${post.slug}/comments`, {
        body: newComment,
      });

      // setting up of the new comment
      setNewComment("");

      // refetch the component for frequent updation
      revalidate();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Head>
        <title>{post?.title}</title>
        {/** meta tags for slugs */}
        <meta name="description" content={description}></meta>
        <meta property="og:description" content={description} />
        <meta property="og:title" content={post?.title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:title" content={post?.title} />
      </Head>
      <Link href={`/f/${sub}`}>
        <a>
          <div className="flex items-center w-full h-20 p-8 bg-blue-500">
            <div className="container flex">
              {post && (
                <div className="mr-2 overflow-hidden rounded-full w-7 h-7">
                  <Image
                    src={post.sub.imageUrl}
                    height={(8 * 16) / 4}
                    width={(8 * 16) / 4}
                  />
                </div>
              )}
              <div className="text-xl font-semibold text-white p">/f/{sub}</div>
            </div>
          </div>
        </a>
      </Link>
      <div className="container flex pt-5">
        {/** post bar */}
        <div className="w-160">
          <div className="bg-white rounded">
            {post && (
              <>
                <div className="flex">
                  {/**vote section */}
                  <div className="flex-shrink-0 w-10 py-2 text-center rounded-l">
                    {/** upVote  */}
                    <div
                      className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
                      onClick={() => vote(1)}
                    >
                      <i
                        className={classNames("icon-arrow-up", {
                          "text-red-500": post.userVote === 1,
                        })}
                      ></i>
                    </div>
                    <p className="font-bold font-xs">{post.voteScore}</p>
                    {/** downVote */}
                    <div
                      className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-600"
                      onClick={() => vote(-1)}
                    >
                      <i
                        className={classNames("icon-arrow-down", {
                          "text-blue-600": post.userVote === -1,
                        })}
                      ></i>
                    </div>
                  </div>
                  <div className="py-2 pr-2">
                    {/** post section */}
                    <div className="flex item-center">
                      <p className="text-xs text-gray-400 p">
                        posted by
                        <Link href={`/u/${post.username}`}>
                          <a className="mx-1 hover:underline">
                            /u/${post.username}
                          </a>
                        </Link>
                        <Link href={post.url}>
                          <a className="mx-1 hover:underline">
                            {dayjs(post.createdAt).fromNow()}
                          </a>
                        </Link>
                      </p>
                    </div>
                    {/** post title */}
                    <h1 className="my-1 text-xl font-medium">{post.title}</h1>
                    {/** post body */}
                    <p className="my-3 text-sm">{post.body}</p>
                    {/** actions */}
                    <div className="flex">
                      <Link href={post.url}>
                        <a>
                          <ActionButton>
                            <i className="mr-1 fas fa-comment-alt fa-xs"></i>
                            <span className="font-bold">
                              {post.commentCount} comments
                            </span>
                          </ActionButton>
                        </a>
                      </Link>
                      <ActionButton>
                        <i className="mr-1 fas fa-share fa-xs"></i>
                        <span className="font-bold">share</span>
                      </ActionButton>
                      <ActionButton>
                        <i className="mr-1 fas fa-bookmark fa-xs"></i>
                        <span className="font-bold">save</span>
                      </ActionButton>
                    </div>
                  </div>
                </div>
                {/** comment input section */}
                <div className="pl-10 pr-6 mb-2">
                  {authenticated ? (
                    <div>
                      <p className="mb-1 text-xs text-gray-400">
                        comment as{" "}
                        <Link href={`/u/${user.username}`}>
                          <a className="font-semibold text-blue-500">
                            {user.username}
                          </a>
                        </Link>
                      </p>
                      <form onSubmit={submitComment}>
                        <textarea
                          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                          onChange={(e) => setNewComment(e.target.value)}
                          value={newComment}
                        ></textarea>

                        <div className="flex justify-end">
                          <button
                            className="px-3 py-1 blue button"
                            disabled={newComment.trim() === ""}
                          >
                            commment
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between px-2 py-4 border border-gray-200 rounded">
                        <p className="font-semibold text-gray-300">
                          login or signup to leave a comment
                        </p>

                        <div>
                          <Link href="/login">
                            <a className="px-4 py-1 mr-4 hollow blue button">
                              login
                            </a>
                          </Link>
                          <Link href="/register">
                            <a className="px-4 py-1 blue button">sign up</a>
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/** section divider */}
                <hr />

                {/** comments feed */}
                {comments?.map((comment) => (
                  <div className="flex" key={comment.identifier}>
                    {/**vote section */}
                    <div className="flex-shrink-0 w-10 py-2 text-center rounded-l">
                      {/** upVote  */}
                      <div
                        className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
                        onClick={() => vote(1, comment)}
                      >
                        <i
                          className={classNames("icon-arrow-up", {
                            "text-red-500": comment.userVote === 1,
                          })}
                        ></i>
                      </div>
                      <p className="font-bold font-xs">{comment.voteScore}</p>
                      {/** downVote */}
                      <div
                        className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-600"
                        onClick={() => vote(-1, comment)}
                      >
                        <i
                          className={classNames("icon-arrow-down", {
                            "text-blue-600": comment.userVote === -1,
                          })}
                        ></i>
                      </div>
                    </div>
                    <div className="py-2 pr-2">
                      <p className="mb-1 text-xs leading-none">
                        <Link href={`/u/${comment.username}`}>
                          <a className="mr-1 font-bold hover:underline">
                            {comment.username}
                          </a>
                        </Link>
                        <span className="text-gray-600">
                          {`
                            ${comment.voteScore}
                            points ∙
                            ${dayjs(comment.createdAt).fromNow()}
                          `}
                        </span>
                      </p>
                      <p>{comment.body}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/** side bar */}
        {post && <Sidebar sub={post.sub} />}
      </div>
    </>
  );
}
