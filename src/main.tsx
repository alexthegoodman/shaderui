import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { ShaderButton } from "./components/ShaderButton";
import { WaveButton } from "./components/WaveButton";
import { PlasmaScreensaver } from "./components/PlasmaScreensaver";
import { StarfieldScreensaver } from "./components/StarfieldScreensaver";
import { RippleScreensaver } from "./components/RippleScreensaver";
import { VortexScreensaver } from "./components/VortexScreensaver";

const App = () => {
  const [activeScreensaver, setActiveScreensaver] = useState<string | null>(null);

  if (activeScreensaver) {
    return (
      <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
        {activeScreensaver === "plasma" && <PlasmaScreensaver fullscreen />}
        {activeScreensaver === "starfield" && <StarfieldScreensaver fullscreen />}
        {activeScreensaver === "ripple" && <RippleScreensaver fullscreen />}
        {activeScreensaver === "vortex" && <VortexScreensaver fullscreen />}

        <button
          onClick={() => setActiveScreensaver(null)}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 1000,
            padding: "10px 20px",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            color: "white",
            border: "2px solid rgba(255, 255, 255, 0.5)",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            backdropFilter: "blur(10px)",
          }}
        >
          Close Screensaver
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "40px", backgroundColor: "#1a1a1a", minHeight: "100vh" }}>
      <h1 style={{ color: "white", marginBottom: "0" }}>ShaderUI Components</h1>

      <section>
        <h2 style={{ color: "#aaa", marginBottom: "20px" }}>Buttons</h2>
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
      </section>

      <section>
        <h2 style={{ color: "#aaa", marginBottom: "20px" }}>Screensaver Previews</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          <div
            onClick={() => setActiveScreensaver("plasma")}
            style={{ cursor: "pointer", position: "relative", height: "200px", borderRadius: "12px", overflow: "hidden", border: "2px solid #333" }}
          >
            <PlasmaScreensaver width="100%" height="200px" />
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "10px",
              background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
              color: "white",
              fontWeight: "bold",
            }}>
              Plasma
            </div>
          </div>

          <div
            onClick={() => setActiveScreensaver("starfield")}
            style={{ cursor: "pointer", position: "relative", height: "200px", borderRadius: "12px", overflow: "hidden", border: "2px solid #333" }}
          >
            <StarfieldScreensaver width="100%" height="200px" />
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "10px",
              background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
              color: "white",
              fontWeight: "bold",
            }}>
              Starfield
            </div>
          </div>

          <div
            onClick={() => setActiveScreensaver("ripple")}
            style={{ cursor: "pointer", position: "relative", height: "200px", borderRadius: "12px", overflow: "hidden", border: "2px solid #333" }}
          >
            <RippleScreensaver width="100%" height="200px" />
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "10px",
              background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
              color: "white",
              fontWeight: "bold",
            }}>
              Ripple
            </div>
          </div>

          <div
            onClick={() => setActiveScreensaver("vortex")}
            style={{ cursor: "pointer", position: "relative", height: "200px", borderRadius: "12px", overflow: "hidden", border: "2px solid #333" }}
          >
            <VortexScreensaver width="100%" height="200px" />
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "10px",
              background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
              color: "white",
              fontWeight: "bold",
            }}>
              Vortex
            </div>
          </div>
        </div>
        <p style={{ color: "#888", marginTop: "10px", fontSize: "14px" }}>Click any screensaver to view fullscreen</p>
      </section>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
