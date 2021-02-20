/**
 * for new subs
 * this is for creating a whole new sub
 */

// package-import
import { FormEvent, useState } from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import Axios from "axios";
import classNames from "classnames";
import { useRouter } from "next/router";

export default function create() {
  // locals
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // global
  const [errors, setErrors] = useState<Partial<any>>({});

  const router = useRouter();

  const submitForm = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const res = await Axios.post("/subs", { name, title, description });

      router.push(`/f/${res.data.name}`);
    } catch (err) {
      console.log(err);
      setErrors(err.response.data);
    }
  };

  return (
    <>
      <div className="flex bg-white">
        <Head>
          <title>create a community</title>
        </Head>
        {/** side image */}
        <div
          className="h-screen bg-center bg-cover w-36"
          style={{ backgroundImage: "url('/images/yo.jpg')" }}
        ></div>
        {/** content */}
        <div className="flex flex-col justify-center pl-6">
          <div className="w-98">
            <h1 className="mb-1 text-xl font-medium text-gray-600">
              create a{" "}
              <h1 className="text-3xl font-bold text-blue-700">community.</h1>
            </h1>
            {/** section divider */}
            <hr />
            {/** form to create the sub */}
            <form onSubmit={submitForm}>
              <div className="my-6">
                <p className="font-medium">Name</p>
                <p className="mb-2 text-xs text-gray-500">
                  community names include capitalization can not be changed.
                </p>
                {/** input section */}
                <input
                  type="text"
                  className={classNames(
                    "w-full p-1 border border-gray-200 rouned hover:border-gray-400",
                    { "border-red-600": errors.name }
                  )}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <small className="font-medium text-red-600">
                  {errors.name}
                </small>
              </div>
              <div className="my-6">
                <p className="font-medium">Title</p>
                <p className="mb-2 text-xs text-gray-500">
                  community title represent the topic, you can change anytime
                </p>
                {/** input section */}
                <input
                  type="text"
                  className={classNames(
                    "w-full p-1 border border-gray-200 rouned hover:border-gray-400",
                    { "border-red-600": errors.name }
                  )}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <small className="font-medium text-red-600">
                  {errors.title}
                </small>
              </div>
              <div className="my-6">
                <p className="font-medium">Description</p>
                <p className="mb-2 text-xs text-gray-500">
                  This is how new members will come to understand your community
                </p>
                {/** input section */}
                <textarea
                  className={classNames(
                    "w-full p-1 border border-gray-200 rouned hover:border-gray-400",
                    { "border-red-600": errors.description }
                  )}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <small className="font-medium text-red-600">
                  {errors.description}
                </small>
              </div>
              <div className="flex justify-end">
                <button className="px-4 py-1 text-sm font-medium capitalize blue button">
                  create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * above code handles the part on client side
 * but one can still access the create page by typing manually
 * that leaves us to create a way to connect and validate through
 * the server side of the app
 *
 * as we cannot allow one to post something even without logging in or
 * take a glimpse of the create a sub page without logging in
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
