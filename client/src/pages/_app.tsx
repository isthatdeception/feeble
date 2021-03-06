// main app file
import { AppProps } from "next/app";
import Axios from "axios";
import { useRouter } from "next/router";
import { SWRConfig } from "swr";

// context
import { AuthProvider } from "../context/auth";

// style
import "../styles/tailwind.css"; // custom css
import "../styles/icons.css"; // made with iconmoon

import Navbar from "../components/Navbar"; // navbar as a global thing for our page

// server base laod
Axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_BASE_URL + "/api";
Axios.defaults.withCredentials = true; // this takes use of cookies globally throughout the app

function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  /**
   * Need to check if the route's path is login or register
   * if so, need to take care of our global navbar
   */

  const authRoutes = ["/register", "/login"];
  const authRoute = authRoutes.includes(pathname);

  const fetcher = async (url: string) => {
    try {
      const res = await Axios.get(url);
      return res.data;
    } catch (err) {
      throw err.response.data;
    }
  };

  return (
    <>
      <SWRConfig
        value={{
          fetcher,
          dedupingInterval: 10000,
        }}
      >
        <AuthProvider>
          {!authRoute && <Navbar />}
          <div className={authRoute ? "" : "pt-12"}>
            <Component {...pageProps} />
          </div>
        </AuthProvider>
      </SWRConfig>
    </>
  );
}

export default App;
