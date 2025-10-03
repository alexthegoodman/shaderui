import React from "react";
import { ShaderHero, ShaderHeroProps } from "./ShaderHero";

export interface PlasmaScreensaverProps extends Omit<ShaderHeroProps, "fragmentShader" | "vertexShader"> {
  speed?: number;
  complexity?: number;
  brightness?: number;
  colorShift?: number;
}

const plasmaFragmentShader = `#version 300 es
precision highp float;

in vec2 v_texcoord;
out vec4 outColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_speed;
uniform float u_complexity;
uniform float u_brightness;
uniform float u_colorShift;

void main() {
  vec2 uv = v_texcoord;
  vec2 p = (uv - 0.5) * 2.0;
  p.x *= u_resolution.x / u_resolution.y;

  float t = u_time * u_speed;

  // Multiple plasma layers
  float plasma = 0.0;

  // Layer 1: circular waves
  plasma += sin(length(p) * u_complexity + t);

  // Layer 2: horizontal waves
  plasma += sin(p.x * u_complexity * 0.8 + t * 0.7);

  // Layer 3: vertical waves
  plasma += sin(p.y * u_complexity * 0.8 + t * 0.5);

  // Layer 4: diagonal waves
  plasma += sin((p.x + p.y) * u_complexity * 0.6 + t * 1.3);

  // Layer 5: distance from mouse
  vec2 mousePos = (u_mouse - 0.5) * 2.0;
  mousePos.x *= u_resolution.x / u_resolution.y;
  plasma += sin(length(p - mousePos) * u_complexity * 1.2 + t * 0.9);

  // Normalize plasma
  plasma *= 0.2;

  // Create color from plasma using HSV-like transformation
  vec3 color;
  float h = plasma + u_time * u_colorShift;
  color.r = 0.5 + 0.5 * sin(h * 3.14159);
  color.g = 0.5 + 0.5 * sin(h * 3.14159 + 2.094);
  color.b = 0.5 + 0.5 * sin(h * 3.14159 + 4.189);

  // Apply brightness
  color *= u_brightness;

  // Add some shimmer
  float shimmer = 0.5 + 0.5 * sin(plasma * 10.0 + t * 3.0);
  color += shimmer * 0.1;

  outColor = vec4(color, 1.0);
}
`;

export const PlasmaScreensaver: React.FC<PlasmaScreensaverProps> = ({
  speed = 0.5,
  complexity = 4.0,
  brightness = 1.0,
  colorShift = 0.3,
  uniforms = {},
  ...props
}) => {
  const combinedUniforms = {
    u_speed: speed,
    u_complexity: complexity,
    u_brightness: brightness,
    u_colorShift: colorShift,
    ...uniforms,
  };

  return (
    <ShaderHero
      {...props}
      fragmentShader={plasmaFragmentShader}
      uniforms={combinedUniforms}
    />
  );
};
