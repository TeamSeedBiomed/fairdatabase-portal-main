import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

export const Nav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: "/explore", label: "Explore Data" },
    { to: "/pkpd", label: "PBK Simulations" },
    { to: "/researchers", label: "For Researchers" },
    { to: "/about", label: "About" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed w-full bg-[#051312] backdrop-blur-md z-50 border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <img src="fairdb_logo.png" alt="FAIRDatabase logo" className="h-8 w-8" />
            <span className="hidden md:inline text-white text-xl font-semibold tracking-tight group-hover:text-primary transition-colors duration-200">
              FAIRDatabase
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  isActive(link.to)
                    ? "text-primary bg-white/10"
                    : "text-white/75 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white/75 hover:text-white p-2 rounded-md transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#051312] border-t border-white/10 px-4 py-3 space-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                isActive(link.to)
                  ? "text-primary bg-white/10"
                  : "text-white/75 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};
