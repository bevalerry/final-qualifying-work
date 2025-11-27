import { useState } from 'react';
import {
  Box, Button, TextField, Typography, RadioGroup, Radio,
  FormControlLabel, IconButton, Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useLocation } from 'react-router-dom';

const CreateTestPage = () => {
  const location = useLocation();
  const lectureId = location.state?.lectureId;
  const token = Cookies.get('token');

  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    {
      text: '',
      answers: [{ text: '' }],
      correctIndex: 0
    }
  ]);

  const addQuestion = () => {
    setQuestions([...questions, {
      text: '',
      answers: [{ text: '' }],
      correctIndex: 0
    }]);
  };

  const addAnswer = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].answers.push({ text: '' });
    setQuestions(updated);
  };

  const removeAnswer = (qIndex: number, aIndex: number) => {
    const updated = [...questions];
    updated[qIndex].answers.splice(aIndex, 1);
    if (updated[qIndex].correctIndex >= updated[qIndex].answers.length) {
      updated[qIndex].correctIndex = 0;
    }
    setQuestions(updated);
  };

  const updateQuestion = (qIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].text = value;
    setQuestions(updated);
  };

  const updateAnswer = (qIndex: number, aIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].answers[aIndex].text = value;
    setQuestions(updated);
  };

  const setCorrectAnswer = (qIndex: number, aIndex: number) => {
    const updated = [...questions];
    updated[qIndex].correctIndex = aIndex;
    setQuestions(updated);
  };

  const handleSubmit = () => {
    const prepared = {
      lectureId,
      title,
      questions: questions.map(q => ({
        text: q.text,
        options: q.answers.map(a => a.text),
        correctAnswer: q.correctIndex
      }))
    };

    axios.post('http://localhost:8080/api/tests/manual', prepared, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
    .then(() => {
      alert('Тест создан!');
      setTitle('');
      setQuestions([{ text: '', answers: [{ text: '' }], correctIndex: 0 }]);
    })
    .catch(err => {
      console.error(err);
      alert('Ошибка при создании теста.');
    });
  };

  return (
    <Box p={4}>
      <Typography variant="h4" mb={2}>Создание теста вручную</Typography>

      <TextField
        fullWidth
        label="Название теста"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 4 }}
      />

      {questions.map((q, qIndex) => (
        <Box key={qIndex} mb={4} p={2} border="1px solid #ccc" borderRadius={2}>
          <TextField
            fullWidth
            label={`Вопрос ${qIndex + 1}`}
            value={q.text}
            onChange={(e) => updateQuestion(qIndex, e.target.value)}
            sx={{ mb: 2 }}
          />

          <RadioGroup
            value={q.correctIndex}
            onChange={(e) => setCorrectAnswer(qIndex, parseInt(e.target.value))}
          >
            {q.answers.map((a, aIndex) => (
              <Box key={aIndex} display="flex" alignItems="center" mb={1}>
                <FormControlLabel
                  value={aIndex}
                  control={<Radio />}
                  label={
                    <TextField
                      label={`Вариант ${aIndex + 1}`}
                      value={a.text}
                      onChange={(e) => updateAnswer(qIndex, aIndex, e.target.value)}
                      size="small"
                    />
                  }
                />
                <IconButton onClick={() => removeAnswer(qIndex, aIndex)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </RadioGroup>

          <Button onClick={() => addAnswer(qIndex)} startIcon={<AddIcon />}>
            Добавить вариант
          </Button>
        </Box>
      ))}

      <Button onClick={addQuestion} startIcon={<AddIcon />} sx={{ mb: 2 }}>
        Добавить вопрос
      </Button>

      <Button onClick={handleSubmit} variant="contained" color="primary">
        Сохранить тест
      </Button>
    </Box>
  );
};

export default CreateTestPage;
