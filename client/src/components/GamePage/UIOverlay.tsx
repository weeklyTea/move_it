import React from 'react'
import Box from '@mui/joy/Box'
import List from '@mui/joy/List'
import ListItem from '@mui/joy/ListItem'
import ListItemDecorator from '@mui/joy/ListItemDecorator'
import ListItemContent from '@mui/joy/ListItemContent'
import Typography from '@mui/joy/Typography'
import Sheet from '@mui/joy/Sheet'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/joy/Button'
import { useAtomValue } from 'jotai'
import { useNavigate } from 'react-router-dom'
import Modal from '@mui/joy/Modal'
import ModalDialog from '@mui/joy/ModalDialog'
import Link from '@mui/joy/Link'

import { atoms, sHooks } from '../../store'
import { ColorCircle } from './ColorCircle'
import { CurPlayerForm } from './CurPlayerForm'
import { game } from '../../core/Game'

const ReadyIcon: React.FC<{ isReady: boolean }> = ({ isReady }) => {
  return isReady ? <CheckBoxIcon color="success" /> : <CheckBoxOutlineBlankIcon />
}

const PlayerRow: React.FC<{ pId: string }> = ({ pId }) => {
  const playerInfo = sHooks.usePlayerInfo(pId)
  const curPlayer = sHooks.useCurPlayer()
  const isOwner = sHooks.useIsRoomOwner(pId || '')

  const connected = playerInfo && playerInfo.connected

  return <ListItem>
    <ListItemDecorator>
      {playerInfo && <ColorCircle color={playerInfo.color} />}
    </ListItemDecorator>
    <ListItemContent>
      <Typography level={connected ? 'title-sm' : 'body-sm'} noWrap>{`${pId === curPlayer?.id ? '🤘' : ''} ${playerInfo?.name}`}</Typography>
    </ListItemContent>
    {isOwner && <>👑</>}
    {!isOwner && connected && <ReadyIcon isReady={Boolean(playerInfo?.ready)} />}
    {!connected && <CloudOffIcon />}
  </ListItem>
}

const PlayersList: React.FC = () => {
  const playersIds = sHooks.usePlayersIds()

  return <Sheet sx={{ height: '170px' }}>
    <List>
      {playersIds.map(pId => (
        <PlayerRow key={pId} pId={pId} />
      ))}
    </List>
  </Sheet>
}

const CountDown: React.FC = () => {
  const [x, setX] = React.useState(3)

  React.useEffect(() => {
    const interval = setInterval(() => setX(prev => prev - 1), 1000)

    return () => { clearInterval(interval) }
  }, [])

  return <Typography level="title-lg">{x}</Typography>
}

const Winner: React.FC = () => {
  const winner = sHooks.useWinner()

  return <Typography level="body-lg">
    <Typography level="body-lg" sx={{ color: winner.color, fontWeight: 'bold' }}>{winner.name}</Typography> has won the game!
  </Typography>
}

const GameStatus: React.FC<{}> = ({ }) => {
  const gameStatus = useAtomValue(atoms.gameStatus)
  if (gameStatus === 'waiting_players') return <Typography level="body-xs">Waiting for the players...</Typography>
  if (gameStatus === 'counting_down') return <CountDown />
  if (gameStatus === 'playing') return <Typography level="body-xs" color="success">Move it!</Typography>
  if (gameStatus === 'game_finished') return <Winner />

  return null
}

export const UIOverlay: React.FC = () => {
  const curPlayerInfo = sHooks.useCurPlayer()
  const navigate = useNavigate()

  const [disconnected, setDisconnected] = React.useState(false)

  React.useEffect(() => {
    const listener = () => setDisconnected(true)
    game.addEventListener('onDisconnect', listener)

    return () => game.removeEventListener('onDisconnect', listener)
  }, [])

  return <Box sx={{ position: 'absolute', width: '400px', top: '10px' }}>
    <Box>
      <Button startDecorator={<ArrowBackIcon />} onClick={() => navigate('/rooms/')} size="sm" >Exit room</Button>
    </Box>
    <PlayersList />
    {curPlayerInfo && <CurPlayerForm curPlayer={curPlayerInfo} />}
    <Box sx={{ display: 'flex', justifyContent: 'center', }}>
      <GameStatus />
    </Box>

    <Modal open={disconnected}>
      <ModalDialog size="lg">
        <Typography id="modal-desc" textColor="text.tertiary">
          You are disconnected from the server. <Link href="/rooms/">Go back to lobbies</Link>
        </Typography>
      </ModalDialog>
    </Modal>
  </Box>
}
