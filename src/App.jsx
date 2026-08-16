import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Scene from "./Scene.jsx";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const containerRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".reveal").forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef}>
      <Scene />

      <section className="hero">
        <h1>React + Three.js + GSAP + Lenis</h1>
        <p>Nuxt/Vue 版本的 React 移植 demo</p>
      </section>

      <section className="section">
        <p className="reveal">
          这段文字在滚动进入视口时，由 GSAP ScrollTrigger 触发淡入+上移动画，
          滚动本身由 Lenis 接管做惯性平滑。
        </p>
      </section>

      <section className="section">
        <p className="reveal">
          背景的 WebGL 画布来自 Scene.jsx，使用 Three.js 自定义 shader
          做流体波动效果，会随鼠标移动产生形变。
        </p>
      </section>
    </div>
  );
}
