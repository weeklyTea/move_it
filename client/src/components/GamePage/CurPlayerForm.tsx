import React from 'react'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import Input from '@mui/joy/Input'
import Button from '@mui/joy/Button'
import RadioGroup, { RadioGroupProps } from '@mui/joy/RadioGroup'
import Radio, { radioClasses } from '@mui/joy/Radio'
import Box from '@mui/joy/Box'

import { game } from "../../core/Game"
import { FormContainer } from '../RoomsPage/forms'
import { ColorCircle } from './ColorCircle'
import { PlayerInfo, atoms, sHooks } from '../../store'
import { useAtomValue } from 'jotai'

const colors = ['#0b6bcb', '#c38f19', '#1f7a1f', '#8d441a', '#6d4c41', '#546e7a', '#6d4b8b', '#00796b']
const ColorSelect: React.FC<{ disabled?: boolean } & RadioGroupProps> = ({ disabled, ...props }) => {
  return <RadioGroup
    {...props}
    sx={{
      gap: 1,
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      m: 0,
      ...props?.sx
    }}
  >
    {colors.map((color) => (
      <ColorCircle
        color={color}
        key={color}
        sx={{
          position: 'relative',
          width: 20,
          height: 20,
          flexShrink: 0,
          bgcolor: color,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          [`& .${radioClasses.checked}`]: {
            [`& .${radioClasses.label}`]: {
              fontWeight: 'lg',
            },
            [`& .${radioClasses.action}`]: {
              '--variant-borderWidth': '2px',
              borderColor: 'text.secondary',
            },
          },

          [`& .${radioClasses.action}:active`]: {
            bgcolor: color,
          },
          [`& .${radioClasses.action}:hover`]: {
            bgcolor: color,
            borderColor: 'text.secondary',
          }
        }}
      >
        <Radio color="neutral" overlay disableIcon value={color} label="" disabled={disabled} />
      </ColorCircle>
    ),
    )}
  </RadioGroup>
}

const StartButton: React.FC = () => {
  const allReady = sHooks.useEveryoneIsReady()
  const playersIds = sHooks.usePlayersIds()
  const gameIsInProgress = sHooks.useGameIsInProgress()
  const gameStatus = useAtomValue(atoms.gameStatus)

  return <Button
    type="submit"
    variant="solid"
    size="md"
    disabled={/* !allReady || */ playersIds.length < 2 || gameIsInProgress}
    onClick={() => game.start()}
  >
    {gameStatus === 'game_finished' ? 'Play again' : 'Start'}
  </Button>
}

const ReadyButton: React.FC<{ disabled?: boolean }> = ({ disabled }) => {
  return <Button
    type="submit"
    variant="solid"
    size="md"
    disabled={disabled}
    onClick={() => game.setPlayerReady()}
  >
    Ready
  </Button>
}


const updateNameRate = 500
export const CurPlayerForm: React.FC<{ curPlayer: PlayerInfo }> = ({ curPlayer }) => {
  const [name, setName] = React.useState(curPlayer.name)
  const [color, setColor] = React.useState(curPlayer.color)

  const isReady = curPlayer.ready
  const isOwner = sHooks.useIsRoomOwner(curPlayer.id)
  const gameIsInProgress = sHooks.useGameIsInProgress()

  React.useEffect(() => {
    const timer = setTimeout(() => {
      game.setPlayerName(name)
    }, updateNameRate)

    return () => clearTimeout(timer)
  }, [name])

  const changeColor = React.useCallback((clr: string) => {
    game.setPlayerColor(clr)
    setColor(clr)
  }, [])

  return <FormContainer sx={{ flexDirection: 'row', alignItems: 'start' }}>
    <FormControl>
      <FormLabel>
        Name:
      </FormLabel>
      {/* @ts-ignore */}
      <Input
        size="sm"
        value={name}
        disabled={isReady || gameIsInProgress}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
      />
    </FormControl >

    <FormControl>
      <FormLabel>
        Color:
      </FormLabel>
      <ColorSelect
        value={color}
        disabled={isReady || gameIsInProgress}
        onChange={e => changeColor(e.target.value)}
      />
    </FormControl>

    <Box sx={{ alignSelf: 'center' }}>
      {!isOwner && <ReadyButton disabled={!name || curPlayer?.ready || gameIsInProgress} />}
      {isOwner && <StartButton />}
    </Box>

  </FormContainer>
}