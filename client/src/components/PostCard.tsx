import Link from "next/link";
import Axios from "axios";
import classNames from "classnames";

// extra time plugin
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// relative import
import { Post } from "../types";

dayjs.extend(relativeTime);

// component for avoiding code repetition
const ActionButton = ({ children }) => {
  return (
    <div className="px-1 py-1 mr-1 text-xs text-gray-400 rounded cursor-pointer hover:bg-gray-200">
      {children}
    </div>
  );
};

// interface
interface PostCardProps {
  post: Post;
}

export default function PostCard({
  post: {
    identifier,
    slug,
    title,
    body,
    subName,
    createdAt,
    updatedAt,
    voteScore,
    userVote,
    commentCount,
    url,
    username,
  },
}: PostCardProps) {
  // for votes to funcitonal on postcard
  const vote = async (value) => {
    try {
      const res = await Axios.post("/misc/vote", {
        identifier,
        slug,
        value,
      });

      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div key={identifier} className="flex mb-4 bg-white rounded">
      {/**vote section */}
      <div className="w-10 py-4 text-center bg-gray-200 rounded-l">
        {/** upVote  */}
        <div
          className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
          onClick={() => vote(1)}
        >
          <i
            className={classNames("icon-arrow-up", {
              "text-red-500": userVote === 1,
            })}
          ></i>
        </div>
        <p className="font-bold font-xs">{voteScore}</p>
        {/** downVote */}
        <div
          className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-600"
          onClick={() => vote(-1)}
        >
          <i
            className={classNames("icon-arrow-down", {
              "text-blue-600": userVote === -1,
            })}
          ></i>
        </div>
      </div>
      {/**post section */}
      <div className="w-full p-2">
        <div className="flex item-center">
          <Link href={`/f/${subName}`}>
            <>
              <img
                src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                className="w-6 h-6 mr-1 rounded-full cursor-pointer"
              />
            </>
          </Link>
          <Link href={`/f/${subName}`}>
            <a className="text-xs font-bold cursor-pointer hover:underline">
              /f/{subName}
            </a>
          </Link>

          <p className="text-xs text-gray-400 p">
            <span className="mx-1">∙</span>
            posted by
            <Link href={`/u/${username}`}>
              <a className="mx-1 hover:underline">/u/${username}</a>
            </Link>
            <Link href={url}>
              <a className="mx-1 hover:underline">
                {dayjs(createdAt).fromNow()}
              </a>
            </Link>
          </p>
        </div>
        <Link href={url}>
          <a className="my-1 text-lg font-medium">{title}</a>
        </Link>
        {body && <p className="my-1 text-sm">{body}</p>}

        <div className="flex">
          <Link href={url}>
            <a>
              <ActionButton>
                <i className="mr-1 fas fa-comment-alt fa-xs"></i>
                <span className="font-bold">{commentCount} comments</span>
              </ActionButton>
            </a>
          </Link>
          <ActionButton>
            <i className="mr-1 fas fa-share fa-xs"></i>
            <span className="font-bold">share</span>
          </ActionButton>
          <ActionButton>
            <i className="mr-1 fas fa-bookmark fa-xs"></i>
            <span className="font-bold">save</span>
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
