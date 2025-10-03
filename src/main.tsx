import React from "react";
import ReactDOM from "react-dom/client";
import { ShaderButton } from "./components/ShaderButton";
import { WaveButton } from "./components/WaveButton";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "20px", backgroundColor: "#1a1a1a", minHeight: "100vh" }}>
      <h1 style={{ color: "white" }}>ShaderUI Button Components</h1>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <ShaderButton onClick={() => alert("Clicked!")}>
          Basic Shader Button
        </ShaderButton>

        <WaveButton onClick={() => alert("Wave clicked!")}>
          Wave Button
        </WaveButton>

        <WaveButton
          onClick={() => alert("Custom wave clicked!")}
          waveAmplitude={0.04}
          waveFrequency={12}
          waveSpeed={3}
          primaryColor={[0.8, 0.2, 0.4]}
          secondaryColor={[1.0, 0.4, 0.6]}
        >
          Custom Wave
        </WaveButton>

        <WaveButton
          onClick={() => alert("Disabled")}
          disabled
        >
          Disabled Wave
        </WaveButton>
      </div>
    </div>
  </React.StrictMode>
);
