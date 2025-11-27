import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Alert,
  Paper,
} from '@mui/material';
import { AppDispatch, RootState } from '../../shared/lib/store';
import { 
  startTestSession, 
  saveAnswer, 
  completeTestSession, 
  clearSession, 
  fetchTest,
  getCurrentSession 
} from '../../features/test-session/model/testSessionSlice';

const TestSessionPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentSession, currentTest, isLoading, error } = useSelector((state: RootState) => state.testSession);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const initializeSession = async () => {
      if (testId && user) {
        try {
          await dispatch(getCurrentSession({ 
            studentId: user.id, 
            testId: parseInt(testId) 
          })).unwrap();
          dispatch(fetchTest(parseInt(testId)));
        } catch (error) {
          console.error('Ошибка инициализации теста:', error);
          await dispatch(startTestSession({ 
            testId: parseInt(testId), 
            studentId: user.id 
          }));
          dispatch(fetchTest(parseInt(testId)));
        }
      }
    };

    initializeSession();
    return () => {
      dispatch(clearSession());
    };
  }, [testId, user]);

  const handleAnswerChange = (answer: number) => {
    if (currentSession) {

      const answerData = {
        questionId: currentQuestionIndex,
        selectedOption: answer,
        isCorrect: false
      };
     
      const newAnswers = currentSession.answers.filter(a => a.questionId !== currentQuestionIndex)
      newAnswers.push(answerData);

      dispatch(saveAnswer({
        sessionId: currentSession.id,
        answers: newAnswers
      }));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (currentTest?.questions.length ? currentTest.questions.length - 1 : 0)) {
      console.log(currentSession?.answers.find(a => a.questionId === currentQuestionIndex + 1));
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      console.log(currentSession?.answers.find(a => a.questionId === currentQuestionIndex - 1));
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleCompleteTest = async () => {
    if (currentSession && currentTest) {
      // Create a map of existing answers for quick lookup
      const existingAnswersMap = new Map(
        currentSession.answers.map(answer => [answer.questionId, answer])
      );

      // Process all questions, including unanswered ones
      const verifiedAnswers = currentTest.questions.map((question, index) => {
        const existingAnswer = existingAnswersMap.get(index);
        
        if (existingAnswer) {
          // If answer exists, verify it
          return {
            ...existingAnswer,
            isCorrect: existingAnswer.selectedOption === question.correctAnswer
          };
        } else {
          // If no answer exists, create a default one with isCorrect = false
          return {
            questionId: index,
            selectedOption: -1, // Indicates no answer was selected
            isCorrect: false
          };
        }
      });
      // Complete the test session with all answers
      await dispatch(completeTestSession({
        sessionId: currentSession.id,
        answers: verifiedAnswers
      }));
      
      navigate(`/lecture/${testId}`);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!currentSession || !currentTest) {
    return (
      <Container>
        <Alert severity="error">Тестовая сессия не найдена</Alert>
      </Container>
    );
  }

  const currentQuestion = currentTest.questions[currentQuestionIndex];
  const currentAnswer = currentSession.answers.find(a => a.questionId === currentQuestionIndex) ?? null;
  const progress = ((currentQuestionIndex + 1) / currentTest.questions.length) * 100;

  return (
    <Container>
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          Тестовая сессия
        </Typography>
        <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
        <Typography variant="body1" gutterBottom>
          Question {currentQuestionIndex + 1} of {currentTest.questions.length}
        </Typography>
        <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {currentQuestion.text}
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              value={currentAnswer?.selectedOption ?? null}
              onChange={(e) => handleAnswerChange(parseInt(e.target.value))}
            >
              {currentQuestion.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index.toString()}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Paper>
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button
            variant="contained"
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Предыдущий
          </Button>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === currentTest.questions.length - 1}
              sx={{ mr: 2 }}
            >
              Следующий
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleCompleteTest}
            >
              Завершить тест
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default TestSessionPage; 