import { configureStore } from '@reduxjs/toolkit'

import gunData from "./reducer/gunData"

export const store = configureStore({
  reducer: {gunData},
})