import Link from "next/link";

// custom error 404 page
export default function notFound() {
  return (
    <div className="flex flex-col items-center pt-10">
      <h1 className="pt-1 mt-10 mb-4 font-bold text-blue-800 text-7xl">
        Oops !
      </h1>
      <h3 className="pt-1 text-2xl text-gray-600">404 - page not found</h3>
      <p className="pt-2 text-sm text-gray-400 text-semibold">
        requested page doesn't exist or it is temporarily unavailable
      </p>
      <div className="pt-2">
        <Link href="/">
          <a className="px-4 py-2 pt-2 blue button">go back to home</a>
        </Link>
      </div>
    </div>
  );
}
