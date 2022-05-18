import React, {useEffect, useCallback, useState} from "react";
import gun from "..";

import { canRecall, signIn as gunSignIn, signUp as gunSignup, recall as gunRecall, onSignedIn } from "../auth";

export default function useGunAuth(persist){
  let [ isSignedIn, setIsSignedIn ] = useState(false);
  let [ error, setError ] = useState("");
  let [ showPin, setShowPin ] = useState(false);

  let signUp = useCallback((name, password, pin) => {
    if(isSignedIn) return gun.user();
    gunSignup(name, password, !!persist && pin).then((result) => {
      if(result.err) return setError(result.err);
      setError("")
      setIsSignedIn(true);
      setShowPin(false);
      return result
    })
  },[isSignedIn])

  let signIn = useCallback((name, password, persist) => {
    gunSignIn(name, password, persist).then((result) =>{
      if(isSignedIn) return gun.user();
      if(result.err) return setError(result.err);
      setError("")
      setIsSignedIn(true);
      setShowPin(false);
      return result;
    })
  },[isSignedIn])

  let recall = useCallback((pin) => {
    if(isSignedIn) return gun.user();
    gunRecall(pin).then(result => {
      if(result.err) return setError(result.err);
    })

  },[isSignedIn])

  let resetError = useCallback(() => {
    setError("")
  },[isSignedIn])

  useEffect(() => {
    setShowPin(canRecall())
    onSignedIn((signedIn) => { 
      setIsSignedIn(signedIn)
      setShowPin(false);
      setError("")
    })
  },[])

  return { showPin, isSignedIn, error, signIn, signUp, recall, resetError }
}