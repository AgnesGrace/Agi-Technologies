"use client"

import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { api } from "./api"
import {
  Provider,
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux"
import { ReactNode, useEffect, useState } from "react"
import { setupListeners } from "@reduxjs/toolkit/query"

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
})

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            "api/executeMutation/pending",
            "api/executeMutation/fulfilled",
            "api/executeMutation/rejected",
          ],
          ignoredActionPaths: [
            "meta.arg.originalArgs.file",
            "meta.arg.originalArgs.formData",
            "meta.baseQueryMeta.request",
            "meta.baseQueryMeta.response",
            "payload.lecture.videoKey",
            "payload.lecture.pdfKey",
          ],
          ignoredPaths: [
            "global.courseEditor.sections",
            "meta.baseQueryMeta.request",
            "meta.baseQueryMeta.response",
          ],
        },
      }).concat(api.middleware),
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore())

  useEffect(() => {
    if (store) {
      return setupListeners(store.dispatch)
    }
  }, [store])

  return <Provider store={store}>{children}</Provider>
}
