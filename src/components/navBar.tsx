import { AppBar, Button, Link } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import * as React from "react";

export interface NavBarProps {}

export function NavBar(props: NavBarProps) {
  const styles = {
    box: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    } as const,
    item: {
      margin: "0px 10px",
    },
  };
  return (
    <AppBar position="sticky" style={styles.box}>
      <Link href="/words" style={styles.item}>
        <h1>Crossletters</h1>
      </Link>
      <Link href="/words/create">
        <Button
          variant="outlined"
          startIcon={<CreateIcon />}
          style={styles.item}
        >
          Create
        </Button>
      </Link>
    </AppBar>
  );
}
