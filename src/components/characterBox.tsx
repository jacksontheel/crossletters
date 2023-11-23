import { Paper } from "@mui/material";

export interface CharacterBoxProps {
  character: string;
  size: number;
  correct: boolean;
}

export default function CharacterBox(props: CharacterBoxProps) {
  const styles = {
    box: {
      width: `${50 / props.size}vw`,
      height: "100px",
      margin: "6px",
      backgroundColor: props.correct ? "#2aa849" : "#121212",

      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  };

  return (
    <Paper elevation={3} variant="outlined" style={styles.box}>
      <h1>{props.character}</h1>
    </Paper>
  );
}
