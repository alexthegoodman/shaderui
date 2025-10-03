import React from "react";
import { ShaderButton, ShaderButtonProps } from "./ShaderButton";

export interface WaveButtonProps extends Omit<ShaderButtonProps, "fragmentShader" | "vertexShader"> {
  waveAmplitude?: number;
  waveFrequency?: number;
  waveSpeed?: number;
  primaryColor?: [number, number, number];
  secondaryColor?: [number, number, number];
}

const waveFragmentShader = `#version 300 es
precision highp float;

in vec2 v_texcoord;
out vec4 outColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_hover;
uniform float u_waveAmplitude;
uniform float u_waveFrequency;
uniform float u_waveSpeed;
uniform vec3 u_primaryColor;
uniform vec3 u_secondaryColor;

void main() {
  vec2 uv = v_texcoord;

  // Wave effect on edges
  float wave = sin(uv.x * u_waveFrequency + u_time * u_waveSpeed) * u_waveAmplitude;
  float topEdge = smoothstep(0.95 + wave, 1.0 + wave, uv.y);
  float bottomEdge = smoothstep(0.95 - wave, 1.0 - wave, 1.0 - uv.y);

  float leftWave = sin(uv.y * u_waveFrequency + u_time * u_waveSpeed) * u_waveAmplitude;
  float leftEdge = smoothstep(0.95 + leftWave, 1.0 + leftWave, 1.0 - uv.x);
  float rightEdge = smoothstep(0.95 - leftWave, 1.0 - leftWave, uv.x);

  // Combine edge effects
  float edgeMask = 1.0 - max(max(topEdge, bottomEdge), max(leftEdge, rightEdge));

  // Create gradient with wave distortion
  float waveOffset = sin(uv.y * u_waveFrequency * 2.0 + u_time * u_waveSpeed * 0.5) * 0.1;
  vec3 color = mix(
    u_primaryColor,
    u_secondaryColor,
    uv.y + waveOffset
  );

  // Add animated shimmer effect
  float shimmer = sin(uv.x * 10.0 + u_time * 2.0) * 0.1;
  color += shimmer * u_hover;

  // Add hover brightness
  color += u_hover * 0.15;

  // Apply edge mask
  outColor = vec4(color * edgeMask, edgeMask);
}
`;

export const WaveButton: React.FC<WaveButtonProps> = ({
  waveAmplitude = 0.02,
  waveFrequency = 8.0,
  waveSpeed = 2.0,
  primaryColor = [0.2, 0.4, 0.8],
  secondaryColor = [0.4, 0.6, 1.0],
  uniforms = {},
  ...props
}) => {
  const combinedUniforms = {
    u_waveAmplitude: waveAmplitude,
    u_waveFrequency: waveFrequency,
    u_waveSpeed: waveSpeed,
    u_primaryColor: primaryColor,
    u_secondaryColor: secondaryColor,
    ...uniforms,
  };

  return (
    <ShaderButton
      {...props}
      fragmentShader={waveFragmentShader}
      uniforms={combinedUniforms}
    />
  );
};
