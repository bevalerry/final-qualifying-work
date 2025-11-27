import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Pagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import { RootState } from '../../shared/lib/store';
import axios from 'axios';
import Cookies from 'js-cookie';

interface Lecture {
  id: string;
  title: string;
  description: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [teacherLectures, setTeacherLectures] = useState<Lecture[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchTeacherLectures = async () => {
      if (user?.role === "TEACHER") {
        try {
          const token = Cookies.get('token');

          const response = await axios.get<Lecture[]>(
            `http://localhost:8080/api/lectures/teacher/${user.id}`,
            {
              headers: {
                Authorization: `${token}`,
              },
            }
          );

          setTeacherLectures(response.data);
        } catch (err) {
          setError('Failed to load lectures');
        } finally {
          setIsLoading(false);
        }
      };
    }

    fetchTeacherLectures();
  }, [user?.role]);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const token = Cookies.get('token');

        const response = await axios.get<PageResponse<Lecture>>(
          `http://localhost:8080/api/lectures?page=${page - 1}&size=10`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        setLectures(response.data.content);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        setError('Failed to load lectures');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLectures();
  }, [page]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
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

  return (
    <Container>
      <Box
        my={4}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <Typography variant="h4" gutterBottom>
          Здравствуйте, {user?.username}
        </Typography>
        {user?.role === 'TEACHER' && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Ваши лекции
            </Typography>
            {teacherLectures  
              ? <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                  },
                  gap: 3,
                }}
              >
                {teacherLectures?.map((lecture) => (
                  <Card key={lecture.id}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {lecture.title}
                      </Typography>
                      <Typography variant="body1">
                        {lecture.description}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/lecture/${lecture.id}`)}
                      >
                        Перейти
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Box>
              : <Box>
                <Typography variant="h6" gutterBottom color='silver'>
                  Пусто
                </Typography>
              </Box>
            }
          </Box>
        )}
        <Box>
          <Typography variant="h6" gutterBottom>
            Список всех лекций
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            {lectures.map((lecture) => (
              <Card key={lecture.id}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {lecture.title}
                  </Typography>
                  <Typography variant="body1">
                    {lecture.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/lecture/${lecture.id}`)}
                  >
                    Перейти
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage; 