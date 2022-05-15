import React, {useEffect, useCallback, useState} from "react";
import gun from "..";

export default function useGunValue(path){
  //TODO
  const [value, setValue] = useState();
  const setGunValue = useCallback((val) => {

  },[])

  return [value, setGunValue ]
}