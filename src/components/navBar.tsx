import { AppBar, Button, IconButton, Link } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import { ReactElement } from "react";

export interface NavBarProps {
  elements?: ReactElement[];
}

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
      <Link href="/crossletters" style={styles.item}>
        <h1>Crossletters</h1>
      </Link>
      <div>
        {props.elements != null && props.elements.map((e) => e)}
        <Link href="/crossletters/create">
          <IconButton>
            <CreateIcon />
          </IconButton>
        </Link>
      </div>
    </AppBar>
  );
}
