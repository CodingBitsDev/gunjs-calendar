import React, {useEffect, useCallback, useState} from "react";
import gun from "..";

export default function useGunValue(path){
  const [value, setValue] = useState(null);
  const setGunValue = useCallback((val) => {
    gun.getNodeByPath(path).put(val)
  },[path])

  useEffect(() => {
    let listener = (val) => {
      setValue(val)
    }
    gun.addListener(path, listener)
    return () => gun.removeListener(path, listener)
  },[path])

  return [value, setGunValue ]
}