import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, data } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../shared/lib/store';
import Cookies from 'js-cookie';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Link,
  Stack,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import axios from 'axios';
import { number } from 'yup';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface Lecture {
  id: number,
  title: string,
  description: string,
  filePath: string,
  fileName: string,
  teacherId: number,
  createdAt: Date,
  updatedAt: Date
}

interface Question {
  text: string,
  options: string[],
  correctAnswer: number
}

interface Test {
  id: number,
  lectureId: number,
  questions: Question[]
}

interface TestSessionAnswer {
  questionId: number,
  selectedOption: number,
  isCorrect: boolean
}

interface TestSession {
  id: number,
  testId: number,
  studentId: number,
  startTime: Date,
  endTime: Date,
  answers: TestSessionAnswer[],
  score: number,
  finished: boolean;
}

export const LecturePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [testSessions, setTestSessions] = useState<TestSession[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [test, setTest] = useState<Test | null>(null)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = user?.id;
  const userRole = user?.role;
  const token = localStorage.getItem('token');


  useEffect(() => {
    const fetchLecture = async () => {
      try {
        const token = Cookies.get("token")

        const response = await axios.get(
          `http://localhost:8080/api/lectures/${id}`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        setLecture(response.data);
      } catch (err) {
        setError('Failed to load lecture data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLecture();
  }, [id, user]);

  const handleFetchTest = useCallback(async () => {
    if (lecture) {
      try {
        const token = Cookies.get("token")
        const testResponse = await axios.get(
          `http://localhost:8080/api/tests/lecture/${lecture.id}`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        setIsProcessing(false);
        setTest(testResponse.data);
      } catch (err) {
        console.error(err)
      }
    }
  }, [lecture?.id])

  useEffect(() => {
    handleFetchTest();
  }, [lecture])

  const handleFetchTestSessions = useCallback(async () => {
    if (test && user) {
      try {
        if (user.role === 'TEACHER') {
          const token = Cookies.get("token")
          const sessionsResponse = await axios.get(
            `http://localhost:8080/api/test-sessions/test/${test.id}`,
            {
              headers: {
                Authorization: `${token}`,
              },
            }
          );
          setTestSessions(sessionsResponse.data);
        }
        else if (user.role === 'STUDENT') {
          const token = Cookies.get("token")
          const sessionsResponse = await axios.get(
            `http://localhost:8080/api/test-sessions/student_and_test/${user.id}/${test.id}`,
            {
              headers: {
                Authorization: `${token}`,
              },
            }
          );
          setTestSessions(sessionsResponse.data);
        }
      } catch (err) {
        console.error(err)
      }
    }
  }, [test, user])

  useEffect(() => {
    handleFetchTestSessions();
  }, [test, user])

  const handleCreateTestByLecture = useCallback(async () => {
    if (lecture) {
      try {
        setIsProcessing(true);
        const token = Cookies.get("token");
        await axios.post(
          `http://localhost:8080/api/process`,
          { lectureId: lecture.id, filePath: lecture.filePath },
          { headers: { Authorization: `${token}` } }
        );
        setTimeout(handleFetchTest, 1000);
      } catch (err) {
        setIsProcessing(false);
        console.error(err)
      }
    }
  }, [lecture])

  const handleStartTest = useCallback(() => {
    if (test) navigate(`/test-session/${test?.id}`);
  }, [test]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !lecture) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error">{error || 'Lecture not found'}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {lecture.title}
      </Typography>
      <Typography variant="body1" paragraph>
        {lecture.description}
      </Typography>

      <Box sx={{ mt: "10px", mb: "20px" }}>
        {lecture &&
          <Link href={`http://localhost:9000/lectures/${lecture.filePath}`} target='_blank'>
            Скачать файл лекции
          </Link>
        }
      </Box>
      {user?.role === "TEACHER" ? (
        test
          ? <Box paddingBottom={'20px'}>
            <Accordion elevation={0} sx={{ bgcolor: 'transparent' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ px: 0 }}
              >
                <Typography variant="h6" color="text.secondary">
                  Тест по лекции
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0 }}>
                <Stack spacing={4}>
                  {test.questions.map((question, index) => (
                    <Box key={index} sx={{ borderLeft: 1, borderColor: 'divider', pl: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {index + 1}. {question.text}
                      </Typography>
                      <Stack spacing={1}>
                        {question.options.map((option, optionIndex) => (
                          <Paper
                            key={optionIndex}
                            elevation={0}
                            sx={{
                              p: 1.5,
                              borderRadius: 1,
                              bgcolor: 'transparent',
                              color: optionIndex === question.correctAnswer ? 'primary.main' : 'text.secondary'
                            }}
                          >
                            <Typography variant="body2">
                              {option}
                            </Typography>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Box>
          : (userRole === 'TEACHER' && userId === lecture.teacherId ? (
    <Button
      size="medium"
      color="primary"
      variant='contained'
      sx={{ marginBottom: "40px" }}
      onClick={handleCreateTestByLecture}
      disabled={!!test || isProcessing}
    >
      Сгенерировать тест по лекции
    </Button>
  ) : (
    <Typography variant="h6" gutterBottom color='silver'>
      Тест по лекции еще не сгенерирован
    </Typography>
  ))

        )
        : (
          test ? 
            <Button
              size="medium"
              color="primary"
              variant='contained'
              sx={{ marginBottom: "40px" }}
              onClick={handleStartTest}
            >
              Пройти тестирование
            </Button>
          : <Typography variant="h6" gutterBottom color='silver'>
            Тест по лекции еще не сгенерирован
          </Typography>
        )
      }
      <Typography variant="h6" gutterBottom>
        {user?.role === 'TEACHER' ? 'Сессии тестирования студентов' : 'Ваши сессии тестирования'}
      </Typography>
      {testSessions && testSessions.length > 0
        ? (
          <Card>
            <CardContent>
              <List>
                {testSessions.map((session) => (
                  <div key={session.id}>
                    <ListItem>
                      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle1">
                          {new Date(session.startTime).toLocaleDateString()} - {new Date(session.endTime).toLocaleTimeString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip
                            label={`Результат: ${session.score}%`}
                            color={session.score >= 70 ? 'success' : session.score >= 50 ? 'warning' : 'error'}
                            variant="outlined"
                          />
                          <Chip
                            label={session.finished ? 'Пройден' : 'В процессе'}
                            color={session.finished ? 'success' : 'primary'}
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </ListItem>
                    <Accordion elevation={0} sx={{ bgcolor: 'transparent' }}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ px: 2 }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Посмотреть ответы
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ px: 2 }}>
                        <Stack spacing={2}>
                          {test?.questions.map((question, index) => {
                            const answer = session.answers.find(a => a.questionId === index);
                            return (
                              <Box key={index} sx={{ borderLeft: 1, borderColor: 'divider', pl: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {index + 1}. {question.text}
                                </Typography>
                                <Stack spacing={1}>
                                  {question.options.map((option, optionIndex) => (
                                    <Paper
                                      key={optionIndex}
                                      elevation={0}
                                      sx={{
                                        p: 1,
                                        borderRadius: 1,
                                        bgcolor: 'transparent',
                                        color: 'text.secondary',
                                        border: answer?.selectedOption === optionIndex ? 1 : 0,
                                        borderColor: answer?.isCorrect ? 'success.main' : 'error.main'
                                      }}
                                    >
                                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {option}
                                        {answer?.selectedOption === optionIndex && (
                                          <Typography component="span" color={answer.isCorrect ? 'success.main' : 'error.main'} sx={{ fontWeight: 'bold' }}>
                                            {answer.isCorrect ? '✓ Верно' : '✗ Неверно'}
                                          </Typography>
                                        )}
                                      </Typography>
                                    </Paper>
                                  ))}
                                </Stack>
                                {(!answer || answer.selectedOption === -1) && (
                                  <Typography variant="body2" color="error.main" sx={{ mt: 1, fontStyle: 'italic' }}>
                                    Нет ответа
                                  </Typography>
                                )}
                              </Box>
                            );
                          })}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                    <Divider />
                  </div>
                ))}
                {testSessions.length === 0 && (
                  <ListItem>
                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', width: '100%' }}>
                      Тестовые сессии не найдены
                    </Typography>
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        )
        : (
          <Typography variant="h6" gutterBottom color='silver'>
            Пусто
          </Typography>
        )
      
      }
      {userRole === 'TEACHER' && userId === lecture.teacherId && (
  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
    <Button
      variant="outlined"
      color="error"
      onClick={async () => {
        try {
          await axios.delete(`http://localhost:8080/api/lectures/${lecture.id}/secure`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'X-User-Id': userId,
              'X-User-Role': userRole,
            },
          });
          alert('Лекция удалена');
          navigate('/');
        } catch (error) {
          console.error(error);
          alert('Ошибка при удалении лекции');
        }
      }}
    >
      Удалить лекцию
    </Button>
  </Box>
)}
    </Box>
  );
}; 