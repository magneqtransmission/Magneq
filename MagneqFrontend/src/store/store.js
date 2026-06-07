// https://blog.logrocket.com/persist-state-redux-persist-redux-toolkit-react/#persisting-state-redux-persist
import {configureStore} from "@reduxjs/toolkit";
import {combineReducers} from "redux";
import storage from "redux-persist/lib/storage";
import {persistReducer, persistStore} from "redux-persist";
// import thunk from "redux-thunk";

// your slices
import authReducer from "../features/authSlice";
import salesReducer from "../features/salesSlice";
import productionReducer from "../features/productionSlice";
import purchaseReducer from "../features/purchaseSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  sales: salesReducer,
  production: productionReducer,
  purchase: purchaseReducer,
  // Add more slices here
});

const rootPersistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // only sales will be persisted
};

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // necessary for redux-persist
    }),
  devTools: import.meta.env.VITE_NODE_ENV !== "production",
});

export const persistor = persistStore(store);
export default store;
