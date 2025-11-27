import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: {
    id: number;
    username: string;
    role: 'TEACHER' | 'STUDENT';
  } | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  error: null,
  user: null,
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: { username: string; password: string, role: string }, { rejectWithValue }) => {
    try {
      await axios.post('http://localhost:8080/api/auth/register', credentials);
    } catch (error) {
      return rejectWithValue('Invalid credentials');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', credentials);
      const user = {
        id: response.data.id,
        username: response.data.username,
        role: response.data.role,
      };
      Cookies.set('token', response.data.token);
      return user;
    } catch (error) {
      return rejectWithValue('Invalid credentials');
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        return rejectWithValue('No token found');
      }
      const response = await axios.get('http://localhost:8080/api/auth/refresh', {
        headers: {
          Authorization: `${token}`,
        },
      });
      const user = {
        id: response.data.id,
        username: response.data.username,
        role: response.data.role,
      };
      Cookies.set('token', response.data.token);
      return user;
    } catch (error) {
      Cookies.remove('token');
      return rejectWithValue('Invalid token');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      Cookies.remove('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer; 