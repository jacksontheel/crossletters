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

function App() {
  return (
    <BrowserRouter basename="/words">
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="/:code" element={<Game />} />
        <Route path="/create" element={<GameBuilder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
