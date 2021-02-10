import Link from "next/link";
import FeebleLogo from "../images/coffee.svg";

const Navbar: React.FC = () => (
  <div>
    <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-center h-12 px-5 bg-white item-center">
      {/* logo and title */}
      <div className="flex items-center">
        <Link href="/">
          <a>
            <FeebleLogo className="w-8 h-8 mr-2" />
          </a>
        </Link>
        <span className="text-2xl font-semibold">
          <Link href="/">feeble</Link>
        </span>
      </div>

      {/* Search Input */}
      <div className="flex items-center py-2 mx-auto bg-gray-100 border rounded hover:border-blue-500 hover:bg-white">
        <i className="pl-5 pr-3 text-gray-500 fas fa-search"></i>
        <input
          type="text"
          className="py-1 pr-3 bg-transparent rounded w-160 focus:outline-none"
          placeholder="search something.."
        />
      </div>

      {/* Auth Buttons */}
      <div className="flex">
        <Link href="/login">
          <a className="w-32 py-1 mr-4 leading-5 hollow blue button">log in</a>
        </Link>
        <Link href="/register">
          <a className="w-32 py-1 leading-5 blue button">sign up</a>
        </Link>
      </div>
    </div>
  </div>
);

export default Navbar;