import Head from "next/head";

// hook
import useSWR from "swr";

// time on app
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// relative import
import PostCard from "../components/PostCard";

// plugin
dayjs.extend(relativeTime);

export default function Home() {
  const { data: posts } = useSWR("/posts");

  return (
    <>
      <Head>
        <title>Feeble: wish on moon</title>
      </Head>
      <div className="container flex pt-4">
        {/** post feed */}
        <div className="w-160">
          {posts?.map((post) => (
            <PostCard post={post} key={post.identifier} />
          ))}
        </div>
        {/** side bar */}
      </div>
    </>
  );
}
