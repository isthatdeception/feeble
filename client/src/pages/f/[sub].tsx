// dynamic routes
// best practice to have [] on the name

import { useRouter } from "next/router";
import useSWR from "swr";
import PostCard from "../../components/PostCard";

export default function Sub() {
  const router = useRouter();

  const subName = router.query.sub;

  const { data: sub, error } = useSWR(subName ? `/subs/${subName}` : null);
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
      <PostCard key={post.identifier} post={post} />
    ));
  }

  return (
    <div className="container flex pt-5">
      {sub && <div className="w-160">{postsMarkUp}</div>}
    </div>
  );
}
