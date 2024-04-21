import React from 'react'
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
  Outlet,
  Navigate,
} from "react-router-dom";
import Box from '@mui/joy/Box';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';

import { RoomsPage } from "./RoomsPage";
import { GamePage } from "./GamePage";
// import { MainPage } from "./MainPage";
import { moveItTheme } from "../theme";
import { StoreProvider } from './StoreProvider';

const Root: React.FC = () => {
  return <Box
    sx={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Outlet />
  </Box>
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Root />}>
      {/* <Route index element={<MainPage />} /> */}
      <Route index element={<Navigate to={'/rooms'} />} />
      <Route path="rooms" element={<RoomsPage />} />
      <Route path="rooms/:roomId" element={<GamePage />} />
    </Route>
  )
);

export const App: React.FC = ({ }) => {
  return (
    <CssVarsProvider
      theme={moveItTheme}
      defaultMode="dark"
    >
      <StoreProvider>
        <CssBaseline />
        <RouterProvider router={router} />
      </StoreProvider>
    </CssVarsProvider>
  )
}
