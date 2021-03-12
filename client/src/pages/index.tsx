import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// hook
import useSWR, { useSWRInfinite } from "swr";

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
  // const { data: posts } = useSWR<Post[]>("/posts");
  const { data: topSubs } = useSWR<Sub[]>("/misc/top-subs");

  // global state
  const [observedPost, setObservedPost] = useState("");

  // utils
  const { authenticated } = useAuthState();

  // meta tag varriable for good seo
  // search engine optimization
  const title = "Feeble: wish on moon";
  const description =
    "Searching for people having same intrests as you. You are in the right place, Feeble is here for you. Interact, say and bring in the next interesting topic.";

  /**
   * swr infinite loading hook
   * read the docs infinite laoding for further needs
   */

  const {
    data,
    error,
    size: page,
    setSize: setPage,
    isValidating,
    revalidate,
  } = useSWRInfinite<Post[]>((index) => `/posts?page=${index}`);

  // this will be only true when we are first loading
  const isinitialLoading = !data && !error;

  const posts: Post[] = data ? [].concat(...data) : [];

  // tracking hook
  useEffect(() => {
    // if there is nothing left
    if (!posts || posts.length === 0) return;

    // we need to access to the last one
    const id = posts[posts.length - 1].identifier;

    if (id !== observedPost) {
      // will track this by their id
      // old school stuff
      setObservedPost(id);
      observeElement(document.getElementById(id));
    }
  }, [posts]);

  // tracks the intersection point of the page
  // developed with the concept of pagination
  // observer [tracking]
  const observeElement = (element: HTMLElement) => {
    if (!element) return;
    // provides the way to efficiently track the page content
    const observer = new IntersectionObserver(
      (entries) => {
        // if it is true there is a target that is intersecting
        if (entries[0].isIntersecting === true) {
          console.log("Reached bottom part of the post");
          setPage(page + 1);
          observer.unobserve(element);
        }
      },
      { threshold: 1 }
    );
    observer.observe(element);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        {/** metatag */}
        {/** description */}
        <meta name="description" content={description}></meta>
        <meta property="og:description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:title" content={title} />
      </Head>
      <div className="container flex pt-4">
        {/** post feed */}
        <div className="w-full px-4 md:w-160 md:p-0">
          {/** loading */}
          {isinitialLoading && (
            <p className="text-lg text-center">no posts submitted yet!</p>
          )}
          {posts?.map((post) => (
            <PostCard
              post={post}
              key={post.identifier}
              revalidate={revalidate}
            />
          ))}
          {isValidating && posts.length > 0 && (
            <p className="text-lg text-center">no posts submitted yet!</p>
          )}
        </div>
        {/** side bar */}
        <div className="hidden ml-6 md:block w-80">
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
