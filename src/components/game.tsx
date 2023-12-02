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
import { act } from "react-dom/test-utils";

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
  let [availableHints, setAvailableHints] = useState(0);
  let [puzzleName, setPuzzleName] = useState("");
  let { code } = useParams();

  useEffect(() => {
    let loadPuzzle = async () => {
      const { data } = await supabase.from("puzzles").select().eq("code", code);

      if (data != null && data.length > 0) {
        setPuzzle((data[0] as any).data as Puzzle);
        setPuzzleName(`Custom Crossletters ${code}`);
      } else {
        let puzzleNumber = getDaysSinceStart() % puzzles.length;
        setPuzzle(puzzles[puzzleNumber]);
        setPuzzleName(`Crossletters Day ${puzzleNumber + 1}`);
      }
    };

    loadPuzzle();
  }, [code]);

  let getDaysSinceStart = () => {
    let date1 = new Date("12/02/2023");
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
      setGuess(
        puzzle.questions[newActiveQuestion].answer
          .toUpperCase()
          .slice(0, puzzle.questions[newActiveQuestion].revealed ?? 0),
      );
    }
  };

  let changeGuess = (g: string) => {
    if (puzzle != null) {
      setGuess(g);
      if (
        puzzle != null &&
        g.toUpperCase() ===
          puzzle.questions[activeQuestion].answer.toUpperCase()
      ) {
        puzzle.questions[activeQuestion].correct = true;
        let newProgress = progress + 1;
        setProgress(newProgress);
        if (newProgress === puzzle.questions.length) {
          setDialogActive(true);
        }
        if (newProgress % 3 == 0) {
          setAvailableHints(availableHints + 1);
        }
      }
    }
  };

  let addToGuess = (add: string) => {
    if (
      puzzle != null &&
      guess.length < puzzle.questions[activeQuestion].answer.length
    ) {
      changeGuess(guess.concat(add));
    }
  };

  let getHint = () => {
    if (
      puzzle != null &&
      !(puzzle.questions[activeQuestion].correct ?? false)
    ) {
      if (puzzle.questions[activeQuestion].revealed == null) {
        puzzle.questions[activeQuestion].revealed = 1;
      } else {
        puzzle.questions[activeQuestion].revealed! += 1;
      }
      changeGuess(
        puzzle.questions[activeQuestion].answer
          .slice(0, puzzle.questions[activeQuestion].revealed)
          .toUpperCase(),
      );
      setAvailableHints(availableHints - 1);
    }
  };

  let scoreLines = () => {
    return [
      `Completed ${progress} out of ${puzzle?.questions.length} questions`,
      scoreBlocks(),
    ];
  };

  let scoreBlocks = () => {
    if (puzzle != null) {
      return puzzle.questions
        .map((q) => (q.correct ? ((q.revealed ?? 0) > 0 ? "🟨" : "🟩") : "⬛"))
        .join(" ");
    }
    return "";
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
          {availableHints > 0 &&
            !(puzzle!.questions[activeQuestion].correct ?? false) && (
              <Box style={styles.box}>
                <Button onClick={() => getHint()}>
                  <p>Get hint (available: {availableHints})</p>
                </Button>
              </Box>
            )}
          <Box style={styles.box}>
            <Paper elevation={0} style={styles.box}>
              {Array.from(puzzle.questions[activeQuestion].answer).map(
                (_, i) => (
                  <CharacterBox
                    character={guess.at(i) ?? ""}
                    size={puzzle!.questions[activeQuestion].answer.length}
                    usedHint={
                      (puzzle!.questions[activeQuestion].revealed ?? 0) > i
                    }
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
                  onClick={() => addToGuess(l.toUpperCase())}
                  correct={puzzle!.questions[activeQuestion].correct ?? false}
                />
              ))}
            </Box>
            <Box style={styles.box}>
              {puzzle.letters.slice(4, 7).map((l) => (
                <CharacterButton
                  character={l.toUpperCase()}
                  onClick={() => addToGuess(l.toUpperCase())}
                  correct={puzzle!.questions[activeQuestion].correct ?? false}
                />
              ))}
              <CharacterButton
                character="&lt;"
                onClick={() => {
                  if (
                    puzzle != null &&
                    guess.length >
                      (puzzle.questions[activeQuestion].revealed ?? 0)
                  ) {
                    setGuess(guess.substring(0, guess.length - 1));
                  }
                }}
                correct={puzzle.questions[activeQuestion].correct ?? false}
              />
            </Box>
          </div>
          <Dialog open={dialogActive} keepMounted>
            <DialogTitle>{puzzleName}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {scoreLines().map((l) => (
                  <p>{l}</p>
                ))}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  if (puzzle != null) {
                    navigator.clipboard.writeText(
                      `${puzzleName}\n${scoreLines().join("\n")}`,
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
