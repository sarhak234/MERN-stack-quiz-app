import React from "react";

function Header() {
  return (
    <header className="sticky top-0 w-full bg-white/80 backdrop-blur-md shadow-md z-50">
      <div className="h-16 flex items-center justify-center px-6 md:px-10">
        <h1 className="text-3xl font-bold text-cyan-400 tracking-wide">
          AutoMora
        </h1>
      </div>
    </header>
  );
}

export default Header;
