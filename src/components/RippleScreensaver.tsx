import React from "react";
import { ShaderHero, ShaderHeroProps } from "./ShaderHero";

export interface RippleScreensaverProps extends Omit<ShaderHeroProps, "fragmentShader" | "vertexShader"> {
  rippleSpeed?: number;
  rippleFrequency?: number;
  rippleCount?: number;
  colorA?: [number, number, number];
  colorB?: [number, number, number];
  colorC?: [number, number, number];
  amplitude?: number;
}

const rippleFragmentShader = `#version 300 es
precision highp float;

in vec2 v_texcoord;
out vec4 outColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_rippleSpeed;
uniform float u_rippleFrequency;
uniform float u_rippleCount;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_colorC;
uniform float u_amplitude;

// Hash function for pseudo-random numbers
float hash(float n) {
  return fract(sin(n) * 43758.5453);
}

void main() {
  vec2 uv = v_texcoord;
  vec2 p = (uv - 0.5) * 2.0;
  p.x *= u_resolution.x / u_resolution.y;

  vec3 color = vec3(0.0);
  float totalRipples = 0.0;

  // Multiple ripple sources
  for(float i = 0.0; i < u_rippleCount; i++) {
    // Pseudo-random positions for ripple centers
    float angle = hash(i) * 6.28318;
    float radius = hash(i + 10.0) * 0.5 + 0.3;
    vec2 offset = vec2(cos(angle), sin(angle)) * radius;

    // Animate the ripple centers
    float speed = u_rippleSpeed * (0.5 + hash(i + 20.0) * 0.5);
    offset.x += sin(u_time * speed + hash(i + 30.0)) * 0.3;
    offset.y += cos(u_time * speed + hash(i + 40.0)) * 0.3;

    // Add mouse influence
    vec2 mousePos = (u_mouse - 0.5) * 2.0;
    mousePos.x *= u_resolution.x / u_resolution.y;
    float mouseDist = length(offset - mousePos);
    offset += normalize(mousePos - offset) * (1.0 / (mouseDist + 1.0)) * 0.2;

    // Calculate distance from ripple center
    float dist = length(p - offset);

    // Create ripple effect
    float ripple = sin(dist * u_rippleFrequency - u_time * u_rippleSpeed * 2.0);
    ripple *= 1.0 / (dist * 2.0 + 1.0); // Fade with distance

    // Modulate amplitude
    ripple *= u_amplitude;

    totalRipples += ripple;
  }

  // Normalize ripples
  totalRipples /= u_rippleCount;

  // Create color gradient based on ripples
  float t = totalRipples * 0.5 + 0.5;

  // Use three-color gradient
  if(t < 0.5) {
    color = mix(u_colorA, u_colorB, t * 2.0);
  } else {
    color = mix(u_colorB, u_colorC, (t - 0.5) * 2.0);
  }

  // Add some dynamic brightness variation
  float brightness = 0.8 + 0.2 * sin(u_time + length(p));
  color *= brightness;

  // Add subtle vignette
  float vignette = 1.0 - length(p) * 0.3;
  color *= vignette;

  outColor = vec4(color, 1.0);
}
`;

export const RippleScreensaver: React.FC<RippleScreensaverProps> = ({
  rippleSpeed = 1.0,
  rippleFrequency = 10.0,
  rippleCount = 5.0,
  colorA = [0.1, 0.2, 0.5],
  colorB = [0.3, 0.5, 0.8],
  colorC = [0.5, 0.8, 1.0],
  amplitude = 1.0,
  uniforms = {},
  ...props
}) => {
  const combinedUniforms = {
    u_rippleSpeed: rippleSpeed,
    u_rippleFrequency: rippleFrequency,
    u_rippleCount: rippleCount,
    u_colorA: colorA,
    u_colorB: colorB,
    u_colorC: colorC,
    u_amplitude: amplitude,
    ...uniforms,
  };

  return (
    <ShaderHero
      {...props}
      fragmentShader={rippleFragmentShader}
      uniforms={combinedUniforms}
    />
  );
};
