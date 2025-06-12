import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

interface SettingsState {
  darkMode: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

const initialState: SettingsState = {
  darkMode: true,
  emailNotifications: true,
  pushNotifications: true,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    toggleEmailNotifications: (state) => {
      state.emailNotifications = !state.emailNotifications;
    },
    setEmailNotifications: (state, action: PayloadAction<boolean>) => {
      state.emailNotifications = action.payload;
    },
    togglePushNotifications: (state) => {
      state.pushNotifications = !state.pushNotifications;
    },
    setPushNotifications: (state, action: PayloadAction<boolean>) => {
      state.pushNotifications = action.payload;
    },
  },
});

export const {
  toggleDarkMode,
  setDarkMode,
  toggleEmailNotifications,
  setEmailNotifications,
  togglePushNotifications,
  setPushNotifications,
} = settingsSlice.actions;

// Selectors
export const selectDarkMode = (state: RootState) => state.settings.darkMode;
export const selectEmailNotifications = (state: RootState) => state.settings.emailNotifications;
export const selectPushNotifications = (state: RootState) => state.settings.pushNotifications;

export default settingsSlice.reducer;
