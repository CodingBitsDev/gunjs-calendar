import React from "react";

const Header = ({title, rightElem}) => {
  return (
    <div 
      className="w-full h-16 bg-gray-900 flex items-center pl-4 pr-4"
    >
      <h1 className="text-white text-2xl font-bold">{title}</h1>
      <div className="grow"/>
      {rightElem}
    </div>
  )
}

export default Header;