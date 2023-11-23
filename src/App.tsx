import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { CharacterButton } from "./components/characterButton";
import { Puzzle } from "./models/models";
import { useState } from "react";
import CharacterBox from "./components/characterBox";
import { puzzles } from "./models/puzzle";
import InfoIcon from "@mui/icons-material/Info";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Game } from "./components/game";
import { GameBuilder } from "./components/gameBuilder";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <BrowserRouter basename="/words">
        <Routes>
          <Route path="/" element={<Game />} />
          <Route path="/:code" element={<Game />} />
          <Route path="/create" element={<GameBuilder />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
