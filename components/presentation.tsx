"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Braces,
  Code2,
  Expand,
  Grid2X2,
  Pause,
  Play,
  Presentation as PresentationIcon,
  RotateCcw,
  X,
} from "lucide-react";
import { slides } from "../lib/slides";
import { SlideContent } from "./slides";
const format = (s: number) =>
  `${s < 0 ? "−" : ""}${Math.floor(Math.abs(s) / 60)
    .toString()
    .padStart(2, "0")}:${(Math.abs(s) % 60).toString().padStart(2, "0")}`;
export default function Presentation() {
  const [index, setIndex] = useState(0),
    [scale, setScale] = useState(1),
    [overview, setOverview] = useState(false),
    [replay, setReplay] = useState(0),
    [presenter, setPresenter] = useState(false),
    [elapsed, setElapsed] = useState(0),
    [running, setRunning] = useState(false),
    [slideStart, setSlideStart] = useState(0),
    [help, setHelp] = useState(false);
  const area = useRef<HTMLDivElement>(null);
  const channel = useRef<BroadcastChannel | null>(null);
  const lastTick = useRef(Date.now());
  const stateRef = useRef({ index, elapsed, running, slideStart });
  stateRef.current = { index, elapsed, running, slideStart };
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setPresenter(params.has("presenter"));
    let restored = { index: 0, elapsed: 0, running: false, slideStart: 0 };
    try {
      const raw = localStorage.getItem("codemode-talk-state");
      if (raw) {
        const saved = JSON.parse(raw);
        if (
          Number.isInteger(saved.index) &&
          saved.index >= 0 &&
          saved.index < slides.length &&
          Number.isFinite(saved.elapsed)
        ) {
          restored = {
            index: saved.index,
            elapsed:
              saved.elapsed +
              (saved.running
                ? Math.max(0, Math.floor((Date.now() - saved.updatedAt) / 1000))
                : 0),
            running: !!saved.running,
            slideStart: saved.slideStart || 0,
          };
        }
      }
    } catch {}
    const initial = Number(params.get("slide"));
    if (
      params.has("slide") &&
      Number.isFinite(initial) &&
      initial >= 0 &&
      initial < slides.length
    )
      restored.index = initial;
    stateRef.current = restored;
    setIndex(restored.index);
    setElapsed(restored.elapsed);
    setRunning(restored.running);
    setSlideStart(restored.slideStart);
    lastTick.current = Date.now();
    const bc = new BroadcastChannel("codemode-talk");
    channel.current = bc;
    bc.onmessage = (e) => {
      if (e.data.type === "state") {
        const s = e.data.state;
        stateRef.current = s;
        setIndex(s.index);
        setElapsed(s.elapsed);
        setRunning(s.running);
        setSlideStart(s.slideStart);
      }
      if (e.data.type === "request" && !params.has("presenter"))
        bc.postMessage({ type: "state", state: stateRef.current });
    };
    bc.postMessage({ type: "request" });
    return () => bc.close();
  }, []);
  useEffect(() => {
    const resize = () => {
      if (area.current)
        setScale(
          Math.min(
            area.current.clientWidth / 1600,
            area.current.clientHeight / 900,
          ),
        );
    };
    resize();
    const observer = new ResizeObserver(resize);
    if (area.current) observer.observe(area.current);
    return () => observer.disconnect();
  }, [presenter]);
  const publish = useCallback((patch: Partial<typeof stateRef.current>) => {
    const state = { ...stateRef.current, ...patch };
    stateRef.current = state;
    try {
      const saved = JSON.stringify({ ...state, updatedAt: Date.now() });
      sessionStorage.setItem("codemode-talk-state", saved);
      localStorage.setItem("codemode-talk-state", saved);
    } catch {}
    channel.current?.postMessage({ type: "state", state });
    return state;
  }, []);
  const go = useCallback(
    (n: number) => {
      const next = Math.max(0, Math.min(slides.length - 1, n));
      if (next === stateRef.current.index) return;
      setIndex(next);
      setSlideStart(stateRef.current.elapsed);
      if (next === 1 && !stateRef.current.running) {
        setRunning(true);
        publish({
          index: next,
          slideStart: stateRef.current.elapsed,
          running: true,
        });
      } else publish({ index: next, slideStart: stateRef.current.elapsed });
      setOverview(false);
    },
    [publish],
  );
  useEffect(() => {
    if (!running || presenter) return;
    lastTick.current = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const delta = Math.floor((now - lastTick.current) / 1000);
      if (delta < 1) return;
      lastTick.current += delta * 1000;
      const next = stateRef.current.elapsed + delta;
      setElapsed(next);
      publish({ elapsed: next });
    }, 1000);
    return () => clearInterval(id);
  }, [running, presenter, publish]);
  const toggleTimer = useCallback(() => {
    const next = !stateRef.current.running;
    setRunning(next);
    publish({ running: next });
  }, [publish]);
  const openPresenter = () =>
    window.open(
      `${location.origin}/?presenter=1`,
      "codemode-presenter",
      "width=1440,height=1000",
    );
  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.();
  };
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).matches("input,textarea,select") ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      )
        return;
      if (
        [
          "ArrowRight",
          "ArrowDown",
          " ",
          "ArrowLeft",
          "ArrowUp",
          "Home",
          "End",
        ].includes(e.key)
      )
        e.preventDefault();
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ")
        go(stateRef.current.index + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        go(stateRef.current.index - 1);
      if (e.key === "Home") go(0);
      if (e.key === "End") go(slides.length - 1);
      if (e.key === "Escape") {
        setOverview(false);
        setHelp(false);
      }
      if (e.key.toLowerCase() === "o") setOverview((v) => !v);
      if (e.key.toLowerCase() === "r") setReplay((v) => v + 1);
      if (e.key.toLowerCase() === "f") fullscreen();
      if (["p", "n"].includes(e.key.toLowerCase())) openPresenter();
      if (e.key.toLowerCase() === "t") toggleTimer();
      if (e.key.toLowerCase() === "d") location.href = "/demo";
      if (e.key === "?") setHelp((v) => !v);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [go, toggleTimer]);
  const slide = slides[index];
  const allotted = slides
    .slice(0, index + 1)
    .reduce((a, s) => a + s.duration, 0);
  return (
    <main
      className={`presentation-shell ${presenter ? "presenter-shell" : ""}`}
    >
      <div className="app-topbar">
        <span className="presentation-context">
          {index === 0 ? "" : slides[index].section}
        </span>
        <div className="topbar-right">
          <span className="edition">ENTERPRISE AI · TECHNICAL SESSION</span>
          <button
            className="shortcut-help"
            title="Keyboard shortcuts"
            onClick={() => setHelp(true)}
          >
            ?
          </button>
        </div>
      </div>
      <div className="presentation-main">
        <div className="stage-area" ref={area}>
          <div
            data-slide={index}
            className="slide-canvas"
            style={{ transform: `scale(${scale})` }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                className="slide-inner"
                key={`${index}-${replay}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {index > 0 && index !== 5 && index !== 8 && index !== 9 && index < slides.length - 1 && (
                  <header className="slide-header">
                    <div className="slide-eyebrow">
                      <span>{slide.section}</span>
                      <span>{String(index).padStart(2, "0")}</span>
                    </div>
                    <h2>{slide.title}</h2>
                  </header>
                )}
                <SlideContent index={index} />
              </motion.div>
            </AnimatePresence>
            <div className="canvas-footer">
              <span />
              <span>
                {index === 0 ? "" : `${String(index).padStart(2, "0")} / ${slides.length - 1}`}
              </span>
            </div>
          </div>
        </div>
        {presenter && (
          <aside className="presenter-notes">
            <span className="eyebrow">PRESENTER VIEW · PRIVATE WINDOW</span>
            <div className="presenter-clock">
              <strong className={elapsed > 1200 ? "red-text" : ""}>
                {format(elapsed)}
              </strong>
              <span>/ 20:00</span>
            </div>
            <div className="timer-actions">
              <button onClick={toggleTimer}>
                {running ? <Pause size={17} /> : <Play size={17} />}{" "}
                {running ? "Pause" : "Start"}
              </button>
              <button
                onClick={() => {
                  setElapsed(0);
                  setSlideStart(0);
                  setRunning(false);
                  publish({ elapsed: 0, slideStart: 0, running: false });
                }}
              >
                Reset
              </button>
            </div>
            <div className="pace-info">
              <span>
                This slide{" "}
                <b>
                  {format(elapsed - slideStart)} / {format(slide.duration)}
                </b>
              </span>
              <span>
                Agenda target <b>{format(allotted)}</b>
              </span>
            </div>
            <h3>{slide.title}</h3>
            <p>{slide.notes}</p>
            <div className="up-next">
              <span>UP NEXT</span>
              <strong>{slides[index + 1]?.title || "End of talk"}</strong>
            </div>
          </aside>
        )}
      </div>
      <footer className="control-bar">
        <div className="slide-position">
          <span>{String(index).padStart(2, "0")}</span>
          <span className="muted">/ {slides.length - 1}</span>
          <span className="control-divider" />
          <span>{slide.section}</span>
        </div>
        <div className="control-actions">
          <button
            title="Replay animation (R)"
            aria-label="Replay animation"
            onClick={() => setReplay((v) => v + 1)}
          >
            <RotateCcw size={17} />
          </button>
          <button
            title="Slide overview (O)"
            aria-label="Slide overview"
            onClick={() => setOverview(true)}
          >
            <Grid2X2 size={18} />
          </button>
          <button
            title="Presenter mode (P)"
            aria-label="Open presenter mode"
            onClick={openPresenter}
          >
            <PresentationIcon size={19} />
          </button>
          <button
            title="Fullscreen (F)"
            aria-label="Toggle fullscreen"
            onClick={fullscreen}
          >
            <Expand size={17} />
          </button>
          <span className="control-divider" />
          <button
            disabled={index === 0}
            title="Previous slide"
            aria-label="Previous slide"
            onClick={() => go(index - 1)}
          >
            <ArrowLeft size={20} />
          </button>
          <button
            disabled={index === slides.length - 1}
            className="next-button"
            title="Next slide"
            aria-label="Next slide"
            onClick={() => go(index + 1)}
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </footer>
      <div className="overall-progress">
        <div style={{ width: `${(index / (slides.length - 1)) * 100}%` }} />
      </div>
      {overview && (
        <div
          className="overview-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Slide overview"
        >
          <div className="overview-heading">
            <div>
              <span className="eyebrow">THE COMPLETE TALK</span>
              <h2>Choose a chapter.</h2>
            </div>
            <button
              onClick={() => setOverview(false)}
              aria-label="Close overview"
            >
              <X />
            </button>
          </div>
          <div className="overview-grid">
            {slides.map((s, i) => (
              <button
                key={s.title}
                onClick={() => go(i)}
                className={i === index ? "current" : ""}
              >
                <span className="overview-index">
                  {String(i).padStart(2, "0")}
                  <span>{s.duration ? format(s.duration) : "INTRO"}</span>
                </span>
                <div className={`overview-visual ov-${i % 4}`}>
                  <Braces size={32} />
                  <span />
                  <Code2 size={28} />
                </div>
                <strong>{s.title}</strong>
              </button>
            ))}
          </div>
        </div>
      )}
      {help && (
        <div className="help-backdrop" onClick={() => setHelp(false)}>
          <div
            className="help-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-help"
              aria-label="Close keyboard shortcuts"
              onClick={() => setHelp(false)}
            >
              <X />
            </button>
            <h3>Make it your stage.</h3>
            <p>Keyboard shortcuts</p>
            {[
              ["← / → / Space", "Navigate slides"],
              ["O", "Slide overview"],
              ["R", "Replay slide animations"],
              ["F", "Toggle fullscreen"],
              ["P / N", "Open private presenter window"],
              ["T", "Start or pause speaker timer"],
              ["D", "Open demo handoff"],
              ["Esc", "Close overview or help"],
            ].map(([key, label]) => (
              <div key={key}>
                <span>{label}</span>
                <kbd>{key}</kbd>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
