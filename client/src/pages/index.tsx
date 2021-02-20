import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

// hook
import useSWR from "swr";

// time on app
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// relative import
import PostCard from "../components/PostCard";
import { Post, Sub } from "../types";
import { useAuthState } from "../context/auth";

// plugin
dayjs.extend(relativeTime);

export default function Home() {
  // local context
  const { data: posts } = useSWR<Post[]>("/posts");
  const { data: topSubs } = useSWR<Sub[]>("/misc/top-subs");

  // global state
  const { authenticated } = useAuthState();

  return (
    <>
      <Head>
        <title>Feeble: wish on moon</title>
      </Head>
      <div className="container flex pt-4">
        {/** post feed */}
        <div className="w-full md:w-160 ">
          {posts?.map((post) => (
            <PostCard post={post} key={post.identifier} />
          ))}
        </div>
        {/** side bar */}
        <div className="hidden px-4 ml-6 md:block w-80 md:p-0">
          <div className="bg-white rounded">
            <div className="p-4 border-b-2">
              <p className="text-lg font-semibold text-center">
                Top communities
              </p>
            </div>
            <div>
              {topSubs?.map((sub) => (
                <div
                  key={sub.name}
                  className="flex items-center px-4 py-2 text-xs border-b"
                >
                  <Link href={`/f/${sub.name}`}>
                    <a>
                      <Image
                        src={sub.imageUrl}
                        className="rounded-full cursor-pointer"
                        alt="Sub"
                        width={(6 * 16) / 4}
                        height={(6 * 16) / 4}
                      />
                    </a>
                  </Link>

                  <Link href={`/f/${sub.name}`}>
                    <a className="ml-2 font-bold hover:cursor-pointer">
                      /f/{sub.name}
                    </a>
                  </Link>
                  <p className="ml-auto font-medium">{sub.postCount}</p>
                </div>
              ))}
            </div>
            {/** button for creating a sub */}
            {/** we will only allow if they are already authenticated */}
            {authenticated && (
              <div className="p-4 border-t-2">
                <Link href="/subs/create">
                  <a className="w-full px-2 py-2 blue button">
                    create a commumity
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
