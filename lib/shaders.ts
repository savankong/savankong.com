// Fragment shaders for components/ShaderCanvas. GLSL ES 1.00; the component
// prepends the precision line. Shared uniforms: u_time, u_res, u_mouse
// (0..1, eased), u_scroll. Each one draws what its product does.

const COMMON = `
uniform float u_time;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_scroll;

const vec3 INK = vec3(0.051, 0.055, 0.063);
const vec3 PAPER = vec3(0.93, 0.92, 0.90);
const vec3 ROSTER = vec3(0.557, 0.651, 0.910);
const vec3 LUX = vec3(0.482, 0.686, 0.831);
const vec3 AMBER = vec3(0.910, 0.647, 0.294);
const vec3 ROSE = vec3(0.851, 0.451, 0.541);
const vec3 LILAC = vec3(0.647, 0.573, 0.910);

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float disc(vec2 p, vec2 c, float r) { return smoothstep(r + 1.0, r - 1.0, length(p - c)); }
float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}
`

// Home hero: a field of dots that drifts, is brightest behind the portrait,
// and wakes up under the pointer.
const field = `${COMMON}
void main() {
  vec2 px = gl_FragCoord.xy;
  float cell = clamp(u_res.x / 48.0, 18.0, 34.0);
  vec2 g = px / cell;
  vec2 id = floor(g);
  vec2 c = (id + 0.5) * cell;
  c += (vec2(noise(id * 0.3 + u_time * 0.08), noise(id * 0.3 - u_time * 0.07)) - 0.5) * cell * 0.5;
  vec2 uv = c / u_res;
  vec2 m = u_mouse;
  float aspect = u_res.x / u_res.y;
  float near = max(0.0, 1.0 - length((uv - vec2(0.8, 0.5)) * vec2(aspect, 1.0) / vec2(0.6, 0.8)));
  near *= smoothstep(0.9, 1.3, aspect); // narrow screens: text sits over the whole field
  float mouse = exp(-pow(length((uv - m) * vec2(aspect, 1.0)) * 4.0, 2.0));
  float twinkle = 0.5 + 0.5 * sin(u_time * (0.6 + hash(id) * 1.4) + hash(id + 3.0) * 6.28);
  float bright = 0.06 + near * 0.2 + mouse * 0.45 + twinkle * 0.04;
  float r = (1.0 + near * 0.9 + mouse * 1.4) * cell / 25.0;
  vec3 col = INK + PAPER * disc(px, c, r) * bright;
  col *= 1.0 - u_scroll * 0.3;
  gl_FragColor = vec4(col, 1.0);
}
`

// Your Roster: many experts, one model answer. Every few seconds a group of
// experts weighs in: lines draw to the answer and their points turn blue.
const experts = (cx: number) => `${COMMON}
void main() {
  vec2 px = gl_FragCoord.xy;
  float s = u_res.y;
  vec2 C = vec2(u_res.x * ${cx.toFixed(2)}, u_res.y * 0.52);
  vec3 col = INK;

  // the crowd
  float cell = max(22.0, s / 22.0);
  vec2 id = floor(px / cell);
  float here = step(0.45, hash(id + 7.0));
  vec2 dp = (id + 0.2 + 0.6 * vec2(hash(id), hash(id + 1.3))) * cell;
  dp += vec2(sin(u_time * 0.3 + hash(id) * 6.0), cos(u_time * 0.27 + hash(id + 2.0) * 6.0)) * 2.0;
  col += PAPER * 0.2 * here * disc(px, dp, 1.4 * s / 900.0);

  // the judges
  float lit = 0.0;
  for (int i = 0; i < 26; i++) {
    float fi = float(i);
    float a = hash(vec2(fi, 2.1)) * 6.2831;
    float d = (0.18 + 0.42 * hash(vec2(fi, 5.3))) * s;
    vec2 P = C + vec2(cos(a), sin(a)) * d * vec2(1.25, 0.9);
    P += vec2(sin(u_time * 0.25 + fi), cos(u_time * 0.21 + fi)) * 3.0;
    float cyc = fract(u_time * 0.11 + hash(vec2(fi, 9.7)));
    float on = smoothstep(0.0, 0.08, cyc) * (1.0 - smoothstep(0.55, 0.7, cyc));
    float grow = clamp(cyc / 0.25, 0.0, 1.0);
    vec2 end = mix(P, C, grow);
    float ln = smoothstep(1.2, 0.0, segDist(px, P, end)) * on;
    col += ROSTER * ln * 0.45;
    float pulse = fract(u_time * 0.6 + fi * 0.37);
    col += ROSTER * on * disc(px, mix(P, C, pulse * grow), 2.0) * 0.8;
    col = mix(col, mix(PAPER * 0.45, ROSTER, on), disc(px, P, (2.0 + 2.5 * on) * s / 900.0));
    lit += on;
  }

  // the answer
  float glow = exp(-length(px - C) / (s * 0.12));
  col += ROSTER * glow * (0.05 + 0.012 * lit);
  col *= 1.0 - u_scroll * 0.25;
  gl_FragColor = vec4(col, 1.0);
}
`

// Light-Lux: columns of light in each speaker's colour, rising and falling
// as the conversation passes from one voice to the next.
const voices = `${COMMON}
vec3 voice(float v) {
  return v < 0.5 ? LUX : (v < 1.5 ? AMBER : (v < 2.5 ? ROSE : LILAC));
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float n = 24.0;
  float x = uv.x * n;
  float id = floor(x);
  float f = fract(x);
  float v = mod(floor(id / 3.0), 4.0);
  float speaking = mod(floor(u_time * 0.35), 4.0);
  float next = mod(speaking + 1.0, 4.0);
  float blend = smoothstep(0.6, 1.0, fract(u_time * 0.35));
  float loud = mix(step(abs(v - speaking), 0.1), step(abs(v - next), 0.1), blend);
  float h = 0.18 + 0.32 * noise(vec2(id * 0.7, u_time * 0.6)) + loud * (0.25 + 0.2 * noise(vec2(id, u_time * 2.2)));
  float inside = smoothstep(0.08, 0.14, f) * smoothstep(0.92, 0.86, f) * step(uv.y, h);
  float fade = mix(0.35, 1.0, 1.0 - uv.y / max(h, 0.001));
  vec3 col = INK + voice(v) * inside * fade * (0.42 + 0.45 * loud);
  col *= 1.0 - u_scroll * 0.25;
  gl_FragColor = vec4(col, 1.0);
}
`

// Life Between Titles: a two-voice waveform. The host in amber and the guest
// in white trade turns like a real conversation.
const waveform = `${COMMON}
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float bars = floor(u_res.x / 9.0);
  float id = floor(uv.x * bars);
  float f = fract(uv.x * bars);
  float pos = id / bars;
  // the turn boundary sweeps across, so speech travels from one voice to the other
  float turn = step(0.5, fract(pos * 1.6 - u_time * 0.08));
  float env = noise(vec2(id * 0.06, u_time * 0.5)) * (0.4 + 0.6 * noise(vec2(id * 0.015 - u_time * 0.25, 4.0)));
  float amp = 0.04 + pow(env, 1.4) * 0.85;
  amp *= 0.7 + 0.3 * sin(id * 0.9 + u_time * 6.0);
  float dy = abs(uv.y - 0.5) * 2.0;
  float bar = step(dy, amp) * smoothstep(0.1, 0.3, f) * smoothstep(0.9, 0.7, f);
  vec3 c = mix(AMBER, PAPER * 0.75, turn);
  vec3 col = INK + c * bar * mix(1.0, 0.75, dy / max(amp, 0.001));
  col *= 1.0 - u_scroll * 0.2;
  gl_FragColor = vec4(col, 1.0);
}
`

export const SHADERS = {
  field,
  experts: experts(0.76),
  expertsCentred: experts(0.5),
  voices,
  waveform,
}
export type ShaderName = keyof typeof SHADERS
