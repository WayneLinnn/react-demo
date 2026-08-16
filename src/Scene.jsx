import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float wave = sin(pos.x * 3.0 + uTime) * 0.15;
    wave += sin(pos.y * 4.0 + uTime * 1.3) * 0.1;
    wave += (uMouse.x * pos.x + uMouse.y * pos.y) * 0.2;
    pos.z += wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec3 colorA = vec3(0.05, 0.05, 0.08);
    vec3 colorB = vec3(0.35, 0.55, 0.95);
    float mixVal = sin(vUv.x * 3.14 + uTime * 0.5) * 0.5 + 0.5;
    vec3 color = mix(colorA, colorB, mixVal * vUv.y);
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function Scene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 3;

    const geometry = new THREE.PlaneGeometry(4, 4, 64, 64);
    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    };
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    function setSize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    setSize();

    function onMouseMove(e) {
      uniforms.uMouse.value.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", setSize);

    let rafId;
    const clock = new THREE.Clock();
    function animate() {
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    }
    animate();

    return function cleanup() {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", setSize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="webgl-canvas" />;
}
