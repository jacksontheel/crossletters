import {
  AppBar,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Link,
  ListSubheader,
  Paper,
  Popper,
  TextField,
  Typography,
  autocompleteClasses,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Question } from "../models/models";
import { useState } from "react";
import { CommaSeparatedList } from "./commaSeparatedList";
import { createClient } from "@supabase/supabase-js";
import { NavBar } from "./navBar";
import { words } from "../models/words";
import { ListChildComponentProps, VariableSizeList } from "react-window";
import React from "react";

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

  const regex = new RegExp(`^[${Array.from(letters).join("")}]*$`);
  console.log(regex);
  const answerOptions = words.filter((w) => regex.test(w.toUpperCase()));

  const LISTBOX_PADDING = 8; // px

  function renderRow(props: ListChildComponentProps) {
    const { data, index, style } = props;
    const dataSet = data[index];
    const inlineStyle = {
      ...style,
      top: (style.top as number) + LISTBOX_PADDING,
    };

    if (dataSet.hasOwnProperty("group")) {
      return (
        <ListSubheader key={dataSet.key} component="div" style={inlineStyle}>
          {dataSet.group}
        </ListSubheader>
      );
    }

    return (
      <Typography component="li" {...dataSet[0]} noWrap style={inlineStyle}>
        {`#${dataSet[2] + 1} - ${dataSet[1]}`}
      </Typography>
    );
  }

  const OuterElementContext = React.createContext({});

  const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
    const outerProps = React.useContext(OuterElementContext);
    return <div ref={ref} {...props} {...outerProps} />;
  });

  function useResetCache(data: any) {
    const ref = React.useRef<VariableSizeList>(null);
    React.useEffect(() => {
      if (ref.current != null) {
        ref.current.resetAfterIndex(0, true);
      }
    }, [data]);
    return ref;
  }

  // Adapter for react-window
  const ListboxComponent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLElement>
  >(function ListboxComponent(props, ref) {
    const { children, ...other } = props;
    const itemData: React.ReactElement[] = [];
    (children as React.ReactElement[]).forEach(
      (item: React.ReactElement & { children?: React.ReactElement[] }) => {
        itemData.push(item);
        itemData.push(...(item.children || []));
      },
    );

    const theme = useTheme();
    const smUp = useMediaQuery(theme.breakpoints.up("sm"), {
      noSsr: true,
    });
    const itemCount = itemData.length;
    const itemSize = smUp ? 36 : 48;

    const getChildSize = (child: React.ReactElement) => {
      if (child.hasOwnProperty("group")) {
        return 48;
      }

      return itemSize;
    };

    const getHeight = () => {
      if (itemCount > 8) {
        return 8 * itemSize;
      }
      return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
    };

    const gridRef = useResetCache(itemCount);

    return (
      <div ref={ref}>
        <OuterElementContext.Provider value={other}>
          <VariableSizeList
            itemData={itemData}
            height={getHeight() + 2 * LISTBOX_PADDING}
            width="100%"
            ref={gridRef}
            outerElementType={OuterElementType}
            innerElementType="ul"
            itemSize={(index: number) => getChildSize(itemData[index])}
            overscanCount={5}
            itemCount={itemCount}
          >
            {renderRow}
          </VariableSizeList>
        </OuterElementContext.Provider>
      </div>
    );
  });

  const StyledPopper = styled(Popper)({
    [`& .${autocompleteClasses.listbox}`]: {
      boxSizing: "border-box",
      "& ul": {
        padding: 0,
        margin: 0,
      },
    },
  });

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
      error = error || !s.has(l.toUpperCase());
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
      height: "100vh",
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
    cardInput: {
      margin: "10px 0px",
    },
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
                style={styles.cardInput}
                label="Hint"
                variant="outlined"
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
              <Autocomplete
                style={styles.cardInput}
                freeSolo
                disableListWrap
                PopperComponent={StyledPopper}
                ListboxComponent={ListboxComponent}
                options={answerOptions}
                groupBy={(option) => option[0].toUpperCase()}
                onChange={(_, v) => {
                  setQuestions(
                    questions.map((q, j) => {
                      if (i == j) {
                        return {
                          hint: q.hint,
                          answer: v ?? "",
                          correct: !getError(v ?? "", letters),
                        };
                      } else {
                        return q;
                      }
                    }),
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
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
                )}
                renderOption={(props, option, state) =>
                  [props, option, state.index] as React.ReactNode
                }
                renderGroup={(params) => params as any}
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
            <Link href={"https://jacksontheel.com/crossletters/" + link}>
              {"jacksontheel.com/crossletters/" + link}
            </Link>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              navigator.clipboard.writeText(
                "https://jacksontheel.com/crossletters/" + link,
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
