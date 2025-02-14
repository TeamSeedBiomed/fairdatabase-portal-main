import { Link } from "react-router-dom";

export const Nav = () => {
  return (
    <nav className="fixed w-full bg-[#051312] backdrop-blur-md z-50 border-b border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img src="fairdb_logo.png" alt="Logo" className="h-8 w-8" />
            <span className="text-white text-xl font-semibold">FAIRDatabase</span>
          </Link>
          <div className="flex space-x-8">
            <a href="#features" className="text-white/80 hover:text-white transition-colors">
              Features
            </a>
            <a href="#screenshots" className="text-white/80 hover:text-white transition-colors">
              Screenshots
            </a>
            <a href="#team" className="text-white/80 hover:text-white transition-colors">
              Team
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

