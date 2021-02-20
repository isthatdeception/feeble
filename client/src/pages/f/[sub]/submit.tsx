import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import useSWR from "swr";
import Axios from "axios";

// relative import
import Sidebar from "../../../components/Sidebar";
import { Post, Sub } from "../../../types";
import { GetServerSideProps } from "next";

// post submit page
export default function submit() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const router = useRouter();
  const { sub: subName } = router.query;

  const { data: sub, error } = useSWR<Sub>(subName ? `/subs/${subName}` : null);
  if (error) router.push("/");

  const submitPost = async (event: FormEvent) => {
    event.preventDefault();

    // if user submits a null by chance we rejects the post
    if (title.trim() === "") return;

    try {
      const { data: post } = await Axios.post<Post>("/posts", {
        title: title.trim(),
        body,
        sub: sub.name,
      });

      // redirect to the post after submitting it
      router.push(`/f/${sub.name}/${post.identifier}/${post.slug}`);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container flex pt-5">
      <Head>
        <title>submit to feeble</title>
      </Head>
      <div className="w-160">
        <div className="p-4 bg-white rounded">
          <h1 className="mb-3 text-lg text-gray-800 text-bold">
            submit a post to /f/{subName}
          </h1>
          <form onSubmit={submitPost}>
            <div className="relative mb-2">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none"
                placeholder="title"
                maxLength={300}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div
                className="absolute mb-2 text-sm text-gray-500 select-none focus:border-gray-500"
                style={{ top: 11, right: 10 }}
              >
                {/** eg */}
                {/** 19/300 */}
                {title.trim().length}/300
              </div>
            </div>

            {/** textarea */}
            <textarea
              className="w-full p-3 border-gray-200 rounded focus:outline-none focus:border-gray-500"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="write something (optional)"
              rows={4}
            >
              {/** todo : something in this area */}
            </textarea>
            <div className="flex justify-end">
              <button
                className="px-3 py-2 blue button"
                type="submit"
                disabled={title.trim().length === 0}
              >
                submit
              </button>
            </div>
          </form>
        </div>
      </div>
      {/** sidebar section */}
      {sub && <Sidebar sub={sub} />}
    </div>
  );
}

/**
 * above code handles the part on client side
 * but one can still access the submit page by typing manually
 * that leaves us to create a way to connect and validate through
 * the server side of the app
 *
 * as we cannot allow one to post something even without logging in or
 * take a glimpse of the submit page without logging in
 */

/// is user is authenticated ?
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  try {
    const cookie = req.headers.cookie;
    if (!cookie) throw new Error("missing auth token cookie!!");

    // if we have a cookie, we just send a request
    await Axios.get("/auth/me", { headers: { cookie } });

    // empty as all we needed is to check
    return { props: {} };
  } catch (err) {
    // all 300 codes are typically redirecting status codes
    // redirecting it to the login page for further authentication
    res.writeHead(307, { Location: "/login" }).end();
  }
};
