function YesNoModal({title, text, onYes, onNo}){
  const yesPressed  = (e) => {
    onYes?.()
  }

  const noPressed  = () => {
    onNo?.()
  }


  return (
    <form className="w-auto h-auto bg-black p-6 flex flex-col border-2 border-white rounded-xl relative">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-2xl font-bold mb-1">{title || ""}</h1>
      </div>
      <div className="w-full border-b-2 h-0 mb-2 "></div>
      <p className="text-white mt-2">{text}</p>
      <div className="mt-6 flex">
        <button 
          onClick={yesPressed}
          className="bg-green-600 mr-1 font-bold text-white rounded-md grow"
        >
          Yes
        </button>
        <button 
          onClick={noPressed}
          className="bg-red-600 ml-1 font-bold text-white rounded-md grow"
        >
          No
        </button>
      </div>
    </form>
  );
  return null;
}

export default YesNoModal