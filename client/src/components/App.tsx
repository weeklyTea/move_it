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
import { moveItTheme } from "../theme";
import { StoreProvider } from './StoreProvider';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
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
