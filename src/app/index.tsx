import * as React from "react";
import manifest from "~/src/artworks/manifest.json";
import { GridView } from "~/src/grid-view";
import { InfoOverlay } from "~/src/info-overlay";
import { InfiniteCanvas } from "~/src/infinite-canvas";
import type { MediaItem } from "~/src/infinite-canvas/types";
import { PageLoader } from "~/src/loader";
import { Nav } from "~/src/nav";

type View = "3d" | "grid";

export function App() {
  const [media] = React.useState<MediaItem[]>(manifest);
  const [textureProgress, setTextureProgress] = React.useState(0);
  const [view, setView] = React.useState<View>("3d");
  const [infoOpen, setInfoOpen] = React.useState(false);

  return (
    <>
      {/* 3D infinite canvas — always mounted, hidden when grid is active */}
      <div style={{ position: "fixed", inset: 0, opacity: view === "3d" ? 1 : 0, transition: "opacity 0.38s cubic-bezier(0.16,1,0.3,1)", pointerEvents: view === "3d" ? "auto" : "none" }}>
        <InfiniteCanvas
          media={media}
          onTextureProgress={setTextureProgress}
          backgroundColor="#f7f6f3"
          fogColor="#f7f6f3"
          fogNear={150}
          fogFar={340}
        />
      </div>

      {/* 2D grid view */}
      <GridView media={media} visible={view === "grid"} />

      {/* Loader */}
      <PageLoader progress={textureProgress} />

      {/* Info overlay */}
      <InfoOverlay open={infoOpen} onClose={() => setInfoOpen(false)} />

      {/* Nav — sits on top of everything */}
      <Nav
        view={view}
        onViewChange={setView}
        onInfoOpen={() => setInfoOpen(true)}
        infoOpen={infoOpen}
      />
    </>
  );
}
