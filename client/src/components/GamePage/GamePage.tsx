import React from 'react'
import { useParams } from "react-router-dom"
import Box from '@mui/joy/Box'

import { game } from "../../core/Game"
import { Renderer } from '../../core/Renderer'
import { UIOverlay } from './UIOverlay'
import { Room } from 'colyseus.js'
import { ConnectMode, useConnectToRoom, useReconnectToken } from '../../utils/hooks'

const GameRenderer: React.FC<{}> = ({ }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const renderer = React.useRef<Renderer>()

  React.useEffect(() => {
    if (canvasRef.current) {
      renderer.current = new Renderer(canvasRef.current, game)
    }
  }, [])

  return <canvas
    ref={canvasRef}
    tabIndex={1000}
    style={{

    }}
    onKeyDown={e => {
      game.sendKeyEvent(e.code as any, 'keydown')
    }}
    onKeyUp={e => {
      game.sendKeyEvent(e.code as any, 'keyup')
    }}
  />
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

  useConnectToRoom(
    roomId,
    reconnectToken,
    onConnect,
    onError,
  )

  // Disconnect when current user leaves the page
  React.useEffect(() => () => {
    game.disconnect()
    setReconnectToken(undefined)
  }, [])

  return <Box >
    {connected && <>
      <UIOverlay />
      <GameRenderer />
    </>}
    {error && <span>{error}</span>}
  </Box>
}
