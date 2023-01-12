import "../styles/globals.css";
import type { AppProps } from "next/app";
import Bar from "../src/common/components/nav-bar/NavBar";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Bar />
      <Component {...pageProps} />
    </>
  );
}
