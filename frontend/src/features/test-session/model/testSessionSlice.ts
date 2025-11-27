import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

export interface Answer {
  questionId: number;
  selectedOption: number;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface TestSessionState {
  currentSession: {
    id: string;
    testId: string;
    studentId: string;
    startTime: string;
    endTime: string;
    answers: Array<Answer>;
    score: number;
    finished: boolean;
  } | null;
  currentTest: {
    id: string;
    lectureId: string;
    questions: Array<Question>;
  } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TestSessionState = {
  currentSession: null,
  currentTest: null,
  isLoading: false,
  error: null,
};

export const startTestSession = createAsyncThunk(
  'testSession/start',
  async (data: { testId: number, studentId: number }, { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      const now = new Date();
      const endTime = new Date(now.getTime() + 1800000); // 30 minutes from now
      
      // Add timezone offset to ensure correct time on server
      const timezoneOffset = now.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
      const startTimeWithOffset = new Date(now.getTime() - timezoneOffset);
      const endTimeWithOffset = new Date(endTime.getTime() - timezoneOffset);
      
      const response = await axios.post(
        'http://localhost:8080/api/test-sessions',
        {
          ...data,
          startTime: startTimeWithOffset.toISOString(),
          endTime: endTimeWithOffset.toISOString()
        },
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to start test session');
    }
  }
);

export const fetchTest = createAsyncThunk(
  'testSession/fetchTest',
  async (testId: number, { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `http://localhost:8080/api/tests/${testId}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch test');
    }
  }
);

export const saveAnswer = createAsyncThunk(
  'testSession/saveAnswer',
  async (
    { sessionId, answers }: {
      sessionId: string;
      answers: Array<{
        questionId: number;
        selectedOption: number;
        isCorrect: boolean;
      }>;
    },
    { rejectWithValue }
  ) => {
    try {
      const token = Cookies.get("token");

      await axios.put(
        `http://localhost:8080/api/test-sessions/${sessionId}`,
        { answers },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      return { answers };
    } catch (error) {
      return rejectWithValue('Failed to save answer');
    }
  }
);

export const completeTestSession = createAsyncThunk(
  'testSession/complete',
  async (data: {sessionId: string, answers: Answer[]}, { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      console.log(data.answers);
      const response = await axios.put(
        `http://localhost:8080/api/test-sessions/finish/${data.sessionId}`,
        data.answers,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to complete test session');
    }
  }
);

export const getCurrentSession = createAsyncThunk(
  'testSession/getCurrent',
  async ({ studentId, testId }: { studentId: number, testId: number }, { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `http://localhost:8080/api/test-sessions/current/${studentId}/${testId}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue('No active session found');
    }
  }
);

const testSessionSlice = createSlice({
  name: 'testSession',
  initialState,
  reducers: {
    clearSession: (state) => {
      state.currentSession = null;
      state.currentTest = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startTestSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startTestSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload;
      })
      .addCase(startTestSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTest.fulfilled, (state, action) => {
        state.currentTest = action.payload;
      })
      .addCase(fetchTest.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(saveAnswer.fulfilled, (state, action) => {
        if (state.currentSession) {
          state.currentSession.answers = action.payload.answers;
        }
      })
      .addCase(saveAnswer.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(completeTestSession.fulfilled, (state, action) => {
        if (state.currentSession) {
          state.currentSession = action.payload;
        }
      })
      .addCase(completeTestSession.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(getCurrentSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload;
      })
      .addCase(getCurrentSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSession } = testSessionSlice.actions;
export const testSessionReducer = testSessionSlice.reducer; 