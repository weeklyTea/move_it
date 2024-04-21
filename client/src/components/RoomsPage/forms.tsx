import Sheet, { SheetProps } from "@mui/joy/Sheet";
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { game } from '../../core/Game'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import Input from '@mui/joy/Input';
import Checkbox from '@mui/joy/Checkbox'
import Button from '@mui/joy/Button'

export const FormContainer: React.FC<SheetProps> = ({ ...props }) => {
  return <Sheet
    component="form"
    onSubmit={(event: React.FormEvent) => event.preventDefault()}
    {...props}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      ...props.sx,
    }} />
}

export const CreateRoomForm: React.FC<{}> = ({ }) => {
  const [roomName, setRoomName] = React.useState('')
  const [maxPlayers, setMaxPlayers] = React.useState(4)
  const [priv, setPriv] = React.useState(false)

  const navigate = useNavigate()

  const onCreate = React.useCallback(() => {
    game.createRoom(roomName, maxPlayers, priv).then(room => {
      navigate(`/rooms/${room.id}`)
    })
  }, [roomName, maxPlayers, priv])

  return <FormContainer>
    Create Room
    <FormControl>
      <FormLabel>
        Room name:
      </FormLabel>
      {/* @ts-ignore */}
      <Input
        size="sm"
        value={roomName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomName(e.target.value)}
      />
    </FormControl >

    <FormControl>
      <Checkbox
        label="Private"
        variant="solid"
        defaultChecked={priv}
        onChange={() => setPriv(x => !x)}
      />
    </FormControl>

    <Button type="submit" variant="solid" onClick={() => onCreate()}>Create</Button>
  </FormContainer>
}

export const JoinRoomForm: React.FC<{}> = ({ }) => {
  const [roomId, setRoomId] = React.useState('')

  const navigate = useNavigate()
  const onJoin = React.useCallback(() => {
    navigate(`/rooms/${roomId}`)
  }, [roomId])

  return <FormContainer>
    Join room
    <FormControl>
      <FormLabel>
        Room tag:
      </FormLabel>
      {/* @ts-ignore */}
      <Input
        size="sm"
        value={roomId}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomId(e.target.value)}
      />
    </FormControl>

    <Button onClick={onJoin}>Join</Button>
  </FormContainer>
}

