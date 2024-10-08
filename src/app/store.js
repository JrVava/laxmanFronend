// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice'; // Adjust the path if necessary

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;
