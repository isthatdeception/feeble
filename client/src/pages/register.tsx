import { FormEvent, useState } from "react";

import Head from "next/head";
import Link from "next/link";

// for routing
import Axios from "axios";
import { useRouter } from "next/router";

// component
import InputGroup from "../components/InputGroup";

// context
import { useAuthState } from "../context/auth";

export default function Register() {
  // use state
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [agreement, setagreement] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const { authenticated } = useAuthState(); // context for register

  const router = useRouter();

  /**
   * if a user is already logged in, he can't use any manual register route
   * also he should not be able to use, register while he has a valid token
   *
   * this makes it easier as system has to be more reliant toward token
   */

  // if the user is valid we will push him to the homepage as he still has a valid active token
  if (authenticated) router.push("/");

  // submitting the form so the details should be posted to the server
  const submitForm = async (event: FormEvent) => {
    // to stop reloading the page
    event.preventDefault();

    /**
     * agreement is needed to be checked coz if not one should not be able to login or 
       register to our site 

       i.e ensuring the user ticks the agreement policy while applying to register to be
       to access the site
     */

    if (!agreement) {
      // if agreement is not checked out we wil throw the error
      setErrors({ ...errors, agreement: "You must agree to the T&C" });
      return;
    }

    // if the upper condition is not met then it means the user has checked out all the agreements
    // this means we can validate the user credentials and make that a potential user
    try {
      await Axios.post("/auth/register", {
        email,
        password,
        username,
      });

      // once the registeration of the user is successful, we will make him login again
      // by redirecting to the login page
      router.push("/login");
    } catch (err) {
      // throw error if something went wrong
      setErrors(err.response.data);
    }
  };

  return (
    <div className="flex bg-white">
      <Head>
        <title>Register</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className="h-screen bg-center bg-cover w-36"
        style={{ backgroundImage: "url('/images/yo.jpg')" }}
      ></div>

      <div className="flex flex-col justify-center pl-6">
        <div className="w-70">
          <h1 className="mb-2 text-lg font-medium">Sign up</h1>
          <p className="mb-10 text-xs">
            By continuing, you agree to our User Agreement and Privacy Policy.
          </p>
          <form onSubmit={submitForm}>
            <div className="mb-6">
              <input
                type="checkbox"
                className="mr-1 cursor-pointer"
                id="agreement"
                checked={agreement}
                onChange={(e) => setagreement(e.target.checked)}
              />
              <label htmlFor="agreement" className="text-xs cursor-pointer">
                I agree to get emails about cool stuff on Feeble
              </label>
              <small className="block font-medium text-red-600">
                {errors.agreement}
              </small>
            </div>

            <InputGroup
              className="mb-2"
              type="email"
              value={email}
              setValue={setEmail}
              placeholder="@EMAIL.."
              error={errors.email}
            />

            <InputGroup
              className="mb-2"
              type="text"
              value={username}
              setValue={setUsername}
              placeholder="USERNAME.."
              error={errors.username}
            />

            <InputGroup
              className="mb-4"
              type="password"
              value={password}
              setValue={setPassword}
              placeholder="PASSWORD.."
              error={errors.password}
            />

            <button className="w-full py-2 mb-4 text-xs font-bold text-white uppercase bg-blue-500 border border-blue-500 rounded ">
              Sign up
            </button>
          </form>
          <small>
            Already have a feeble account ?
            <Link href="/login">
              <a className="ml-1 text-blue-500 uppercase">log In</a>
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}
