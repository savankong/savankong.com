// Fragment shaders for components/ShaderCanvas. GLSL ES 1.00; the component
// prepends the precision line. Shared uniforms: u_time, u_res, u_mouse, u_scroll.

const COMMON = `
uniform float u_time;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_scroll;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec2 hash2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}
float grain(vec2 fc) { return hash(fc + fract(u_time * 7.0) * 91.0) - 0.5; }
`

// Home hero: slow ribbons of warm and cool light that lean toward the pointer.
const aurora = `${COMMON}
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float t = u_time * 0.06;
  vec2 m = (u_mouse - 0.5) * vec2(u_res.x / u_res.y, 1.0);

  vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t + 3.7));
  vec2 r = vec2(fbm(p * 1.7 + 2.0 * q + vec2(1.7, 9.2) + t * 1.3),
                fbm(p * 1.7 + 2.0 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p * 1.2 + 2.4 * r);

  vec3 ink = vec3(0.018, 0.018, 0.03);
  vec3 gold = vec3(1.0, 0.72, 0.36);
  vec3 violet = vec3(0.50, 0.40, 1.0);
  vec3 blue = vec3(0.30, 0.62, 1.0);
  vec3 rose = vec3(1.0, 0.42, 0.52);

  vec3 col = ink;
  col = mix(col, violet * 0.55, smoothstep(0.35, 0.9, f));
  col = mix(col, blue * 0.6, smoothstep(0.45, 0.95, r.x) * 0.7);
  col = mix(col, gold, smoothstep(0.62, 1.0, f * (0.8 + r.y)) * 0.85);
  col += rose * 0.25 * smoothstep(0.7, 1.0, q.y);

  // ribbons: thin bright bands along the warped field
  float band = abs(sin((f + r.x) * 9.0 + u_time * 0.4));
  col += gold * 0.12 * pow(1.0 - band, 12.0);

  // light that follows the pointer
  float d = length(p - m);
  col += mix(gold, violet, 0.4) * 0.35 * exp(-d * d * 5.0);

  // weight the light to the right, where the portrait sits, and fade the left for text
  col *= mix(0.45, 1.15, smoothstep(-0.2, 1.0, uv.x));
  col *= 1.0 - 0.55 * length(uv - vec2(0.6, 0.5));
  col *= 1.0 - u_scroll * 0.35;
  col += grain(gl_FragCoord.xy) * 0.035;
  gl_FragColor = vec4(col, 1.0);
}
`

// Your Roster: a living network. Nodes drift, edges connect neighbours, intro
// pulses travel along the edges, and the people near the pointer light up.
const network = `${COMMON}
float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}
vec2 nodeAt(vec2 cell) {
  vec2 h = hash2(cell);
  return cell + 0.5 + 0.38 * sin(u_time * (0.25 + h * 0.35) + h * 6.2831);
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec2 m = (u_mouse - 0.5) * vec2(u_res.x / u_res.y, 1.0);
  float scale = 6.0;
  vec2 g = p * scale + vec2(0.0, u_scroll * 2.0);
  vec2 cell = floor(g);
  vec2 mg = m * scale + vec2(0.0, u_scroll * 2.0);

  vec3 navy = vec3(0.10, 0.21, 0.42);
  vec3 blue = vec3(0.36, 0.56, 1.0);
  vec3 blush = vec3(1.0, 0.80, 0.74);
  vec3 gold = vec3(1.0, 0.76, 0.42);

  vec3 col = vec3(0.012, 0.018, 0.04) + navy * 0.25 * (1.0 - uv.y);
  float lines = 0.0;
  float pulses = 0.0;
  float nodes = 0.0;
  float lit = 0.0;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 c = cell + vec2(float(i), float(j));
      vec2 a = nodeAt(c);
      float near = exp(-length(a - mg) * 0.9);
      float dn = length(g - a);
      float size = 0.035 + 0.05 * hash(c + 3.1);
      nodes += smoothstep(size + 0.02, size - 0.01, dn) * (0.55 + 0.45 * near);
      nodes += 0.05 / (dn * dn * 40.0 + 1.0);
      lit += near * 0.08 / (dn * dn * 6.0 + 1.0);

      // edges to the right and up neighbours (each edge drawn once per pair)
      for (int k = 0; k < 3; k++) {
        vec2 o = k == 0 ? vec2(1.0, 0.0) : (k == 1 ? vec2(0.0, 1.0) : vec2(1.0, 1.0));
        vec2 c2 = c + o;
        if (hash(c + c2 * 1.7) < 0.35) continue;
        vec2 b = nodeAt(c2);
        float d = segDist(g, a, b);
        float w = 0.012;
        float e = smoothstep(w + 0.012, w, d);
        float strength = 0.25 + 0.75 * max(near, exp(-length(b - mg) * 0.9));
        lines += e * strength;
        // a pulse moving from a to b: the warm intro
        float speedK = 0.18 + 0.25 * hash(c2 + c);
        float tt = fract(u_time * speedK + hash(c * 2.3));
        vec2 pp = mix(a, b, tt);
        pulses += 0.012 / (dot(g - pp, g - pp) + 0.004) * step(0.6, hash(c * 9.1 + c2));
      }
    }
  }

  col += blue * lines * 0.35;
  col += blush * nodes * 0.9;
  col += gold * pulses * 0.12;
  col += mix(blue, gold, 0.5) * lit;
  col *= 1.0 - 0.6 * length(uv - 0.5);
  col += grain(gl_FragCoord.xy) * 0.03;
  gl_FragColor = vec4(col, 1.0);
}
`

// Light-Lux: shafts of light in four colours drifting through haze, orbs
// floating up and fading, dust lit only inside the light. After the Light-Lux
// homepage's own LightField.
const lightshafts = `${COMMON}
float shaft(vec2 uv, float x, float width, float lean, float t) {
  float cx = x + lean * (1.0 - uv.y) + 0.04 * sin(t * 0.6 + x * 7.0);
  float d = abs(uv.x - cx);
  return exp(-d * d / (width * width)) * smoothstep(-0.1, 1.0, uv.y);
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = u_time;
  vec2 m = u_mouse;

  vec3 carolina = vec3(0.48, 0.69, 0.83);
  vec3 amber = vec3(1.0, 0.70, 0.32);
  vec3 rose = vec3(1.0, 0.45, 0.55);
  vec3 lilac = vec3(0.70, 0.55, 1.0);

  vec3 col = vec3(0.035, 0.036, 0.025);
  float haze = fbm(vec2(uv.x * 3.0 + t * 0.05, uv.y * 2.0 - t * 0.08));
  float lean = (m.x - 0.5) * 0.25;

  vec3 light = vec3(0.0);
  light += carolina * shaft(uv, 0.22, 0.07, 0.18 + lean, t);
  light += amber * shaft(uv, 0.46, 0.05, 0.10 + lean, t * 1.2);
  light += rose * shaft(uv, 0.66, 0.06, -0.06 + lean, t * 0.9);
  light += lilac * shaft(uv, 0.86, 0.08, -0.16 + lean, t * 1.1);
  light += carolina * 0.6 * shaft(uv, 0.56, 0.03, 0.22 + lean, t * 1.4);
  light *= 0.55 + 0.9 * haze;
  col += light * 0.8;

  // orbs floating up, fading in and out
  for (int i = 0; i < 18; i++) {
    float fi = float(i);
    float s = hash(vec2(fi, 4.2));
    float x = hash(vec2(fi, 1.3)) * aspect + 0.05 * sin(t * 0.4 + fi);
    float y = fract(s + t * (0.025 + 0.03 * hash(vec2(fi, 7.7)))) * 1.3 - 0.15;
    float r = 0.012 + 0.03 * hash(vec2(fi, 9.9));
    float life = sin(fract(s + t * 0.05) * 3.14159);
    float d = length(p - vec2(x, y));
    vec3 c = fi < 5.0 ? carolina : (fi < 10.0 ? amber : (fi < 14.0 ? rose : lilac));
    col += c * life * (smoothstep(r, r * 0.2, d) * 0.5 + 0.004 / (d * d + 0.002) * r);
  }

  // dust, visible only inside the light
  vec2 dg = uv * vec2(aspect, 1.0) * 120.0 + vec2(t * 2.0, -t * 5.0);
  float dust = step(0.985, hash(floor(dg))) * smoothstep(0.5, 0.0, length(fract(dg) - 0.5));
  col += dust * length(light) * 1.2;

  col *= 1.0 - 0.5 * length(uv - vec2(0.5, 0.65));
  col += grain(gl_FragCoord.xy) * 0.03;
  gl_FragColor = vec4(col, 1.0);
}
`

// Life Between Titles: a conversation as a waveform. Two voices, layered,
// coloured by speaker, with a glow that breathes.
const waveform = `${COMMON}
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  float t = u_time;
  vec3 col = vec3(0.02, 0.018, 0.03);

  vec3 host = vec3(1.0, 0.72, 0.36);
  vec3 guest = vec3(0.55, 0.45, 1.0);
  vec3 third = vec3(1.0, 0.45, 0.55);

  // bars
  float bars = 96.0 * max(1.0, aspect / 1.6);
  float bx = floor(uv.x * bars);
  float fx = fract(uv.x * bars);
  float turn = step(0.5, fract(bx / bars * 2.0 - t * 0.05 + 0.5 * sin(t * 0.13)));
  float amp = fbm(vec2(bx * 0.08, t * 0.9)) * (0.35 + 0.65 * fbm(vec2(bx * 0.02 - t * 0.3, 1.0)));
  amp *= 0.55 + 0.45 * sin(bx * 0.05 + t * 0.7);
  amp = pow(max(amp, 0.0), 1.3) * 0.75;
  float dy = abs(uv.y - 0.5);
  float bar = step(dy, amp * 0.5) * smoothstep(0.5, 0.35, abs(fx - 0.5));
  vec3 bc = mix(host, guest, turn);
  col += bc * bar * (0.55 + 0.45 * (1.0 - dy / max(amp * 0.5, 0.001)));
  col += bc * 0.06 / (abs(dy - amp * 0.5) * 40.0 + 1.0) * smoothstep(0.5, 0.2, abs(fx - 0.5));

  // smooth carrier waves behind
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float y = 0.5 + 0.12 * sin(uv.x * aspect * (3.0 + fi) + t * (0.6 + fi * 0.3) + fi * 2.0)
                  * sin(uv.x * 2.0 + t * 0.2 + fi);
    float d = abs(uv.y - y);
    vec3 c = i == 0 ? host : (i == 1 ? guest : third);
    col += c * 0.0035 / (d * d * 60.0 + 0.004) * 0.08;
  }

  float breathe = 0.5 + 0.5 * sin(t * 0.8);
  col += mix(host, guest, uv.x) * 0.08 * breathe * exp(-pow((uv.y - 0.5) * 3.0, 2.0));
  col *= 1.0 - 0.6 * length((uv - 0.5) * vec2(1.0, 1.4));
  col += grain(gl_FragCoord.xy) * 0.03;
  gl_FragColor = vec4(col, 1.0);
}
`

export const SHADERS = { aurora, network, lightshafts, waveform }
export type ShaderName = keyof typeof SHADERS
