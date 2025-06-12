import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import settingsReducer from './slices/settingsSlice';
import { apiSlice } from './api/apiSlice';

// Define RootState type for type safety
export interface RootState {
  auth: ReturnType<typeof authReducer>;
  settings: ReturnType<typeof settingsReducer>;
  [apiSlice.reducerPath]: ReturnType<typeof apiSlice.reducer>;
}

export const rootReducer = combineReducers({
  auth: authReducer,
  settings: settingsReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
  // Add more reducers here as needed
});
