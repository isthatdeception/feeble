import dayjs from "dayjs";
import { Sub } from "../types";

// relative import
import { useAuthState } from "../context/auth";
import Link from "next/link";

// sidebar component
export default function Sidebar({ sub }: { sub: Sub }) {
  // *
  const { authenticated } = useAuthState();

  return (
    <div className="ml-6 w-80">
      <div className="bg-white rounded">
        <div className="p-3 bg-blue-500 rounded-t">
          <p className="font-semibold text-white">about community</p>
        </div>
        <div className="p-3">
          <p className="mb-3 text-md">{sub.description}</p>
          <div className="flex mb-3 text-sm font-medium">
            <div className="w-1/2">
              <p>5.2K</p>
              <p>members</p>
            </div>
            <div className="w-1/2">
              <p>178</p>
              <p>online</p>
            </div>
          </div>
          <p className="my-3 text-center">
            <i className="mr-2 fas fa-birthday-cake"></i>
            Created {dayjs(sub.createdAt).format("D MMM YYYY")}
          </p>
          {authenticated && (
            <Link href={`/f/${sub.name}/submit`}>
              <a className="w-full py-1 text-sm blue button">Create Post</a>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
