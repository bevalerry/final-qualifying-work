import {
  Box,
  Typography,
  Paper,
  Avatar,
  Stack,
  TextField,
  Button,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../shared/lib/store';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useEffect, useState } from 'react';
import axios from 'axios';

const ProfilePage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState({
    id: 0,
    userId: user?.id,
    firstName: '',
    lastName: '',
    middleName: '',
    birthDate: '',
    email: '',
    phone: '',
    bio: '',
  });

  const [editMode, setEditMode] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/profiles/user/${user?.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (e: any) {
        if (e.response?.status === 404 && user?.id) {
          try {
            const createRes = await axios.post(`http://localhost:8080/api/profiles`, {
              userId: user.id,
              firstName: '',
              lastName: '',
              middleName: '',
              birthDate: '',
              email: '',
              phone: '',
              bio: '',
            }, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setProfile(createRes.data);
          } catch (err) {
            console.error('Ошибка при создании профиля', err);
          }
        } else {
          console.error('Ошибка при получении профиля', e);
        }
      }
    };
    if (user?.id) fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:8080/api/profiles/user/${user.id}`, profile, {
        headers: { Authorization: `Bearer ${token}` },
        });
      alert('Профиль обновлён');
      setEditMode(false);
    } catch (e) {
      console.error('Ошибка при сохранении', e);
      alert('Ошибка при обновлении профиля');
    }
  };

  if (!user) {
    return <Typography>Пользователь не авторизован</Typography>;
  }

  const renderField = (label: string, value: string, name: string, type = "text") => {
    return !editMode ? (
      <Typography><strong>{label}:</strong> {value || '—'}</Typography>
    ) : (
      <TextField
        label={label}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        fullWidth
        InputLabelProps={type === "date" ? { shrink: true } : undefined}
      />
    );
  };

  return (
    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 600 }}>
        <Typography variant="h5" gutterBottom>Профиль</Typography>

        <Stack direction="row" spacing={3} alignItems="center" mt={2} mb={3}>
          <Avatar sx={{ width: 80, height: 80 }}>
            <AccountCircleIcon sx={{ fontSize: 80 }} />
          </Avatar>

          <Box>
            <Typography><strong>Логин:</strong> {user.username}</Typography>
            <Typography><strong>Роль:</strong> {user.role}</Typography>
          </Box>
        </Stack>

        <Stack spacing={2}>
          {renderField("Имя", profile.firstName, "firstName")}
          {renderField("Фамилия", profile.lastName, "lastName")}
          {renderField("Отчество", profile.middleName, "middleName")}
          {renderField("Дата рождения", profile.birthDate, "birthDate", "date")}
          {renderField("Email", profile.email, "email")}
          {renderField("Телефон", profile.phone, "phone")}
          {renderField("Биография", profile.bio, "bio")}

          {!editMode ? (
            <Button variant="outlined" onClick={() => setEditMode(true)}>
              Изменить профиль
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={handleSave}>
              Сохранить изменения
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
