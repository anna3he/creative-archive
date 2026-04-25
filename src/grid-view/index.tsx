import * as React from "react";
import type { MediaItem } from "~/src/infinite-canvas/types";
import styles from "./style.module.css";

interface GridViewProps {
  media: MediaItem[];
  visible: boolean;
}

function isVideo(url: string) {
  return url.endsWith(".mp4") || url.endsWith(".webm");
}

export function GridView({ media, visible }: GridViewProps) {
  return (
    <div className={`${styles.grid} ${visible ? styles.visible : ""}`}>
      {media.map((item, i) => (
        <div key={i} className={styles.cell}>
          {isVideo(item.url) ? (
            <video src={item.url} autoPlay loop muted playsInline />
          ) : (
            <img src={item.url} alt="" draggable={false} />
          )}
        </div>
      ))}
    </div>
  );
}