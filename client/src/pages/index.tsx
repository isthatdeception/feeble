import Axios from "axios";
import Head from "next/head";
import Link from "next/link";

import { useEffect, useState } from "react";

// time on app
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Post } from "../types"; // custom type for our post entity

// plugin
dayjs.extend(relativeTime);

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]); // type: post array

  useEffect(() => {
    Axios.get("/posts")
      .then((res) => setPosts(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="pt-12">
      <Head>
        <title>Feeble: wish on moon</title>
      </Head>
      <div className="container flex pt-4">
        {/** post feed */}
        <div className="w-160">
          {posts.map((post) => (
            <div key={post.identifier} className="flex mb-4 bg-white rounded">
              {/**vote section */}
              <div className="w-10 text-center bg-gray-200 rounded-l">
                <p>v</p>
              </div>
              {/**post section */}
              <div className="w-full p-2">
                <div className="flex item-center">
                  <Link href={`/f/${post.subName}`}>
                    <>
                      <img
                        src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                        className="w-6 h-6 mr-1 rounded-full cursor-pointer"
                      />
                      <a className="text-xs font-bold cursor-pointer hover:underline">
                        /f/{post.subName}
                      </a>
                    </>
                  </Link>
                  <p className="text-xs text-gray-400 p">
                    <span className="mx-1">∙</span>
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
                <Link href={post.url}>
                  <a className="my-1 text-lg font-medium">{post.title}</a>
                </Link>
                {post.body && <p className="my-1 text-sm">{post.body}</p>}

                <div className="flex">
                  <Link href={post.url}>
                    <a>
                      <div className="px-1 py-1 mr-1 text-xs text-gray-400 rounded cursor-pointer hover:bg-gray-200">
                        <i className="mr-1 fas fa-comment-alt fa-xs"></i>
                        <span className="font-bold">20 comments</span>
                      </div>
                    </a>
                  </Link>
                  <div className="px-1 py-1 mr-1 text-xs text-gray-400 rounded cursor-pointer hover:bg-gray-200">
                    <i className="mr-1 fas fa-share fa-xs"></i>
                    <span className="font-bold">share</span>
                  </div>
                  <div className="px-1 py-1 mr-1 text-xs text-gray-400 rounded cursor-pointer hover:bg-gray-200">
                    <i className="mr-1 fas fa-bookmark fa-xs"></i>
                    <span className="font-bold">save</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/** side bar */}
      </div>
    </div>
  );
}
