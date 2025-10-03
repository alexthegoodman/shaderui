import React from "react";
import { ShaderHero, ShaderHeroProps } from "./ShaderHero";

export interface VortexScreensaverProps extends Omit<ShaderHeroProps, "fragmentShader" | "vertexShader"> {
  rotationSpeed?: number;
  spiralTightness?: number;
  colorSpeed?: number;
  brightness?: number;
  distortion?: number;
}

const vortexFragmentShader = `#version 300 es
precision highp float;

in vec2 v_texcoord;
out vec4 outColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_rotationSpeed;
uniform float u_spiralTightness;
uniform float u_colorSpeed;
uniform float u_brightness;
uniform float u_distortion;

#define PI 3.14159265359

// Smooth HSV to RGB conversion
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec2 uv = v_texcoord;
  vec2 p = (uv - 0.5) * 2.0;
  p.x *= u_resolution.x / u_resolution.y;

  // Add mouse influence to vortex center
  vec2 mousePos = (u_mouse - 0.5) * 2.0;
  mousePos.x *= u_resolution.x / u_resolution.y;
  vec2 center = mousePos * 0.3;

  vec2 toCenter = p - center;
  float dist = length(toCenter);
  float angle = atan(toCenter.y, toCenter.x);

  // Create spiral effect
  float spiral = angle / (2.0 * PI);
  spiral += dist * u_spiralTightness;
  spiral += u_time * u_rotationSpeed;

  // Rotation based on distance
  float rotation = u_time * u_rotationSpeed + dist * 3.0;
  float c = cos(rotation);
  float s = sin(rotation);
  mat2 rot = mat2(c, -s, s, c);
  vec2 rotatedP = rot * toCenter;

  // Create vortex distortion
  float distortAmount = u_distortion / (dist + 0.5);
  vec2 distorted = toCenter;
  distorted.x += sin(spiral * 10.0) * distortAmount;
  distorted.y += cos(spiral * 10.0) * distortAmount;

  // Multiple layers of vortex
  float vortex = 0.0;

  // Layer 1: main spiral
  vortex += sin(spiral * 20.0) * 0.5;

  // Layer 2: counter-rotating spiral
  vortex += sin(-spiral * 15.0 - u_time * u_rotationSpeed * 0.7) * 0.3;

  // Layer 3: radial waves
  vortex += sin(dist * 10.0 - u_time * 2.0) * 0.2;

  // Normalize
  vortex = vortex * 0.5 + 0.5;

  // Create color based on angle and distance
  float hue = spiral + u_time * u_colorSpeed;
  hue = fract(hue);

  float saturation = 0.7 + 0.3 * sin(dist * 5.0 - u_time);
  float value = vortex * u_brightness;

  // Add depth fade
  value *= 1.0 - dist * 0.3;

  vec3 color = hsv2rgb(vec3(hue, saturation, value));

  // Add energy rings
  float rings = sin(dist * 20.0 - u_time * 3.0);
  rings = smoothstep(0.5, 0.55, rings);
  color += rings * 0.3 * vec3(1.0, 0.8, 0.6);

  // Add glow in center
  float centerGlow = 1.0 / (dist * 3.0 + 1.0);
  color += centerGlow * 0.5 * vec3(1.0, 0.9, 0.8);

  // Vignette
  float vignette = 1.0 - dist * 0.4;
  color *= vignette;

  outColor = vec4(color, 1.0);
}
`;

export const VortexScreensaver: React.FC<VortexScreensaverProps> = ({
  rotationSpeed = 0.5,
  spiralTightness = 2.0,
  colorSpeed = 0.2,
  brightness = 1.0,
  distortion = 0.1,
  uniforms = {},
  ...props
}) => {
  const combinedUniforms = {
    u_rotationSpeed: rotationSpeed,
    u_spiralTightness: spiralTightness,
    u_colorSpeed: colorSpeed,
    u_brightness: brightness,
    u_distortion: distortion,
    ...uniforms,
  };

  return (
    <ShaderHero
      {...props}
      fragmentShader={vortexFragmentShader}
      uniforms={combinedUniforms}
    />
  );
};
