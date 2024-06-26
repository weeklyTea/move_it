import React from 'react'
import { useParams } from "react-router-dom"
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'

import { game } from "../../core/Game"
import { Renderer } from '../../core/Renderer'
import { UIOverlay } from './UIOverlay'
import { Room } from 'colyseus.js'
import { ConnectMode, useConnectToRoom, useReconnectToken } from '../../utils/hooks'

const height = 420
const width = height * 16 / 9
const GameRenderer: React.FC<{}> = ({ }) => {
  const canvasRef = React.useRef<HTMLDivElement>(null)
  const renderer = React.useRef<Renderer>()

  const onKeyDown = React.useCallback((e: KeyboardEvent) => game.sendKeyEvent(e.code as any, 'keydown'), [])
  const onKeyUp = React.useCallback((e: KeyboardEvent) => game.sendKeyEvent(e.code as any, 'keyup'), [])

  React.useEffect(() => {
    if (canvasRef.current) {
      renderer.current = new Renderer(canvasRef.current, game, game.getState(), width, height)
      document.addEventListener('keydown', onKeyDown)
      document.addEventListener('keyup', onKeyUp)
    }

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  return <Box
    ref={canvasRef}
    sx={{
      width: `${width}px`,
      height: `${height}px`,
    }}
  />
}

const Controls: React.FC<{}> = ({ }) => {
  return <Typography>
    Movement: <Typography color="primary">&larr; &rarr; &uarr;&darr; </Typography>
    <br />
    Flipping: <Typography color="primary">Space</Typography>
  </Typography>
}

export const GamePage: React.FC<{}> = ({ }) => {
  const [error, setError] = React.useState<string>()
  const [connected, setConnected] = React.useState(false)
  const { roomId } = useParams()
  const [reconnectToken, setReconnectToken] = useReconnectToken()

  const onConnect = React.useCallback((room: Room<any>) => {
    setConnected(true)
    setError(undefined)
    setReconnectToken(room.reconnectionToken)
  }, [])

  const onError = React.useCallback((err: unknown, mode: ConnectMode) => {
    if (mode === 'reconnect') {
      setReconnectToken(undefined)
    } else {
      console.error(err)
      setError('Unable to connect to the room. Try to reload the page or create a new room.')
      setConnected(false)
    }
  }, [])

  useConnectToRoom(roomId, reconnectToken, onConnect, onError,)

  // Disconnect when current user leaves the page
  React.useEffect(() => () => {
    game.disconnect()
    setReconnectToken(undefined)
  }, [])

  return <Box
    sx={{
      height: '100%',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
    }}
  >
    {connected && (
      <Box
        sx={{
          height: '100%',
          alignItems: 'center',
          justifyContent: 'flex-start',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <UIOverlay />
        <GameRenderer />
        <Controls />
      </Box>)
    }
    {error && <span>{error}</span>}
  </Box>
}
