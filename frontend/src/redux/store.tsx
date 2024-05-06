import { useSelector, TypedUseSelectorHook, useDispatch } from "react-redux";
// this is taken from redux, typeuser is used to determine the type
// state of useSelectore, connected to use of the type
// useDispacth is to specify selecting a specific part of the redux state

import { configureStore } from "@reduxjs/toolkit";
import detailUserSlice from "./user/detailUserSlice";
import profileSlice from "./user/profileSlice";
import suggestedSlice from "./user/suggestedSlice";
// this is specifically for creating a store in Redux whose contents are taken from the slice

const store = configureStore({
  reducer: {
    detailUser: detailUserSlice,
    profile: profileSlice,
    suggested: suggestedSlice,
  },
});

type RootState = ReturnType<typeof store.getState>;
// this is the key definition in the redux store

type AppDispatch = typeof store.dispatch;
// this is the state type of Redux and AppDispacth of the application

export default store;
// this function is to share what is in the store throughout the application

export const useAppSelectore: TypedUseSelectorHook<RootState> = useSelector;
// serves to select a specific part of the redux state

export const useAppDispacth = () => useDispatch<AppDispatch>();
// because the type has been set from rootState , appdispatch is for the redux dispatcher
