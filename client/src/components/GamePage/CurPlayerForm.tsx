import React from 'react'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import Input from '@mui/joy/Input'
import Button from '@mui/joy/Button'
import RadioGroup, { RadioGroupProps } from '@mui/joy/RadioGroup'
import Radio, { radioClasses } from '@mui/joy/Radio'

import { game } from "../../core/Game"
import { FormContainer } from '../RoomsPage/forms'
import { ColorCircle } from './ColorCircle'
import { PlayerInfo, sHooks } from '../../store'

const colors = ['#0b6bcb', '#c41c1c', '#1f7a1f', '#9a5b13']
const ColorSelect: React.FC<{ disabled?: boolean } & RadioGroupProps> = ({ disabled, ...props }) => {
  return <RadioGroup
    {...props}
    sx={{
      gap: 1,
      flexDirection: 'row',
      alignItems: 'center',
      height: '32px',
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

  return <Button
    type="submit"
    variant="solid"
    size="md"
    // disabled={!allReady || playersIds.length < 2 || gameIsInProgress}
    onClick={() => game.start()}
  >
    Start
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

  return <FormContainer sx={{ flexDirection: 'row', alignItems: 'end' }}>
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

    {!isOwner && <ReadyButton disabled={!name || curPlayer?.ready || gameIsInProgress} />}
    {isOwner && <StartButton />}

  </FormContainer>
}