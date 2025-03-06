import React from "react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center mt-64">
      <div className="relative w-12 h-12 z-10 border-4 border-transparent border-r-gray-900 rounded-full animate-spin">
        <div className="absolute inset-0 m-[2px] border-4 border-transparent border-r-gray-900 rounded-full animate-[spin_2s_linear_infinite]"></div>
        <div className="absolute inset-0 m-[8px] border-4 border-transparent border-r-gray-900 rounded-full animate-[spin_3s_linear_infinite]"></div>
      </div>
    </div>
  );
};

export default Loader;
