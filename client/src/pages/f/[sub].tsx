// dynamic routes
// best practice to have [] on the name
// for dynamic routes
import Head from "next/head";
import { useRouter } from "next/router";
import useSWR from "swr";
import Image from "next/image";
import { ChangeEvent, createRef, useEffect, useState } from "react";
import classNames from "classnames";
import Axios from "axios";

// relative import
import PostCard from "../../components/PostCard";
import { Sub } from "../../types";
import Sidebar from "../../components/Sidebar";

import { useAuthState } from "../../context/auth";
/**
 * for identifying that the user logged in
 * is the actual user of the post and if so,
 * one need to give the overall rights over the post
 * e.g: images or editing the post
 */

export default function SubPage() {
  /**
   * Local state
   * Global state                // * order
   * Utils
   */

  // local state
  const [ownSub, setOwnSub] = useState(false);

  // global state
  const { authenticated, user } = useAuthState();

  // utils
  const router = useRouter();

  const fileInputRef = createRef<HTMLInputElement>();

  const subName = router.query.sub;

  const { data: sub, error, revalidate } = useSWR<Sub>(
    subName ? `/subs/${subName}` : null
  );

  // use state to effect
  useEffect(() => {
    // if there is not a sub then just return
    if (!sub) return;
    setOwnSub(authenticated && user.username === sub.username);
  }, [sub]);

  // file upload for authenticated owner
  const openFileInput = (type: string) => {
    if (!ownSub) return;
    fileInputRef.current.name = type;
    fileInputRef.current.click();
  };

  // file upload change trigger
  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", fileInputRef.current.name);

    try {
      await Axios.post<Sub>(`/subs/${sub.name}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      revalidate();
    } catch (err) {
      console.log(err);
    }
  };

  if (error) router.push("/");

  // if not loaded we can show loading of the page
  let postsMarkUp;
  if (!sub) {
    postsMarkUp = <p className="text-lg text-center">loading ...</p>;
  } else if (sub.posts.length === 0) {
    postsMarkUp = (
      <p className="text-lg text-center">no posts submitted yet!</p>
    );
  } else {
    postsMarkUp = sub.posts.map((post) => (
      <PostCard key={post.identifier} post={post} revalidate={revalidate} />
    ));
  }

  return (
    <>
      <div>
        <Head>
          <title>{sub?.title}</title>
        </Head>

        {sub && (
          <>
            <input
              type="file"
              hidden={true}
              ref={fileInputRef}
              onChange={uploadImage}
            />
            {/** Sub info and images */}
            <div>
              {/** Banner Image */}
              <div
                className={classNames("bg-blue-500", {
                  "cursor-pointer": ownSub,
                })}
                onClick={() => openFileInput("banner")}
              >
                {sub.bannerUrl ? (
                  <div
                    className="h-56 bg-blue-500"
                    style={{
                      backgroundImage: `url(${sub.bannerUrl})`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  ></div>
                ) : (
                  <div className="h-20 bg-blue-500"></div>
                )}
              </div>
              {/** sub meta data */}
              <div className="h-20 bg-white">
                <div className="container relative flex">
                  <div className="absolute" style={{ top: -15 }}>
                    <Image
                      src={sub.imageUrl}
                      alt="Sub"
                      className={classNames("rounded-full", {
                        "cursor-pointer": ownSub,
                      })}
                      onClick={() => openFileInput("image")}
                      width={70}
                      height={70}
                    />
                  </div>
                  <div className="pt-1 pl-24">
                    <div className="flex items-center">
                      <h1 className="mb-1 text-3xl font-bold">{sub.title}</h1>
                    </div>
                    <p className="text-sm font-bold text-gray-600">
                      /f/{sub.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/**Posts and Sidebar  */}
            <div className="container flex pt-5">
              <div className="w-160">{postsMarkUp}</div>
              <Sidebar sub={sub} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
