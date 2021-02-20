// package-import
import Link from "next/link";
import Axios from "axios";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

// relative import
import { useAuthDispatch, useAuthState } from "../context/auth";
import FeebleLogo from "../images/coffee.svg";
import { Sub } from "../types";

const Navbar: React.FC = () => {
  // locals state
  const [name, setName] = useState("");
  const [subs, setSubs] = useState<Sub[]>([]);
  // timer for delaying the listing of search results
  // this will make the overall feel of searching
  // more fluent
  const [timer, setTimer] = useState(null);

  // global state
  const { authenticated, loading } = useAuthState();
  const dispatch = useAuthDispatch();

  // utils
  const router = useRouter();

  // for logging out the user
  const logout = () => {
    Axios.get("/auth/logout")
      .then(() => {
        dispatch("LOGOUT");
        window.location.reload();
      })
      .catch((err) => console.log(err));
  };

  // to affect the state of the timer
  useEffect(() => {
    if (name.trim() === "") {
      setSubs([]);
      return;
    }
    searchSubs();
  }, [name]);

  // for searching subs [client side]
  // also will use the state to get into the other side
  const searchSubs = async () => {
    // to clear the timeout
    clearTimeout(timer);

    // timer for delaying search
    setTimer(
      setTimeout(async () => {
        try {
          // fetching the required data so one can easily get all the details
          // regarding the sub
          const { data } = await Axios.get(`/subs/search/${name}`);

          setSubs(data);
          console.log(data);
        } catch (err) {
          console.log(err);
        }
      }, 250) // interval for which we want to delay it
    );
  };

  // after we do the search
  // we will make them into the links to the detailed subs
  const goToSub = (subName: string) => {
    router.push(`/f/${subName}`);
    setName("");
  };

  return (
    <div>
      <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-center h-10 px-5 bg-white item-center">
        {/* logo and title */}
        <div className="flex items-center">
          <Link href="/">
            <a>
              <FeebleLogo className="w-8 h-8 mr-2" />
            </a>
          </Link>
          <span className="mr-2 text-2xl font-semibold">
            <Link href="/">feeble</Link>
          </span>
        </div>

        {/* Search Input */}
        <div className="relative flex items-center mx-auto bg-gray-100 border rounded hover:border-blue-500 hover:bg-white">
          <i className="pl-5 pr-3 text-gray-500 fas fa-search"></i>
          <input
            type="text"
            className="py-1 pr-3 bg-transparent rounded w-160 focus:outline-none"
            placeholder="search something.."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {/** for search results */}
          {/** maybe a type of drop-down */}
          <div
            className="absolute left-0 right-0 bg-white"
            style={{ top: "100%" }}
          >
            {/** search results */}
            {subs?.map((sub) => (
              // tag image
              <div
                className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-200"
                onClick={() => goToSub(sub.name)}
              >
                <Image
                  src={sub.imageUrl}
                  alt="sub"
                  className="rounded-full"
                  height={(8 * 16) / 4}
                  width={(8 * 16) / 4}
                />
                {/** search info */}
                <div className="ml-4 text-sm">
                  <p className="font-medium">{sub.name}</p>
                  <p className="text-gray-600">{sub.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="flex ml-2">
          {/* now for auth buttons */}
          {!loading &&
            (authenticated ? (
              // show logout option to the user
              <button
                className="w-32 py-1 mr-4 leading-5 hollow blue button"
                onClick={logout}
              >
                logout
              </button>
            ) : (
              /**
               * else we will show them
               * login or register route to interact
               * with site
               */

              <>
                <Link href="/login">
                  <a className="w-32 py-1 mr-4 leading-5 hollow blue button">
                    log in
                  </a>
                </Link>
                <Link href="/register">
                  <a className="w-32 py-1 leading-5 blue button">sign up</a>
                </Link>
              </>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
