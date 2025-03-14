import React from "react";

const Loading = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-white bg-opacity-75 z-50">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 rounded-full border-4 border-gray-300 border-t-primary border-l-primary animate-spin-ease"></div>
      </div>
    </div>
  );
};

export default Loading;
