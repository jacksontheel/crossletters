import {
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
import { CharacterButton } from "./characterButton";
import { useEffect, useState } from "react";
import CharacterBox from "./characterBox";
import { puzzles } from "../models/puzzle";
import { useParams } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Puzzle } from "../models/models";
import { NavBar } from "./navBar";
import BarChartIcon from "@mui/icons-material/BarChart";

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

  useEffect(() => {
    let loadPuzzle = async () => {
      const { data } = await supabase.from("puzzles").select().eq("code", code);

      if (data != null && data.length > 0) {
        setPuzzle((data[0] as any).data as Puzzle);
      } else {
        setPuzzle(puzzles[getDaysSinceStart() % puzzles.length]);
      }
    };

    loadPuzzle();
  }, [code]);

  let getDaysSinceStart = () => {
    let date1 = new Date("11/24/2023");
    let date2 = new Date();

    let Difference_In_Time = date2.getTime() - date1.getTime();

    return Math.floor(Difference_In_Time / (1000 * 3600 * 24));
  };

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
        if (newProgress === puzzle.questions.length) {
          setDialogActive(true);
        }
      }
    }
  };

  const styles = {
    root: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
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
      <NavBar
        elements={[
          <IconButton onClick={() => setDialogActive(true)}>
            <BarChartIcon />
          </IconButton>,
        ]}
      />
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
          <div>
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
                <p>
                  You've completed {progress} questions out of{" "}
                  {puzzle.questions.length}
                </p>
                <p>
                  {puzzle.questions.map((q) => (q.correct ? " 🟢 " : " ⚫ "))}
                </p>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  if (puzzle != null) {
                    navigator.clipboard.writeText(
                      "Crossletters " +
                        puzzle.questions
                          .map((q) => (q.correct ? " 🟢 " : " ⚫ "))
                          .join(""),
                    );
                  }
                }}
              >
                Copy score
              </Button>
              <Button onClick={() => setDialogActive(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Paper>
  );
}
