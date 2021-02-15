// main app file
import { AppProps } from "next/app";
import Axios from "axios";
import { useRouter } from "next/router";

// context
import { AuthProvider } from "../context/auth";

// style
import "../styles/tailwind.css"; // custom css
import "../styles/icons.css"; // made with iconmoon

import Navbar from "../components/Navbar"; // navbar as a global thing for our page

Axios.defaults.baseURL = "http://localhost:5000/api";
Axios.defaults.withCredentials = true; // this takes use of cookies globally throughout the app

function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  /**
   * Need to check if the route's path is login or register
   * if so, need to take care of our global navbar
   */

  const authRoutes = ["/register", "/login"];
  const authRoute = authRoutes.includes(pathname);

  return (
    <>
      <AuthProvider>
        {!authRoute && <Navbar />}
        <Component {...pageProps} />
      </AuthProvider>
    </>
  );
}

export default App;
