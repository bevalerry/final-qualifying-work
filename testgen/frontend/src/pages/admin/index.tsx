import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress
} from '@mui/material';

interface User {
  id: number;
  username: string;
  role: string;
  status: string;
}

const AdminPage = () => {
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:8081/api/admin/pending-teachers', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        console.log('Ответ сервера:', res.data);
        setUsers(res.data);
      })
      .catch(err => {
        console.error('Ошибка при получении заявок:', err);
        setUsers(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const approve = (id: number) => {
    axios.put(`http://localhost:8081/api/admin/approve/${id}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(() => setUsers(prev => prev?.filter(u => u.id !== id) || null))
      .catch(err => console.error(err));
  };

  if (loading) return <Box p={4}><CircularProgress /></Box>;

  if (!Array.isArray(users)) {
    return (
      <Box p={4}>
        <Typography color="error">Ошибка: данные не являются массивом</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" mb={2}>Заявки на регистрацию преподавателей</Typography>
      {users.length === 0 ? (
        <Typography>Нет заявок</Typography>
      ) : (
        <Stack spacing={2}>
          {users.map(user => (
            <Card key={user.id}>
              <CardContent>
                <Typography><b>Логин:</b> {user.username}</Typography>
                <Typography><b>Роль:</b> {user.role}</Typography>
                <Typography><b>Статус:</b> {user.status}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => approve(user.id)}
                >
                  Одобрить
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default AdminPage;
