import React, {useEffect, useCallback, useState} from "react";
import gunHelper from "../gunHelper";

export default function useGunValue(path){
  const [value, setValue] = useState(null);
  const setGunValue = useCallback((val) => {
    gunHelper.getNodeByPath(path).put(val)
  },[path])

  useEffect(() => {
    let listener = (val) => {
      setValue(val)
    }
    gunHelper.on(path, listener)
    return () => gunHelper.off(path, listener)
  },[path])

  return [value, setGunValue ]
}