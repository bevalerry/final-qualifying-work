import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '../../features/auth/model/authSlice';
import { testSessionReducer } from '../../features/test-session/model/testSessionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    testSession: testSessionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 