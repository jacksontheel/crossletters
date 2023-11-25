import { Chip, TextField } from "@mui/material";
import * as React from "react";
import { ChangeEvent, useState } from "react";

export interface CommaSeparatedListProps {
  letterSet: Set<string>;
  setLetterSet: (s: Set<string>) => void;
}

export function CommaSeparatedList(props: CommaSeparatedListProps) {
  const styles = {
    input: {
      width: "100%",
    },
    chipBox: {
      width: "100%",
      overflow: "scroll",
      border: "1px solid black",
      borderRadius: "10px",
    } as const,
  };

  const [input, setInput] = useState("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    let letterSet = new Set<string>();
    e.target.value.split("").forEach((v) => {
      if (v.match(/[a-z]/i)) {
        letterSet.add(v.toUpperCase());
      }
    });
    props.setLetterSet(letterSet);
  };

  const itemDelete = (label: string) => {
    const newSet = props.letterSet;
    newSet.delete(label);
    setInput(Array.from(newSet).join(""));
    props.setLetterSet(newSet);
  };

  const listItems = Array.from(props.letterSet).map((item) => (
    <Chip
      label={item}
      key={item}
      onDelete={() => {
        itemDelete(item);
      }}
    />
  ));

  if (input === "" && props.letterSet.size > 0) {
    // Rerenders input
    setInput(Array.from(props.letterSet).join(","));
  }

  return (
    <div>
      <TextField
        value={input}
        style={styles.input}
        onChange={handleInputChange}
        id="highlightInput"
        label="Letters"
        variant="outlined"
        error={props.letterSet.size < 1 || props.letterSet.size > 7}
        helperText={
          props.letterSet.size < 1 || props.letterSet.size > 7
            ? "List of letters must be between 1 and 7"
            : ""
        }
      />
      {props.letterSet.size > 0 && (
        <div style={styles.chipBox}>{listItems}</div>
      )}
    </div>
  );
}
