import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-screen flex-col overflow-hidden pb-14">
      <Navbar />
      <main className="flex-1 overflow-auto">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
