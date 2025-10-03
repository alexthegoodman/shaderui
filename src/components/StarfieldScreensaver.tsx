import React from "react";
import { ShaderHero, ShaderHeroProps } from "./ShaderHero";

export interface StarfieldScreensaverProps extends Omit<ShaderHeroProps, "fragmentShader" | "vertexShader"> {
  speed?: number;
  density?: number;
  starSize?: number;
  layers?: number;
  brightness?: number;
}

const starfieldFragmentShader = `#version 300 es
precision highp float;

in vec2 v_texcoord;
out vec4 outColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_speed;
uniform float u_density;
uniform float u_starSize;
uniform float u_layers;
uniform float u_brightness;

// Hash function for pseudo-random numbers
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Star layer function
float starLayer(vec2 uv, float layer, float speed) {
  // Adjust for aspect ratio
  uv.x *= u_resolution.x / u_resolution.y;

  // Add mouse parallax effect
  vec2 mouseOffset = (u_mouse - 0.5) * 0.5 * layer;
  uv -= mouseOffset;

  // Movement
  uv.y += u_time * speed * layer;

  // Scale based on layer
  uv *= u_density / layer;

  // Grid cell
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  float stars = 0.0;

  // Check neighboring cells for stars
  for(float y = -1.0; y <= 1.0; y++) {
    for(float x = -1.0; x <= 1.0; x++) {
      vec2 offset = vec2(x, y);
      vec2 cellId = id + offset;

      float n = hash(cellId);

      // Only create star in some cells
      if(n > 0.8) {
        // Random position within cell
        vec2 starPos = vec2(
          hash(cellId + vec2(1.0, 0.0)),
          hash(cellId + vec2(0.0, 1.0))
        ) - 0.5;

        vec2 r = gv - offset - starPos;
        float dist = length(r);

        // Star size varies with hash
        float size = u_starSize * (0.5 + 0.5 * hash(cellId + vec2(2.0, 3.0)));

        // Create star with glow
        float star = smoothstep(size, 0.0, dist);
        star += smoothstep(size * 3.0, 0.0, dist) * 0.3;

        // Star twinkle
        float twinkle = 0.5 + 0.5 * sin(u_time * 3.0 + hash(cellId + vec2(4.0, 5.0)) * 6.28);
        star *= twinkle;

        stars += star;
      }
    }
  }

  return stars;
}

void main() {
  vec2 uv = v_texcoord;

  vec3 color = vec3(0.0);

  // Create multiple star layers with different speeds and colors
  for(float i = 0.0; i < u_layers; i++) {
    float layer = i + 1.0;
    float layerSpeed = u_speed * (1.0 + i * 0.3);
    float stars = starLayer(uv, layer, layerSpeed);

    // Different colors for different layers (depth effect)
    vec3 starColor = vec3(1.0);
    if(i == 0.0) {
      starColor = vec3(1.0, 1.0, 1.0); // White for closest
    } else if(i == 1.0) {
      starColor = vec3(0.8, 0.9, 1.0); // Slight blue
    } else if(i == 2.0) {
      starColor = vec3(0.7, 0.8, 1.0); // More blue
    } else {
      starColor = vec3(0.6, 0.7, 0.9); // Even more blue
    }

    // Fade distant layers
    float fade = 1.0 / (i + 1.0);
    color += stars * starColor * fade;
  }

  // Apply brightness
  color *= u_brightness;

  // Add subtle nebula background
  vec2 nebulaUV = v_texcoord * 2.0;
  nebulaUV.x *= u_resolution.x / u_resolution.y;
  float nebula = 0.0;
  nebula += 0.5 * sin(nebulaUV.x * 0.5 + u_time * 0.1);
  nebula += 0.5 * sin(nebulaUV.y * 0.3 + u_time * 0.15);
  vec3 nebulaColor = vec3(0.1, 0.05, 0.2) * (0.5 + 0.5 * nebula) * 0.3;

  color += nebulaColor;

  outColor = vec4(color, 1.0);
}
`;

export const StarfieldScreensaver: React.FC<StarfieldScreensaverProps> = ({
  speed = 0.2,
  density = 10.0,
  starSize = 0.02,
  layers = 3.0,
  brightness = 1.0,
  uniforms = {},
  ...props
}) => {
  const combinedUniforms = {
    u_speed: speed,
    u_density: density,
    u_starSize: starSize,
    u_layers: layers,
    u_brightness: brightness,
    ...uniforms,
  };

  return (
    <ShaderHero
      {...props}
      fragmentShader={starfieldFragmentShader}
      uniforms={combinedUniforms}
    />
  );
};
