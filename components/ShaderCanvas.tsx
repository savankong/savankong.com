'use client'
import { useEffect, useRef } from 'react'
import { SHADERS, type ShaderName } from '@/lib/shaders'

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

type Props = {
  shader: ShaderName
  className?: string
  /** Seconds of animation per real second. */
  speed?: number
  /** Cap on device pixel ratio, to keep big canvases cheap. */
  maxDpr?: number
}

/**
 * A full-bleed WebGL canvas running one fragment shader from lib/shaders.
 * Uniforms: u_time, u_res, u_mouse (0..1, eased toward the pointer), u_scroll
 * (how far the canvas has travelled through the viewport, 0..1).
 * It only draws while on screen, and falls back to the CSS background of its
 * wrapper when WebGL is unavailable.
 */
export default function ShaderCanvas({ shader, className, speed = 1, maxDpr = 1.75 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, alpha: true })
    if (!gl) {
      canvas.style.display = 'none'
      return
    }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(s))
        return null
      }
      return s
    }
    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, 'precision highp float;\n' + SHADERS[shader])
    if (!vs || !fs) {
      canvas.style.display = 'none'
      return
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes = gl.getUniformLocation(prog, 'u_res')
    const uMouse = gl.getUniformLocation(prog, 'u_mouse')
    const uScroll = gl.getUniformLocation(prog, 'u_scroll')

    let visible = true
    let raf = 0
    let last = performance.now()
    let t = Math.random() * 40
    // off the canvas until the pointer arrives, so nothing lights up on its own
    const target = { x: -2, y: -2 }
    const mouse = { x: -2, y: -2 }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      target.x = (e.clientX - r.left) / r.width
      target.y = 1 - (e.clientY - r.top) / r.height
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!visible) return
      t += dt * speed
      mouse.x += (target.x - mouse.x) * Math.min(1, dt * 3)
      mouse.y += (target.y - mouse.y) * Math.min(1, dt * 3)
      resize()
      const r = canvas.getBoundingClientRect()
      const vh = window.innerHeight
      const scroll = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)))
      gl.uniform1f(uTime, t)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.uniform1f(uScroll, scroll)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    io.observe(canvas)
    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(frame)
    requestAnimationFrame(() => canvas.classList.add('shader-on'))

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [shader, speed, maxDpr])

  return <canvas ref={ref} className={`shader-canvas ${className ?? ''}`} aria-hidden="true" />
}
