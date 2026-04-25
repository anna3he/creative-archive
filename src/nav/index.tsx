import styles from "./style.module.css";

type View = "3d" | "grid";

interface NavProps {
  view: View;
  onViewChange: (v: View) => void;
  onInfoOpen: () => void;
  infoOpen: boolean;
}

export function Nav({ view, onViewChange, onInfoOpen, infoOpen }: NavProps) {
  return (
    <nav className={styles.nav}>
      <span className={styles.name}>Anna He</span>

      <div className={styles.toggle}>
        <button
          className={`${styles.viewBtn} ${view === "3d" ? styles.active : ""}`}
          onClick={() => onViewChange("3d")}
        >
          3D
        </button>
        <span className={styles.dot}>·</span>
        <button
          className={`${styles.viewBtn} ${view === "grid" ? styles.active : ""}`}
          onClick={() => onViewChange("grid")}
        >
          GRID
        </button>
      </div>

      <button
        className={`${styles.info} ${infoOpen ? styles.infoActive : ""}`}
        onClick={onInfoOpen}
      >
        Info
      </button>
    </nav>
  );
}
