import React, { useRef, useEffect, useState } from "react";

export interface ShaderButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  fragmentShader?: string;
  vertexShader?: string;
  uniforms?: Record<string, any>;
  disabled?: boolean;
}

const defaultVertexShader = `#version 300 es
in vec4 a_position;
in vec2 a_texcoord;
out vec2 v_texcoord;

void main() {
  gl_Position = a_position;
  v_texcoord = a_texcoord;
}
`;

const defaultFragmentShader = `#version 300 es
precision highp float;

in vec2 v_texcoord;
out vec4 outColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_hover;

void main() {
  vec2 uv = v_texcoord;

  // Simple gradient effect
  vec3 color = mix(
    vec3(0.2, 0.4, 0.8),
    vec3(0.4, 0.6, 1.0),
    uv.y
  );

  // Add hover effect
  color += u_hover * 0.2;

  outColor = vec4(color, 1.0);
}
`;

export const ShaderButton: React.FC<ShaderButtonProps> = ({
  children,
  onClick,
  className = "",
  style = {},
  width = 200,
  height = 60,
  fragmentShader = defaultFragmentShader,
  vertexShader = defaultVertexShader,
  uniforms = {},
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    });
    if (!gl) {
      console.error("WebGL2 not supported");
      return;
    }

    glRef.current = gl;

    // Create shader program
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);

    if (!vertShader || !fragShader) {
      console.error("Failed to create shaders");
      return;
    }

    gl.shaderSource(vertShader, vertexShader);
    gl.compileShader(vertShader);

    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
      console.error("Vertex shader compile error:", gl.getShaderInfoLog(vertShader));
      return;
    }

    gl.shaderSource(fragShader, fragmentShader);
    gl.compileShader(fragShader);

    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
      console.error("Fragment shader compile error:", gl.getShaderInfoLog(fragShader));
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      console.error("Failed to create program");
      return;
    }

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    programRef.current = program;

    // Create buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    const texcoords = new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.STATIC_DRAW);

    // Setup attributes
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const texcoordLocation = gl.getAttribLocation(program, "a_texcoord");

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(texcoordLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Render loop
    const render = () => {
      if (!gl || !program) return;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.bindVertexArray(vao);

      // Set uniforms
      const timeLocation = gl.getUniformLocation(program, "u_time");
      const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
      const hoverLocation = gl.getUniformLocation(program, "u_hover");

      if (timeLocation) {
        gl.uniform1f(timeLocation, (Date.now() - startTimeRef.current) / 1000);
      }
      if (resolutionLocation) {
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      }
      if (hoverLocation) {
        gl.uniform1f(hoverLocation, isHovered ? 1.0 : 0.0);
      }

      // Set custom uniforms
      Object.entries(uniforms).forEach(([name, value]) => {
        const location = gl.getUniformLocation(program, name);
        if (location) {
          if (typeof value === "number") {
            gl.uniform1f(location, value);
          } else if (Array.isArray(value)) {
            if (value.length === 2) {
              gl.uniform2f(location, value[0], value[1]);
            } else if (value.length === 3) {
              gl.uniform3f(location, value[0], value[1], value[2]);
            } else if (value.length === 4) {
              gl.uniform4f(location, value[0], value[1], value[2], value[3]);
            }
          }
        }
      });

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [fragmentShader, vertexShader, uniforms, isHovered]);

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={className}
      style={{
        position: "relative",
        width,
        height,
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        overflow: "hidden",
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
    >
      <canvas
        ref={canvasRef}
        width={width * 2}
        height={height * 2}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: disabled ? 0.5 : 1,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          color: "white",
          fontWeight: "bold",
          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
        }}
      >
        {children}
      </div>
    </button>
  );
};
