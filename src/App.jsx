import React from "react";
import { StatsProvider } from "./context/StatsContext";
import ArchonPreview from "./components/ArchonPreview";

function App() {
  return (
    // pollInterval={60000} означає, що цифри Overview
    // будуть оновлюватися з бекенду кожну хвилину
    <StatsProvider pollInterval={60000}>
      <ArchonPreview />
    </StatsProvider>
  );
}

export default App;
