/**
 * client side for the user page
 *
 * need to get their posts, votes, comments and subs
 * they are indulged in
 *
 * ****** a dynamic route *******
 */

// package-import
import dayjs from "dayjs";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";

// relative import
import PostCard from "../../components/PostCard";
import { Comment, Post } from "../../types";

// user page
export default function user() {
  const router = useRouter();
  const username = router.query.username;

  const { data, error } = useSWR<any>(username ? `/user/${username}` : null);

  if (error) router.push("/"); // if error occured redirect to the homepage to avoid crashing
  if (data) console.log(data);
  return (
    <>
      <Head>
        <title>{data?.user.username}</title>
      </Head>
      {data && (
        <div className="container flex pt-5">
          <div className="w-160">
            {/** submissions */}
            {data.submissions.map((submission: any) => {
              if (submission.type === "Post") {
                // if submission type post we will just return post
                const post: Post = submission;
                return <PostCard key={post.identifier} post={post} />;
              } else {
                // if it is not post then it is for sure a comment
                const comment: Comment = submission;
                return (
                  <div
                    key={comment.identifier}
                    className="flex mb-4 bg-white rounded"
                  >
                    {/** if it is a comment one needs to know that it is a comment */}
                    {/** we need a icon for showing which one is comment */}
                    {/** to separate from the post */}

                    <div className="flex-shrink-0 w-10 py-4 text-center bg-gray-200 rounded-l">
                      {/** icon for identifying that it is a comment */}
                      <i className="text-gray-500 fas fa-comment-alt fa-xs"></i>
                    </div>
                    {/** actual content */}
                    <div className="w-full p-2">
                      {/** details */}
                      <p className="mb-2 text-xs text-gray-500">
                        {comment.username} <span>commented on </span>
                        <Link href={comment.post.url}>
                          <a className="font-semibold text-gray-600 cursor-pointer hover:underline">
                            {comment.post.title}
                          </a>
                        </Link>
                        {/** post divider */}
                        <span className="mx-1">∙</span>
                        <Link href={`/f/${comment.post.subName}`}>
                          <a className="font-semibold text-black cursor-pointer hover:underline">
                            /f/{comment.post.subName}
                          </a>
                        </Link>
                      </p>
                      {/** section divider */}
                      <hr />
                      {/** actual comment */}
                      <p>{comment.body}</p>
                    </div>
                  </div>
                );
              }
            })}
          </div>
          {/** sidebar section */}
          <div className="pl-6 w-80">
            <div className="bg-white rounded">
              <div className="p-3 bg-blue-500 rounded-t">
                <img
                  src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                  alt="user-profile"
                  className="w-16 h-16 mx-auto border-2 border-white rounded-full"
                />
              </div>
              {/** user info area */}
              <div className="p-3 text-center">
                <h1 className="mb-3 text-xl text-center">
                  {data.user.username}
                </h1>
                {/** section divider */}
                <hr />
                <p className="mt-3">
                  joined {dayjs(data.user.createdAt).format("MMM YYYY")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
