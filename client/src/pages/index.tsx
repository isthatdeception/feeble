import Axios from "axios";
import Head from "next/head";

import { useEffect, useState } from "react";

// time on app
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// relative import
import { Post } from "../types"; // custom type for our post entity
import PostCard from "../components/PostCard";

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
            <PostCard post={post} key={post.identifier} />
          ))}
        </div>
        {/** side bar */}
      </div>
    </div>
  );
}
