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

  // Calculate pixel size for sharper edges
  vec2 pixelSize = 1.0 / u_resolution;
  float edgeSharpness = 2.0;

  // Create border thickness
  float borderThickness = 0.05;

  // Wave effect on edges
  float topWave = sin(uv.x * u_waveFrequency + u_time * u_waveSpeed) * u_waveAmplitude;
  float bottomWave = sin(uv.x * u_waveFrequency + u_time * u_waveSpeed) * u_waveAmplitude;
  float leftWave = sin(uv.y * u_waveFrequency + u_time * u_waveSpeed) * u_waveAmplitude;
  float rightWave = sin(uv.y * u_waveFrequency + u_time * u_waveSpeed) * u_waveAmplitude;

  // Calculate distance from edges with wave offset
  float topDist = (1.0 - borderThickness + topWave) - uv.y;
  float bottomDist = uv.y - (borderThickness + bottomWave);
  float leftDist = uv.x - (borderThickness + leftWave);
  float rightDist = (1.0 - borderThickness + rightWave) - uv.x;

  // Create sharp edges
  float topEdge = smoothstep(0.0, pixelSize.y * edgeSharpness, topDist);
  float bottomEdge = smoothstep(0.0, pixelSize.y * edgeSharpness, bottomDist);
  float leftEdge = smoothstep(0.0, pixelSize.x * edgeSharpness, leftDist);
  float rightEdge = smoothstep(0.0, pixelSize.x * edgeSharpness, rightDist);

  // Combine edge effects
  float edgeMask = min(min(topEdge, bottomEdge), min(leftEdge, rightEdge));

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
