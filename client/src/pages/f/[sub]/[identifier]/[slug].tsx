// dynamic single post page

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";
import Axios from "axios";
import classNames from "classnames";

// extra time plugin
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// relative import
import { Post } from "../../../../types";
import Sidebar from "../../../../components/Sidebar";
import { useAuthState } from "../../../../context/auth";
import ActionButton from "../../../../components/ActionButton";

dayjs.extend(relativeTime);

// code
export default function PostPage() {
  /// local state

  ///global state
  const { authenticated } = useAuthState();

  /// utils
  const router = useRouter();
  const { identifier, sub, slug } = router.query;

  const { data: post, error } = useSWR<Post>(
    identifier && slug ? `/posts/${identifier}/${slug}` : null
  );

  if (error) router.push("/");

  const vote = async (value: number) => {
    // checking if the user is logged in or not
    // if not we will redirect him to login page as he click
    // to vote

    if (!authenticated) router.push("/login");

    // if vote is the same reset vote
    if (value === post.userVote) value = 0;

    try {
      const res = await Axios.post("/misc/vote", {
        identifier,
        slug,
        value,
      });

      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Head>
        <title>{post?.title}</title>
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
              <div className="flex">
                {/**vote section */}
                <div className="w-10 py-4 text-center rounded-l">
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
                <div className="p-2">
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
            )}
          </div>
        </div>

        {/** side bar */}
        {post && <Sidebar sub={post.sub} />}
      </div>
    </>
  );
}
