# NitroStack — Agent Integration Layer

An interactive, local Next.js presentation by Satyam Soni: **Solving the Agent Integration Layer for Enterprise AI**.

## Run

Requires Node.js 20.9+.

```sh
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). For a production build, use `npm run build` followed by `npm start`. `npm run typecheck` checks TypeScript.

The deck uses a fixed 1600 × 900 canvas that scales to fit the available viewport, with no slide scrolling. Fullscreen on a 16:9 display gives the best conference experience. Fonts, icons, diagrams, and app assets are local; after installation and startup the talk does not require an internet connection. The slides use no external APIs or generated images. The live lab needs provider connectivity, or a previously saved genuine replay.

## Present

| Shortcut             | Action                                              |
| -------------------- | --------------------------------------------------- |
| Right / Down / Space | Next slide                                          |
| Left / Up            | Previous slide                                      |
| Home / End           | First / last slide                                  |
| F                    | Toggle fullscreen                                   |
| O                    | Slide overview                                      |
| R                    | Remount the slide and replay entrance animations    |
| P / N                | Open a separate presenter window with private notes |
| T                    | Start or pause timer                                |
| D                    | Open `/demo` handoff                                |
| ?                    | Keyboard help                                       |
| Escape               | Dismiss overview or help                            |

The footer provides equivalent mouse controls. Keyboard shortcuts ignore editable fields and modified key combinations.

Open presenter mode **before** moving the audience window to the projector. Move the separate presenter window to your laptop display; keep the audience window on the projector. The two windows synchronize through the same-origin BroadcastChannel API. Notes appear only in the presenter window. Allow popups for localhost if your browser blocks the presenter window. Both windows must use the same browser profile and origin. The audience window owns the timer, so leave it open while presenting.

The timer starts on entry to slide 1. Title time is excluded. The slide allocations sum to exactly 20 minutes. Presenter view shows elapsed talk time, elapsed slide time, slide allocation, cumulative agenda target, and the next title. Pause or reset with presenter controls. Reset stops the timer. Timing and slide position persist locally through reloads and the demo handoff; elapsed demo time is recovered when returning to the deck. If rehearsal is complete, reset before presenting.

Slide interactions:

- Slide 3: choose 10, 100, 500 or 1,000 tools in the context simulator.
- Slide 5: original Kenton Varda Code Mode announcement screenshot.
- Slide 6: play/restart both execution flows and compare model turns against tool calls.
- Slide 7: click each architecture layer for its technical explanation.
- Slide 8: supplied Claude Code announcement screenshot.
- Slide 9: combined user reactions and adoption screenshots.
- Slide 10: run/restart the illustrative line-by-line execution trace.
- Slide 11: search/reset the illustrative capability catalog.
- Slide 12: attempt/reset an unauthorized call to illustrate the trust boundary.
- Slide 14: launch the live demo handoff.

## Working live demo

`/demo` now contains the working NitroStack travel lab. Run `npm run demo` to start the app and agent services together. Configure the OpenAI-compatible provider in `.env.local`. See [the travel lab README](travel-lab/README.md) for installation, exact CLI commands, the five-minute walkthrough, metric definitions, genuine offline recording and verification.

With Docker Desktop running, `npm run demo` also starts the actual Grafana and Prometheus services. The embedded dashboard appears below the comparison table; open it directly at [localhost:3300](http://localhost:3300). See [observability setup](observability/README.md) for ports and lifecycle. Recorded replay automatically selects a complete traditional MCP + Code Mode pair and plays both saved traces without a model API request.

The deck slides remain instructional illustrations; the lab uses real MCP transports, actual model requests, generated JavaScript and NitroStack's QuickJS sandbox. Travel data remains deterministic sample data, never real availability.

## Project layout

- `lib/slides.ts`: slide titles, agenda durations, speaker notes and workflow source.
- `components/presentation.tsx`: navigation, scaling, fullscreen, overview, timer and presenter synchronization.
- `components/slides.tsx`: slide-specific visualizations and interactions.
- `components/visuals.tsx`: reusable architecture nodes, SVG connectors, tool grids, code editor, terminal and metrics.
- `app/globals.css`: shared design system and semantic colors.
- `app/demo/page.tsx`: independent demo handoff route.

## Technical framing and sources

- [Anthropic: Introducing the Model Context Protocol](https://www.anthropic.com/news/model-context-protocol) — November 2024 introduction.
- [Anthropic: Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp) — on-demand tool loading and processing intermediate results in the execution environment.
- [Cloudflare: Code Mode example](https://developers.cloudflare.com/dynamic-workers/examples/codemode/) — typed tool declarations and generated code orchestration.
- [MCP tools specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools) — tool discovery and tool schemas.

The comparison describes common implementation patterns rather than hard protocol limitations. SDK compression does not remove context limits; selective discovery matters. Fewer model interactions do not necessarily mean fewer underlying API calls. Sandboxing complements authentication and authorization.
