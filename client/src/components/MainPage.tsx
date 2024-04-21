import React from 'react'
import { useNavigate } from 'react-router-dom';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';

export const MainPage: React.FC = () => {
  const navigate = useNavigate()

  return <Stack gap={1}>
    <Button onClick={() => navigate('/rooms')}>Play online</Button>
  </Stack>
}
