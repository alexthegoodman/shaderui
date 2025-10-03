import React, { useRef, useEffect } from "react";

export interface ShaderHeroProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  fragmentShader?: string;
  vertexShader?: string;
  uniforms?: Record<string, any>;
  fullscreen?: boolean;
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
uniform vec2 u_mouse;

void main() {
  vec2 uv = v_texcoord;

  // Simple animated gradient
  vec3 color = vec3(
    0.5 + 0.5 * sin(u_time + uv.x * 3.0),
    0.5 + 0.5 * sin(u_time + uv.y * 3.0),
    0.5 + 0.5 * sin(u_time + (uv.x + uv.y) * 3.0)
  );

  outColor = vec4(color, 1.0);
}
`;

export const ShaderHero: React.FC<ShaderHeroProps> = ({
  children,
  className = "",
  style = {},
  width = "100%",
  height = "100vh",
  fragmentShader = defaultFragmentShader,
  vertexShader = defaultVertexShader,
  uniforms = {},
  fullscreen = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const mouseRef = useRef<[number, number]>([0.5, 0.5]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      if (glRef.current) {
        glRef.current.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = [
        (e.clientX - rect.left) / rect.width,
        1.0 - (e.clientY - rect.top) / rect.height,
      ];
    };

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

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    container.addEventListener("mousemove", handleMouseMove);

    // Render loop
    const render = () => {
      if (!gl || !program || !canvas) return;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.bindVertexArray(vao);

      // Set built-in uniforms
      const timeLocation = gl.getUniformLocation(program, "u_time");
      const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
      const mouseLocation = gl.getUniformLocation(program, "u_mouse");

      if (timeLocation) {
        gl.uniform1f(timeLocation, (Date.now() - startTimeRef.current) / 1000);
      }
      if (resolutionLocation) {
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      }
      if (mouseLocation) {
        gl.uniform2f(mouseLocation, mouseRef.current[0], mouseRef.current[1]);
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
      window.removeEventListener("resize", updateCanvasSize);
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, [fragmentShader, vertexShader, uniforms]);

  const containerStyle: React.CSSProperties = {
    position: fullscreen ? "fixed" : "relative",
    top: fullscreen ? 0 : undefined,
    left: fullscreen ? 0 : undefined,
    right: fullscreen ? 0 : undefined,
    bottom: fullscreen ? 0 : undefined,
    width: fullscreen ? "100vw" : width,
    height: fullscreen ? "100vh" : height,
    overflow: "hidden",
    ...style,
  };

  return (
    <div ref={containerRef} className={className} style={containerStyle}>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
      {children && (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};
