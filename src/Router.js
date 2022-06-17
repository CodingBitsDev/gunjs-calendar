import React, { useEffect, useState } from "react";
import useGunAuth from "./gun/hooks/useGunAuth";
import useOverlay from "./hooks/useOverlay";
import AuthScreen from "./Screens/AuthScreen";
import MainScreen from "./Screens/MainScreen";

const Router = () => {
  let {isSignedIn} = useGunAuth(true)
  let [routeState, setRouteState] = useState("none");

  let [ overlay, setOverlay ] = useOverlay()

  useEffect(() => {
    if(!isSignedIn) setRouteState("authScreen");
    else setRouteState("main");
  },[ isSignedIn ])
  
  return (
    <>
      {routeState == "authScreen" && <AuthScreen/>} 
      {routeState == "main" && <MainScreen/>} 

      {!!overlay && (
        <div style={{zIndex: 1000}} className="top-0 left-0 w-screen h-screen absolute flex justify-center items-center">
          {overlay}
        </div>
      )}
    </>
    
  )

}
export default  Router;