import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
} from "@mui/material";
import { CharacterButton } from "./characterButton";
import { useEffect, useState } from "react";
import CharacterBox from "./characterBox";
import { puzzles } from "../models/puzzle";
import InfoIcon from "@mui/icons-material/Info";
import { useParams } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Puzzle } from "../models/models";

const supabase = createClient(
  "https://dhhhpggijxgbjejwfuja.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoaGhwZ2dpanhnYmplandmdWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDA2MDA3MDAsImV4cCI6MjAxNjE3NjcwMH0.p1UyessEKSCrCAxq6d5se8YSN87VFk6WwYf9AS9-gls",
);

export interface GameProps {}

export function Game(props: GameProps) {
  let [activeQuestion, setActiveQuestion] = useState(0);
  let [guess, setGuess] = useState("");
  let [dialogActive, setDialogActive] = useState(false);
  let [puzzle, setPuzzle] = useState<Puzzle>();
  let [progress, setProgress] = useState(0);
  let { code } = useParams();

  let loadPuzzle = async () => {
    const { data } = await supabase.from("puzzles").select().eq("code", code);

    if (data != null && data.length > 0) {
      setPuzzle((data[0] as any).data as Puzzle);
    } else {
      setPuzzle(puzzles[0]);
    }
  };

  useEffect(() => {
    loadPuzzle();
  }, []);

  let changeActiveQuestion = (increment: number) => {
    if (puzzle == null) {
      return;
    }

    let newActiveQuestion =
      (activeQuestion +
        (increment % puzzle.questions.length) +
        puzzle.questions.length) %
      puzzle.questions.length;
    setActiveQuestion(newActiveQuestion);

    if (puzzle.questions[newActiveQuestion].correct ?? false) {
      setGuess(puzzle.questions[newActiveQuestion].answer.toUpperCase());
    } else {
      setGuess("");
    }
  };

  let changeGuess = (add: string) => {
    if (
      puzzle != null &&
      guess.length < puzzle.questions[activeQuestion].answer.length
    ) {
      let newGuess = guess.concat(add);
      setGuess(newGuess);
      if (
        puzzle != null &&
        newGuess.toUpperCase() ===
          puzzle.questions[activeQuestion].answer.toUpperCase()
      ) {
        puzzle.questions[activeQuestion].correct = true;
        let newProgress = progress + 1;
        setProgress(newProgress);
        if (newProgress == puzzle.questions.length) {
          setDialogActive(true);
        }
      }
    }
  };

  const styles = {
    root: {
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      justifyContent: "space-between",
    } as const,
    box: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    } as const,
    hint: {
      textAlign: "center",
      width: "80vh",
    } as const,
  };

  return (
    <Paper style={styles.root}>
      <AppBar position="sticky" style={styles.box}>
        <h1>Crossletters</h1>
      </AppBar>
      {puzzle != null && (
        <Box style={styles.root}>
          <Box style={styles.box}>
            <Button onClick={() => changeActiveQuestion(-1)}>
              <h1>&lt;</h1>
            </Button>
            <h1 style={styles.hint}>
              {activeQuestion + 1}. {puzzle.questions[activeQuestion].hint}
            </h1>
            <Button onClick={() => changeActiveQuestion(1)}>
              <h1>&gt;</h1>
            </Button>
          </Box>
          <Box style={styles.box}>
            <Paper elevation={0} style={styles.box}>
              {Array.from(puzzle.questions[activeQuestion].answer).map(
                (_, i) => (
                  <CharacterBox
                    character={guess.at(i) ?? ""}
                    size={puzzle!.questions[activeQuestion].answer.length}
                    correct={puzzle!.questions[activeQuestion].correct ?? false}
                  />
                ),
              )}
            </Paper>
          </Box>
          <div id="adsf">
            <Box style={styles.box}>
              {puzzle.letters.slice(0, 4).map((l) => (
                <CharacterButton
                  character={l.toUpperCase()}
                  onClick={() => changeGuess(l.toUpperCase())}
                  correct={puzzle!.questions[activeQuestion].correct ?? false}
                />
              ))}
            </Box>
            <Box style={styles.box}>
              {puzzle.letters.slice(4, 7).map((l) => (
                <CharacterButton
                  character={l.toUpperCase()}
                  onClick={() => changeGuess(l.toUpperCase())}
                  correct={puzzle!.questions[activeQuestion].correct ?? false}
                />
              ))}
              <CharacterButton
                character="&lt;"
                onClick={() => {
                  setGuess(guess.substring(0, guess.length - 1));
                }}
                correct={puzzle.questions[activeQuestion].correct ?? false}
              />
            </Box>
          </div>
          <Dialog
            open={dialogActive}
            keepMounted
            aria-describedby="alert-dialog-slide-description"
          >
            <DialogTitle>Crossletters</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Thanks for playing the demo! If you have the time, please fill
                out the{" "}
                <a href="https://forms.gle/rHrUZkNXFcaqDwY87">following form</a>{" "}
                with your feedback. You were sent the demo because your input
                would mean a lot to me.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogActive(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Paper>
  );
}
