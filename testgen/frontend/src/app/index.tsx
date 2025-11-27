import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState, store } from '../shared/lib/store';
import { checkAuth } from '../features/auth/model/authSlice';
import { Layout } from '../widgets/layout';
import ProfilePage from '../pages/profile';
import { LoginPage } from '../pages/login';
import { RegisterPage } from '../pages/register';
import { LectureUploadPage } from '../pages/lecture-upload';
import { LecturePage } from '../pages/lecture';
import TestSessionPage from '../pages/test-session';
import HomePage from '../pages/home';


export const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
        <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<HomePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="lecture/upload" element={<LectureUploadPage />} />
          <Route path="lecture/:id" element={<LecturePage />} />
          <Route path="test-session/:testId" element={<TestSessionPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}; 