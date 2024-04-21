import React from 'react'
import Sheet, { SheetProps } from '@mui/joy/Sheet'

export const ColorCircle: React.FC<Omit<SheetProps, 'color'> & { color: string }> = ({ color, ...rest }) => {
  return <Sheet
    sx={{
      width: 20,
      height: 20,
      flexShrink: 0,
      bgcolor: color,
      borderRadius: '50%',
    }}
    {...rest}
  />
}
