import { Button } from "@mui/material";
import * as React from "react";

export interface CharacterButtonProps {
  character: string;
  onClick: () => void;
  correct: boolean;
}

export function CharacterButton(props: CharacterButtonProps) {
  const styles = {
    box: {
      margin: "6px",

      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  };

  return (
    <div>
      <Button
        onClick={props.onClick}
        variant="contained"
        style={styles.box}
        disabled={props.correct}
      >
        <h1>{props.character}</h1>
      </Button>
    </div>
  );
}
