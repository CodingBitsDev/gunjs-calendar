import { useState } from "react"

let currentOverlay = null
let overlayListener = new Set()
let onOverlaySet = (cb) => {
  overlayListener.add(cb)
  cb(currentOverlay)
  return () => overlayListener.delete(cb)
}
let openOverlay = (overlay) => {
  currentOverlay = overlay;
  overlayListener.forEach(cb => cb(overlay))
}

function useOverlay(){
  const [overlay, setOverlay] = useState(null)

  useState(() => {
    return onOverlaySet((overlay) => {setOverlay(overlay)})
  })

  return[overlay, openOverlay]
}
export default useOverlay