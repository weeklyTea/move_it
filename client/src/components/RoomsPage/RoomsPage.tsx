import React from 'react'
import Box from '@mui/joy/Box'
import Table from '@mui/joy/Table'
import Sheet from '@mui/joy/Sheet'
import Alert from '@mui/joy/Alert'
import { RoomAvailable } from 'colyseus.js'

import { client } from '../../core/client'
import { useNavigate } from 'react-router-dom'
import { CreateRoomForm, JoinRoomForm } from './forms'
import { useCleanReconnectToken } from '../../utils/hooks'

const refetchInterval = 3000
function useRooms() {
  const [rooms, setRooms] = React.useState<RoomAvailable[]>([])
  const [error, setError] = React.useState<string>()

  React.useEffect(() => {
    function fetchRooms() {
      client.getAvailableRooms()
        .then(rooms => {
          setRooms(rooms)
          setError(undefined)
        })
        .catch(() => setError('Unable to fetch rooms'))
    }

    fetchRooms()
    const intervalId = setInterval(fetchRooms, refetchInterval)

    return () => clearInterval(intervalId)
  }, [])

  return { rooms, error }
}

const RoomsList: React.FC<{}> = ({ }) => {
  const { rooms, error } = useRooms()

  useCleanReconnectToken()

  const navigate = useNavigate()
  const joinGame = React.useCallback((roomId: string) => {
    navigate(`/rooms/${roomId}`)
  }, [])

  return <Sheet sx={{ height: '300px' }}>
    Rooms:
    <Table hoverRow>
      <thead>
        <tr>
          <th style={{ width: '80%' }}>Room name</th>
          <th>Players</th>
        </tr>
      </thead>
      <tbody>
        {rooms.map((room) => (
          <tr key={room.roomId} onClick={() => joinGame(room.roomId)} style={{ cursor: 'pointer' }}>
            <td>{room.metadata?.name}</td>
            <td>{`${room.clients}/${room.maxClients}`}</td>
          </tr>
        ))}
      </tbody>
    </Table>
    {error && <Alert color="danger">{error}</Alert>}
  </Sheet>
}

export const RoomsPage: React.FC<{}> = ({ }) => {
  return <Box sx={{
    width: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: 1
  }} >
    <RoomsList />

    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 1
      }}
    >
      <CreateRoomForm />
      <JoinRoomForm />
    </Box>
  </Box>
}
