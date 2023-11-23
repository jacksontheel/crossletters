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
  Link,
  Paper,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Question } from "../models/models";
import { useState } from "react";
import { CommaSeparatedList } from "./commaSeparatedList";
import { createClient } from "@supabase/supabase-js";
import { NavBar } from "./navBar";

const supabase = createClient(
  "https://dhhhpggijxgbjejwfuja.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoaGhwZ2dpanhnYmplandmdWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDA2MDA3MDAsImV4cCI6MjAxNjE3NjcwMH0.p1UyessEKSCrCAxq6d5se8YSN87VFk6WwYf9AS9-gls",
);

export interface GameBuilderProps {}

export function GameBuilder(props: GameBuilderProps) {
  let [letters, setLetters] = useState(new Set<string>());
  let [questions, setQuestions] = useState<Question[]>([
    { hint: "", answer: "", correct: true },
  ]);
  let [link, setLink] = useState("");
  let [finished, setFinished] = useState(false);

  let addQuestion = () => {
    setQuestions(
      questions.concat({
        hint: "",
        answer: "",
        correct: true,
      }),
    );
  };

  let changeLetters = (s: Set<string>) => {
    setLetters(s);
    setErrors(s);
  };

  let setErrors = (s: Set<string>) => {
    setQuestions(
      questions.map((q) => {
        q.correct = !getError(q.answer, s);
        return q;
      }),
    );
  };

  let getError = (answer: string, s: Set<string>) => {
    let error = false;
    answer.split("").forEach((l) => {
      error = error || !s.has(l);
    });
    return error;
  };

  let hintHelperText = (question: Question) => {
    if (question.hint.length < 1 || question.hint.length > 64) {
      return "Hint must be between 1 and 64 characters";
    } else {
      return "";
    }
  };

  let answerHelperText = (question: Question) => {
    if (!question.correct) {
      return "Answer contains letters not in allowed list";
    } else if (question.answer.length < 1 || question.answer.length > 64) {
      return "Answer must be between 1 and 64 characters";
    } else {
      return "";
    }
  };

  let validPuzzle = () => {
    if (letters.size < 1 || letters.size > 7) {
      return false;
    }
    let valid = true;
    questions.forEach((q) => {
      valid = valid && hintHelperText(q) === "" && answerHelperText(q) === "";
    });
    return valid;
  };

  let generateCode = (length: number) => {
    let result = "";
    const characters = "abcdefghijklmnopqrstuvwxyz";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  };

  const styles = {
    root: {
      minHeight: "100vh",
    },
    box: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    } as const,
    card: {
      display: "flex",
      flexDirection: "column",
      margin: "10px",
      padding: "12px",
      minWidth: "70vw",
      maxWidth: "500px",
    } as const,
    cardNumber: {
      display: "inline",
      margin: "10px",
    },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
    } as const,
  };

  return (
    <Paper style={styles.root}>
      <NavBar />
      <h1 style={styles.box}>Letters</h1>
      <Box style={styles.box}>
        <Paper elevation={3} style={styles.card}>
          <p>
            Enter the letters that each of your answers will be made from.
            Maximum of 7
          </p>
          <CommaSeparatedList
            letterSet={letters}
            setLetterSet={changeLetters}
          />
        </Paper>
      </Box>
      <h1 style={styles.box}>Questions</h1>
      {questions.map((q, i) => {
        return (
          <Box style={styles.box}>
            <Paper elevation={3} style={styles.card}>
              <Box style={styles.cardHeader}>
                <p style={styles.cardNumber}>{i + 1}.</p>
                {questions.length > 1 && (
                  <IconButton
                    aria-label="delete"
                    onClick={() => {
                      setQuestions(questions.filter((_, j) => j !== i));
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
              <TextField
                label="Hint"
                variant="outlined"
                fullWidth
                value={q.hint}
                onChange={(e) => {
                  setQuestions(
                    questions.map((q, j) => {
                      if (i == j) {
                        return {
                          hint: e.target.value,
                          answer: q.answer,
                          correct: q.correct,
                        };
                      } else {
                        return q;
                      }
                    }),
                  );
                }}
                error={hintHelperText(q) !== ""}
                helperText={hintHelperText(q)}
              />
              <TextField
                id="outlined-basic"
                label="Answer"
                variant="outlined"
                fullWidth
                value={q.answer}
                onChange={(e) => {
                  setQuestions(
                    questions.map((q, j) => {
                      if (i == j) {
                        return {
                          hint: q.hint,
                          answer: e.target.value,
                          correct: !getError(e.target.value, letters),
                        };
                      } else {
                        return q;
                      }
                    }),
                  );
                }}
                error={answerHelperText(q) !== ""}
                helperText={answerHelperText(q)}
              />
            </Paper>
          </Box>
        );
      })}
      <Box style={styles.box}>
        <Button variant="contained" onClick={addQuestion}>
          Add Question
        </Button>
        <Button
          variant="contained"
          disabled={!validPuzzle()}
          onClick={async () => {
            let newLink = generateCode(6);
            setLink(newLink);

            const { error } = await supabase.from("puzzles").insert({
              data: {
                letters: Array.from(letters),
                questions: questions.map((q) => {
                  return {
                    hint: q.hint,
                    answer: q.answer,
                  };
                }),
              },
              code: newLink,
            });

            setFinished(true);
          }}
        >
          Create Puzzle
        </Button>
      </Box>
      <Dialog
        open={finished}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Puzzle Created!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <p>
              Your puzzle has been created and can be shared with this link:
            </p>
            <Link href={"https://jacksontheel.com/words/" + link}>
              {"jacksontheel.com/words/" + link}
            </Link>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              navigator.clipboard.writeText(
                "https://jacksontheel.com/words/" + link,
              )
            }
          >
            Copy link
          </Button>
          <Button onClick={() => setFinished(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
