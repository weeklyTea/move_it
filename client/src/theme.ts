import { extendTheme } from '@mui/joy/styles';

export const moveItTheme = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        background: {
          body: '#242424'
        },
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717"
        }
      }
    }
  },
  focus: {
    default: {
      outlineWidth: '3px',
    },
  },
  fontFamily: {
    body: 'SF Pro Text, var(--gh-fontFamily-fallback)',
  },
  components: {
    JoyButton: {
      styleOverrides: {
        root: ({ ownerState, }) => ({
          borderRadius: '8px',
          border: '1px solid transparent',
          // padding: '0.6em 1.2em',
          // fontSize: '1em',
          fontWeight: '500',
          fontFamily: 'inherit',
          backgroundColor: '#1a1a1a',
          cursor: 'pointer',
          transition: 'border-color 0.25s',
          '&:active': {
            boxShadow: 'inset 0px 1px 0px rgba(20, 70, 32, 0.2)',
          },
          '&:hover': {
            borderColor: '#646cff',
            backgroundColor: '#1a1a1a',
          },
          '&:focus, &focus-visible': {
            outline: '4px auto -webkit-focus-ring-color',
          }
        }),
      },
    },
    JoyInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: 'rgb(59, 59, 59)',
          borderColor: theme.palette.neutral[500],
        })
      }
    },
    JoySheet: {
      defaultProps: {
        variant: 'outlined',
        // sx: {
        //   p: 1
        // }
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.radius.sm,
          padding: theme.spacing(1)
        })
      }
    }
  },
});
