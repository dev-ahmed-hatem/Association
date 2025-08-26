import { useState } from "react";
import Navbar from "../components/navbar/Navbar";
import Menu from "../components/Menu";
import { Outlet, useMatch } from "react-router";
import Home from "./Home";
import Footer from "../components/Footer";
import Breadcrumbs from "../components/BreadCrumbs";
import ScrollToTop from "../components/ScrollToTop";
import Error from "./Error";
import Logo from "@/components/Logo";

const Base = ({ error }: { error?: any }) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const isHome = useMatch("/");

  return (
    <>
      <ScrollToTop />
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Menu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      {error ? (
        // error display
        <Error />
      ) : isHome ? (
        // home page
        <Home />
      ) : (
        // nested routes
        <div className="padding-container py-7">
          <div className="flex items-center flex-wrap gap-10">
            <Logo />
            <Breadcrumbs />
          </div>
          <Outlet />
        </div>
      )}
      <Footer />
    </>
  );
};

export default Base;
