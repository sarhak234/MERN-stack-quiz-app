import React from "react";

function Header() {
  return (
    <header className="sticky top-0 w-full bg-white/80 backdrop-blur-md shadow-md z-50">
      <div className="h-[4rem] sm:h-[4.5rem] md:h-[5rem] flex items-center justify-center px-4 sm:px-6 md:px-10">
        <h1 className="font-bold text-cyan-400 tracking-wide text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-center">
          Automaura IT Solutions
        </h1>
      </div>
    </header>
  );
}

export default Header;
