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
import { Sub } from "../types";

// plugin
dayjs.extend(relativeTime);

export default function Home() {
  const { data: posts } = useSWR("/posts");
  const { data: topSubs } = useSWR("/misc/top-subs");

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
        <div className="ml-6 w-80">
          <div className="bg-white rounded">
            <div className="p-4 border-b-2">
              <p className="text-lg font-semibold text-center">
                Top communities
              </p>
            </div>
            <div>
              {topSubs?.map((sub: Sub) => (
                <div
                  key={sub.name}
                  className="flex items-center px-4 py-2 text-xs border-b"
                >
                  <Link href={`/f/${sub.name}`}>
                    <Image
                      src={sub.imageUrl}
                      className="rounded-full cursor-pointer"
                      alt="Sub"
                      width={(6 * 16) / 4}
                      height={(6 * 16) / 4}
                    />
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
          </div>
        </div>
      </div>
    </>
  );
}
