"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import {
  Cpu,
  Network,
  Code2,
  Database,
  Box,
  Check,
  IndianRupee,
  Luggage,
  Plane,
  Terminal as TerminalIcon,
} from "lucide-react";
export type Tone =
  "slate" | "blue" | "amber" | "purple" | "cyan" | "green" | "red";
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.32,
        delay: Math.min(delay, 0.24),
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
export function Node({
  title,
  sub,
  tone = "slate",
  icon = "cpu",
  onClick,
}: {
  title: string;
  sub?: string;
  tone?: Tone;
  icon?: string;
  onClick?: () => void;
}) {
  const Icon =
    (
      {
        cpu: Cpu,
        network: Network,
        code: Code2,
        data: Database,
        box: Box,
        check: Check,
        terminal: TerminalIcon,
      } as Record<string, typeof Cpu>
    )[icon] || Box;
  return (
    <button
      onClick={onClick}
      className={`arch-node tone-${tone} ${onClick ? "clickable" : ""}`}
      tabIndex={onClick ? 0 : -1}
    >
      <span className="node-icon">
        {/nitrostack/i.test(title) ? (
          <img src="/nitrostack-logo.png" alt="" width={28} height={28} />
        ) : /claude code/i.test(title) || /^llm$/i.test(title) ? (
          <img src="/claude-logo.svg" alt="" width={28} height={28} />
        ) : /language model/i.test(title) ? (
          <>
            <img src="/chatgpt-logo.svg" alt="" width={28} height={28} />
            <img src="/claude-logo.svg" alt="" width={28} height={28} />
          </>
        ) : /^(travel )?mcp$/i.test(title) ? (
          <img src="/mcp-logo.svg" alt="" width={28} height={28} />
        ) : /^execute$/i.test(title) || /sandboxed javascript/i.test(title) ? (
          <img src="/execute-logo.svg" alt="" width={28} height={28} />
        ) : /^flights$/i.test(title) ? (
          <Plane size={28} strokeWidth={1.5} />
        ) : /^pricing$/i.test(title) ? (
          <IndianRupee size={28} strokeWidth={1.5} />
        ) : /^baggage$/i.test(title) ? (
          <Luggage size={28} strokeWidth={1.5} />
        ) : (
          <Icon size={28} strokeWidth={1.5} />
        )}
      </span>
      <strong>{title}</strong>
      {sub && <span>{sub}</span>}
    </button>
  );
}
export function Connector({
  vertical = false,
  tone = "blue",
  delay = 0,
}: {
  vertical?: boolean;
  tone?: Tone;
  delay?: number;
}) {
  return (
    <svg
      className={`connector ${vertical ? "vertical" : ""} tone-${tone}`}
      viewBox={vertical ? "0 0 30 40" : "0 0 100 30"}
      aria-hidden="true"
    >
      <motion.path
        d={vertical ? "M15 0V35M10 29l5 6 5-6" : "M0 15H94M87 9l7 6-7 6"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.32, delay: Math.min(delay, 0.24) }}
      />
      <circle
        r="3"
        fill="currentColor"
        cx={vertical ? 15 : 94}
        cy={vertical ? 35 : 15}
      />
    </svg>
  );
}
export function Terminal({
  title = "agent-session",
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`terminal ${className}`}>
      <div className="terminal-top">
        <span className="traffic">
          <i />
          <i />
          <i />
        </span>
        <span>{title}</span>
        <span>⌘</span>
      </div>
      <div className="terminal-body">{children}</div>
    </div>
  );
}
export function CodeEditor({
  code,
  active = -1,
  title = "workflow.ts",
}: {
  code: string;
  active?: number;
  title?: string;
}) {
  return (
    <Terminal title={title}>
      <div className="code-lines">
        {code.split("\n").map((line, i) => (
          <div key={i} className={`code-line ${active === i ? "active" : ""}`}>
            <span className="line-no">{i + 1}</span>
            <code>
              {line
                .split(
                  /("[^"]*"|\b(?:const|await|return|interface|Promise|string|number)\b)/g,
                )
                .map((t, j) => (
                  <span
                    key={j}
                    className={
                      t.startsWith('"')
                        ? "syntax-string"
                        : /^(const|await|return|interface|Promise|string|number)$/.test(
                              t,
                            )
                          ? "syntax-keyword"
                          : ""
                    }
                  >
                    {t || " "}
                  </span>
                ))}
            </code>
          </div>
        ))}
      </div>
    </Terminal>
  );
}
export function ToolGrid({
  count = 100,
  tone = "slate",
  selected = false,
}: {
  count?: number;
  tone?: Tone;
  selected?: boolean;
}) {
  return (
    <div
      className={`tool-grid tone-${tone}`}
      style={{ gridTemplateColumns: `repeat(${count <= 5 ? 5 : 20},1fr)` }}
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={
            selected && [23, 24, 25, 44, 45, 64, 65, 66, 84, 85].includes(i)
              ? "selected"
              : ""
          }
        />
      ))}
    </div>
  );
}
export function Metric({
  value,
  label,
  tone = "slate",
}: {
  value: string | number;
  label: string;
  tone?: Tone;
}) {
  return (
    <div className={`metric tone-${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
