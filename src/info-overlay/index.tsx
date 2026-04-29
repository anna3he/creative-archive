import * as React from "react";
import styles from "./style.module.css";

interface InfoOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function InfoOverlay({ open, onClose }: InfoOverlayProps) {
  const [clock, setClock] = React.useState("");

  // live AEST clock
  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      const syd = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
      const h = syd.getHours();
      const m = String(syd.getMinutes()).padStart(2, "0");
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      setClock(`AEST ${h12}:${m} ${ampm}`);
    };
    update();
    const id = setInterval(update, 20000);
    return () => clearInterval(id);
  }, []);

  // esc to close
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <div className={`${styles.overlay} ${open ? styles.open : ""}`} aria-hidden={!open}>
      <div className={styles.scrim} onClick={onClose} />

      <div className={`${styles.card} ${open ? styles.cardIn : ""}`} role="dialog" aria-modal="true">
        <p className={styles.name}>Anna He</p>

        <p className={styles.tagline}>
          Collection of designs and interfaces across experiments & select work.<br />
          Exploring new things, old ideas and the in-between.
        </p>

        <div className={styles.rule}>
          <span className={styles.ruleLine} />
          <span className={styles.ruleDot} />
          <span className={styles.ruleLine} />
        </div>

        <p className={styles.credit}>
          Contributions: thank you to{" "}
          <a href="https://github.com/edoardolunardi/infinite-canvas" target="_blank" rel="noreferrer">
            Edoardo Lunardi
          </a>
          {" "}for the infinite canvas view.
        </p>

        <p className={styles.clock}>{clock}</p>

        <button className={styles.close} onClick={onClose}>[Close]</button>
      </div>
    </div>
  );
}
