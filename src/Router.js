import React, { useEffect, useState } from "react";
import useGunAuth from "./gun/hooks/useGunAuth";
import AuthScreen from "./Screens/AuthScreen";
import MainScreen from "./Screens/MainScreen";

const Router = () => {
  let {isSignedIn} = useGunAuth(true)
  let [routeState, setRouteState] = useState("none");

  useEffect(() => {
    if(!isSignedIn) setRouteState("authScreen");
    else setRouteState("main");
  },[ isSignedIn ])
  

  return (
    <>
      {routeState == "authScreen" && <AuthScreen/>} 
      {routeState == "main" && <MainScreen/>} 
    </>
  )

}
export default  Router;