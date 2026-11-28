# Presentation and demo implementation context

This is a source-derived inventory of the current implementation, not a speaker script or a proposed redesign. Snapshot: repository commit `b6f236a854f019ead54bac73c9aadeeaee9e5134`, reviewed on 2026-11-26. Slide numbers below are the actual zero-based presentation indices, **00 through 15**, not chapter numbers inferred from older screenshots or notes. No presentation, demo, recording, configuration or dependency files were changed to produce this document. Credentials and private environment values are excluded.

The presentation is a Next.js/React application at `/`; the working execution lab is at `/demo`. It is not a PPTX deck. Source authorities are `lib/slides.ts` (order, titles, sections, duration budgets and existing presenter notes), `components/slides.tsx` (slide bodies), `components/visuals.tsx` (shared visual behavior), `components/presentation.tsx` (stage/navigation), `components/demo-workbench.tsx` (lab), `travel-lab/src/*` (actual runtime), `lib/hosted-demo.ts`, the demo API route, and the observability configuration. Screenshot text below is read from the actual images in `public/`; screenshot claims are attributed to their authors and are not measurements of this demo.

## 1. Stage, visual language and shared controls

The deck uses a white 1600 × 900 canvas, scaled uniformly to fit the available stage using a ResizeObserver and `min(width / 1600, height / 900)`. It has Inter typography, dark headings, muted gray secondary text, rounded outlined diagram boxes and monospace code. Color roles are slate/model, blue/MCP or discovery, amber/traditional tools, purple/Code Mode or execution, cyan/bindings and green/capabilities or success. Errors use red. The final takeaway has the same white canvas, with blue emphasis on “both.” It is not a full blue slide.

The top application bar shows the current section except on slide 00, `ENTERPRISE AI · TECHNICAL SESSION`, and a `?` help button. The edition label is hidden on narrow screens. Standard slide headers show an uppercase section eyebrow, a two-digit index and the metadata title. These headers are deliberately omitted on **00, 05, 08, 09 and 15**; their metadata titles still appear in the overview/presenter view. All other slides use the standard heading. Non-title slides have a small canvas footer `NN / 15`. The lower application bar shows `NN / 15` and the section.

Footer actions: Replay animation, Slide overview, Open presenter mode, Toggle fullscreen, Previous slide and Next slide. Previous is disabled at 00; Next is disabled at 15. **There is no audience footer timer.** Timer state and controls remain in the private presenter window. A thin blue progress bar uses `index / 15 × 100%`, transitioning width over 0.4 seconds.

Keyboard behavior, except when the target is an input/textarea/select or Meta/Ctrl/Alt is held:

| Key | Current behavior |
| --- | --- |
| Right, Down, Space | Next slide, clamped to 15 |
| Left, Up | Previous slide, clamped to 00 |
| Home / End | First / last slide |
| O | Toggle overview |
| R | Remount current slide and replay/reset its local animations and interactive state |
| F | Toggle browser fullscreen |
| P or N | Open named presenter window at `/?presenter=1`, requested size 1440 × 1000 |
| T | Start/pause the retained speaker timer |
| D | Navigate to `/demo` from any slide |
| ? | Toggle shortcut help |
| Escape | Close overview/help; the screenshot lightbox also handles Escape locally |

Overview is a scrollable overlay labeled `THE COMPLETE TALK` / `Choose a chapter.` Each card shows its index, duration (`INTRO` for 00), metadata title and a generic braces-to-code illustration. Cards are not miniature live slide renderings. Selecting another slide closes the overview. The help dialog reads `Make it your stage.` / `Keyboard shortcuts` and lists the shortcuts above; close button, backdrop click and Escape close it.

Presentation state is restored from `localStorage["codemode-talk-state"]`; updates write both localStorage and sessionStorage and broadcast over `BroadcastChannel("codemode-talk")`. `?slide=N` overrides the initial slide selection. A running timer accounts for elapsed wall time while the page was closed. Navigating to slide 01 automatically starts it if paused. Timer updates occur in the audience window, not independently in presenter mode. The private presenter sidebar contains `PRESENTER VIEW · PRIVATE WINDOW`, elapsed time `/ 20:00` (red after 1200 seconds), Start/Pause, Reset, this-slide time versus duration, cumulative agenda target, the existing notes and `UP NEXT`. Existing notes are reproduced as existing source content in the metadata appendix, not expanded into a new script.

Shared animations and renderers:

- Every slide mounts with a 0.2-second opacity fade; outgoing slides fade with AnimatePresence `mode="wait"`. Index or replay-counter changes remount the body.
- `Reveal`: opacity 0 → 1 and vertical offset 14 → 0 over 0.5 seconds, with per-element delay.
- `Connector`: an SVG line/arrow draws over 0.7 seconds; a small same-color circle repeatedly travels along it every 2 seconds. It can run horizontally or vertically.
- `Node`: icon, title and optional subtitle in a tinted box. Only nodes with an `onClick` are interactive/tabbable; most boxes are diagram labels, not actions.
- `ToolGrid`: each cell fades/scales from 0.4 to 1. Delay is `min(index × 0.004, 0.8)` seconds. Five-or-fewer cells use five columns; larger grids use 20. Although the component supports a fixed selection pattern, current slides do not pass `selected=true`.
- `Terminal`: dark editor/terminal with three traffic-light dots, filename/title and a decorative `⌘`. `CodeEditor` adds line numbers, highlights double-quoted strings and a small keyword set (`const`, `await`, `return`, `interface`, `Promise`, `string`, `number`), and optionally highlights one line. It is a display component, not an editable IDE or debugger.
- CSS reduces animation/transition durations under `prefers-reduced-motion`; there is no explicit Framer Motion reduced-motion hook in these components.

## 2. Exact slide sequence and content

### Slide 00 — Solving the Agent Integration Layer for Enterprise AI

Section: `The integration layer`. Duration budget: 0 / `INTRO`. No standard header.

Visible body, with intended line breaks:

```text
NitroStack

Solving the agent
integration layer
for enterprise AI.

From tool calling to programmable agent execution
```

The NitroStack image `public/nitrostack-logo.png` (104 × 104 requested dimensions, object-fit contain) is centered above the wordmark and title. The title is centered, 78 px on the design canvas; `enterprise AI.` is blue. There is no speaker name, SS avatar, technical-talk/20-minutes kicker or braces logo in this body. The global edition label still exists above the canvas. Only the shared slide fade runs; there is no title-specific build sequence. No slide-specific interaction.

### Slide 01 — Giving AI agents hands

Section: `The foundation`. Duration budget: 45 seconds.

Visible lede: `Intelligence is only useful when it can act.`

Diagram, left to right:

1. Slate `Language model` / `Reasoning & intent`, inside a dashed enclosure labeled `THE MODEL`.
2. Animated blue connector to `MCP` / `A shared protocol`, with network icon.
3. Animated connector to four stacked external-service cards: `GitHub`, `Slack`, `Databases`, `Enterprise APIs`, with corresponding icons.

Below, three columns separated from the diagram by a horizontal rule:

| Primitive | Exact supporting copy |
| --- | --- |
| Tools | Perform actions. |
| Resources | Access data. |
| Prompts | Reusable instructions. |

Tools has blue emphasis. Model wrapper reveals at delay 0; MCP at 0.5 seconds; the second connector starts at 0.7 seconds; service cards reveal at 0.9, 1.05, 1.2 and 1.35 seconds. These are conceptual cards; they do not connect to GitHub/Slack/databases.

### Slide 02 — MCP works. Until we scale.

Section: `The scaling problem`. Duration budget: 60 seconds.

Left: a small diagram `Claude Code → Travel MCP`, then dark terminal `claude-code — travel-mcp` containing:

```text
❯ Discover the available travel tools
MCP request · tools/list
✓ search_flights        ready
✓ compare_fares         ready
✓ check_availability    ready
✓ search_hotels         ready
✓ get_booking_status    ready
```

Rows reveal with delays 0, 0.2, 0.4, 0.6 and 0.8 seconds. These five names are slide examples, not the actual ten-tool lab catalog: the actual catalog does not contain `search_hotels` or `get_booking_status`.

Right: numbered `tool.schema.json` editor displaying exactly:

```json
{
  "name": "search_flights",
  "description": "Find flights by route",
  "inputSchema": {
    "type": "object",
    "properties": {
      "from": { "type": "string" },
      "to": { "type": "string" }
    },
    "required": ["from", "to"]
  }
}
```

Bottom: three catalog visualizations: `5 tools` / `A helpful assistant` (five green blocks); `100 tools` / `A growing platform` (100 slate blocks); `1,000 tools` / `An enterprise catalog` (200 amber blocks), caption `Each cell represents 5 tools` for the last. Cells use the staggered ToolGrid entrance. The link `D · Claude Code demo handoff ↗` navigates to `/demo`; D also works through the global shortcut. The terminal and schema here are illustrative, not an actual live `tools/list` response.

### Slide 03 — The context window problem

Section: `The scaling problem`. Duration budget: 75 seconds.

Visible content:

- `Tool definitions compete with the work itself.`
- Pill `200,000 token window`.
- `TOOLS IN CATALOG`, with buttons `10`, `100`, `500`, `1,000`; **500 selected initially**.
- Capacity bar: slate `20k` conversation/instructions, amber definitions, light remaining context, and a red `+20k overflow` overlay only at 1,000 tools.
- Legend: `Conversation & instructions`, `Tool definitions`, `Remaining context`, and conditional `Overflow`.
- Metric captions: `tool definition tokens`, `tokens remaining`, `tokens over capacity`.
- Consequences: `Higher inference cost`, `Potential accuracy degradation`, `Context overflow`.
- Footnote: `Illustrative assumptions: 20,000 conversation tokens + 200 tokens per tool. Dynamic tool toggling can constrain agent autonomy.`
- Closing question: `Can we reduce context without reducing capabilities?`

Exact simulator values:

| Catalog | Definition tokens | Remaining | Overflow |
| --- | ---: | ---: | ---: |
| 10 | 2,000 | 178,000 | 0 |
| 100 | 20,000 | 160,000 | 0 |
| 500 | 100,000 | 80,000 | 0 |
| 1,000 | 200,000 | 0 | 20,000 |

`tokens = tools × 200`; `remaining = max(0, 200000 − 20000 − tokens)`; `overflow = max(0, 20000 + tokens − 200000)`. Definitions' visual width is capped at 180,000 tokens; conversation stays at 10% width. Width changes animate over 0.5 seconds. Buttons update local state immediately and have `aria-pressed`. These are explicitly illustrative assumptions, separate from actual demo token accounting.

### Slide 04 — What if agents could write code instead?

Section: `A different interface`. Duration budget: 90 seconds.

Lede: `Change the interface. Keep the capabilities.`

Two adjacent panels:

- **TRADITIONAL MCP** (amber dot): `Language model` connects to a vertical list `search_flights`, `compare_fares`, `check_baggage`, `search_hotels` with braces icons. Caption: `Every tool described to the model.` Tool cards reveal at `i × 0.18` seconds.
- **CODE MODE** (purple dot): `LLM → Execute → Typed SDK` using slate, purple and cyan boxes. Beneath is a green dashed strip `The same underlying tools`. Caption: `One execution interface. Programmable orchestration.` Connectors draw and carry moving packets.

Lower left: `FROM SCHEMA TO INTERFACE`, then:

```json
{ "name": "search_flights",
  "inputSchema": { "type": "object",
    "properties": { "from": {"type":"string"},
                    "to": {"type":"string"} } } }
```

Then the cyan line `→ searchFlights(from: string, to: string)`.

Lower right, `generated-workflow.ts`:

```ts
const flights = await travel.searchFlights("BLR", "SYD");
return flights.sort((a, b) => a.price - b.price)[0];
```

Footnote: `Compact types help. Large catalogs still need selective discovery.`

This is a conceptual API transformation. The actual lab uses `await callTool("search_flights", { ... })`, not this camelCase positional-argument SDK. No script is executed on this slide.

### Slide 05 — The original Code Mode announcement

Section: `A different interface`. Duration budget: 30 seconds. Standard slide heading is hidden.

Body: centered image `public/kenton-varda-code-mode-announcement.png`, displayed at 710 px height with preserved aspect ratio, rounded corners and a caption link:

`Kenton Varda · September 26, 2025 · Original announcement ↗`

Caption target: `https://x.com/KentonVarda/status/1971564015282421909`, opens a new tab. The image itself is not a clickable lightbox. Shared fade only.

Visible screenshot transcription (including quoted post):

```text
Kenton Varda
@KentonVarda

OK folks, today is the day when I reveal what this tweet was about.

We made MCP work better by:
1. Convert the MCP tools into a TypeScript API
2. Tell the agent to write code against this API

We call it "code mode"

It uses a new feature in Workers: Dynamic Worker Loading

Kenton Varda @KentonVarda · Sep 4, 2025
Me: Sunil, I think everyone using MCP wrong. What if they did [new approach],
enabled by [unannounced new Workers feature]?

Sunil: Makes sense, I'll add support for that to agents-sdk tomorrow and we
can try it out. x.com/threepointone/...

6:44 PM · Sep 26, 2025 · 97K Views
```

Avatar, verification badge, Cloudflare mark and X menu icons are part of the raster image. This slide is **after 04**, not after 03. Dynamic Worker Loading refers to the screenshot's Cloudflare announcement; this repository's demo executes in QuickJS WASM.

### Slide 06 — From tool calling to code execution

Section: `A different interface`. Duration budget: 100 seconds.

Request block labeled `USER REQUEST`:

> “Find the cheapest available flight from Bengaluru to Sydney and check its baggage allowance.”

Left **TRADITIONAL MCP** panel: eight boxes arranged as four rows, LLM on the left and the step on the right. Reading flow is `LLM → Search flights ↙ LLM → Compare fares ↙ LLM → Check baggage ↙ LLM → Final answer`. LLM boxes have sparkles icons; others have braces icons. Short horizontal lines and diagonal return arrows visualize repeated interaction. Lit horizontal lines get small amber packet dots traveling every 1.6 seconds.

Right **CODE MODE** panel: `LLM generates code` → purple down arrow → dashed `EXECUTION ENVIRONMENT` box containing `search → sort → baggage → filter` and `Intermediate data stays here.` → purple down arrow → `Final result → LLM`.

Below both panels are `model turns` and `tool calls` counters. Initial state is 1 model turn / 0 tool calls in each panel. `Play execution` resets `step=0`, starts an 850 ms interval and advances through step 7; button says `Restart flow` while running. Traditional boxes become lit when `step >= box index`; runtime box lights at step 2; Code Mode final result lights at step 7. Counters:

```text
traditional model turns = min(4, floor(step / 2) + 1)
traditional tool calls  = min(3, floor((step + 1) / 2))
code model turns        = step >= 7 ? 2 : 1
code tool calls         = min(3, max(0, step - 1))
```

Final state: four versus two model turns; **three underlying tool calls on each side**. It stops on the next interval check after step 7. This is an illustrative animation, not a measured model run; the displayed “Compare fares” row and three-call counter should not be treated as an exact trace of the live lab.

Exact lower message: `Code Mode adds the logic to automate the back-and-forth work.`

### Slide 07 — Anatomy of Code Mode

Section: `Under the hood`. Duration budget: 100 seconds.

Five clickable, vertically connected layers on the left. They reveal with `i × 0.28` seconds delay; connectors between layers are blue after the first layer and purple thereafter. Right-hand inspector reads `INSPECT THE ARCHITECTURE`, a large layer number 01–05, selected title and description. **Initial selection: 03, Sandboxed runtime.**

| Layer | Exact title | Exact inspector description |
| --- | --- | --- |
| 01 | User request | Intent enters the agent. |
| 02 | Language model | Generates executable logic using discovered types. |
| 03 | Sandboxed runtime | Executes code; holds intermediate state with resource limits. |
| 04 | Generated SDK / tool bindings | Typed bindings translate calls into authorized service requests. |
| 05 | MCP tools · REST APIs · Enterprise services | Underlying capabilities execute operations; results are serialized back to the model. |

Layers use box, CPU, code, box and network icons respectively; first two slate, then purple, cyan and green. Clicking changes the inspector only. Footer tip: `Click a layer to explore its role.` Beneath a rule and braces icon: `Code out.` / `A compact, serialized result back.` No real calls occur here.

### Slide 08 — Code Mode comes to Claude Code

Section: `Code Mode in practice`. Duration budget: 15 seconds. Standard slide heading is hidden.

Centered screenshot `public/claude-code-mode-announcement.png`, same 710 px contain treatment as 05. Caption `ClaudeDevs · Code Mode in Claude Code ↗`, linking to `https://x.com/ClaudeDevs/status/2122801681939234950` in a new tab. No image modal. Shared fade only.

Visible screenshot text:

```text
ClaudeDevs
@ClaudeDevs

Check out Code Mode, a new, experimental way for Claude Code to work
with tools. Claude writes scripts that chain your tools together in
sophisticated ways, and it can answer you while long commands are still
running.

Opt in with CLAUDE_CODE_EXPERIMENTAL_CODE_MODE=1

Claude Code Docs
Model and responses
Run tool calls from code with Code Mode
Try Code Mode, an experimental feature in which
Claude writes JavaScript that makes several tool c...
Run tool calls from code with Code Mode - Claude Code Docs
From code.claude.com
```

The environment flag is text in an announcement image; this application does not set it or depend on Claude Code's native experimental feature to run its own NitroStack comparison.

### Slide 09 — Code Mode: reactions and adoption

Section: `Code Mode in practice`. Duration budget: 45 seconds. Standard heading is hidden; custom gallery heading is visible:

```text
ADOPTION & REACTIONS
From an idea to real use.
Developers are trying it. The pattern is spreading.
```

`real use.` is purple. Three aligned rounded cards have pale label bands, small purple/green/amber dots, black screenshot preview windows, summary copy and author rows:

| Card | Label | Headline | Supporting copy | Author/footer |
| --- | --- | --- | --- | --- |
| 1 | First reaction | “Absolutely insane” savings. | After trying Code Mode in Claude Code. | Ravve Jay / X / Twitter |
| 2 | Reported savings | 34% cheaper on one task. | $0.36 with Code Mode · $0.55 without | Dheeraj Agrawal / User-reported comparison |
| 3 | Industry adoption | A pattern across harnesses. | Reflecting on a year of Code Mode adoption. | Kenton Varda / X / Twitter |

Bottom note: `Three perspectives. One shift toward programmable tool use.`

Previews are 260 px high and crop larger images; Ravve's short image is vertically centered. Every preview is a button with `View full post` overlay and an outward arrow. Clicking **opens the local full-image lightbox**, not X. Lightbox: dark overlay within the slide canvas, full contained screenshot (max height 760 px, max width 1400 px), caption, autofocus close X. Close via X, backdrop click or Escape; keyboard events from the lightbox stop propagation to slide navigation. Gallery cards have no separate timed entrance beyond the shared slide fade.

Assets and full-image captions:

- `public/claude-code-mode-ravve-jay.png`: `Ravve Jay · Firsthand reaction`. The source data retains `https://x.com/RJPrevendido/status/2124073641730338843`, but this gallery does not render it as a link.
- `public/claude-code-mode-dheeraj-cost.png`: `Dheeraj Agrawal · User-reported cost comparison`. No source URL is assigned in the screenshot metadata.
- `public/code-mode-harness-adoption.png`: `Kenton Varda · Adoption across harnesses`. Source data retains `https://x.com/KentonVarda/status/2122813445645189234`; likewise not rendered as a gallery link.

Full screenshot 1 text:

```text
Ravve Jay
@RJPrevendido
Just tried code mode in Claude Code terminal and the savings are
absolutely insane
```

Full screenshot 2 text:

```text
dheeraj agrawal
@dheeraja486
1/ Tried Claude Code's new Code Mode today and the cost difference
surprised me.

Same task, Opus 5.5 low effort, Code Mode on vs off. Five separate
lookups across my repo.

ON: $0.36
OFF: $0.55

Same answers. About 34% cheaper just by flipping one env var.

7:49 PM · Nov 15, 2026 · 33 Views
```

Its lower portion is a cropped screenshot carousel of terminal usage results, with a right arrow and incomplete fragments including `cache read`, `cache write`, `116.2k`, `35.8k`, `196.8k`, and `tokens from cache`. The raster does not expose full terminal lines; do not infer missing measurements. The carousel arrow is pixels, not an interactive carousel in this deck.

Full screenshot 3 includes these readable posts and embedded document text:

```text
Kenton Varda
@KentonVarda
And now, a year later, every major harness has implemented it... and they
all kept the name.

Dane Knecht @dok2001 · Dec 19, 2025
It's great to see everyone adopting Code Mode! Like most good things
@Cloudflare, it started with a blog post by @KentonVarda. He wrote it before
the code, and we never got around to figuring out a better name.

Code|Mode: The better way to use MCP
speculative blog post by Kenton
MOVED TO: BLOG-3013 Code Mode: The better way to use MCP
It turns out we've all been using MCP wrong.
Most agents today use MCP by exposing the "tools" directly to the LLM.
We tried something different: Convert the MCP tools into a TypeScript
API, and then ask an LLM to write code that calls that API.
The results are striking:
1. We found agents are able to handle many more tools, and more
   complex tools, when those tools are presented as a TypeScript
   API rather than directly. Perhaps this is because LLMs have an
   enormous amount of real-world TypeScript in their training set,
   but only a small set of contrived examples of tool calls.
2. The approach really shines when an agent needs to string
   together multiple calls. With the traditional approach, the output
   of each tool call must feed into the LLM's neural network, just to
   [remainder is cropped in the supplied image]

Kenton Varda, 3:35 PM Sep 8
I'm not in love with this name.
Open to better ideas.

Kenton Varda, 9:37 AM Sep 8
This is written optimistically
assuming it actually works as well
as hypothesized. :) Will update
once we have actual results.

goose @goose_oss · Dec 18, 2025
We just shipped code mode, so goose can generate and execute code
against MCP tools instead of loading every schema into context. This mean...
```

These images record external reactions/claims. The deck does not independently verify that every harness adopted the pattern, or promise 34% savings for this lab. Exact supplied rasters remain the authority for cropped fragments.

### Slide 10 — Code is a better interface / for complex workflows

Section: `Under the hood`. Duration budget: 100 seconds. Metadata title has a newline before `for complex workflows`.

Left: dark numbered `workflow.ts` editor displaying:

```ts
const flights = await travel.searchFlights({
  from: "BLR",
  to: "SYD"
});

const cheapest = flights.sort(
  (a, b) => a.price - b.price
)[0];

const baggage = await travel.getBaggagePolicy({
  flightId: cheapest.id
});

return { flight: cheapest, baggage };
```

Right: `EXECUTION TRACE` with green dot and `Illustrative`, then:

| Trace name | Exact description | Threshold step |
| --- | --- | ---: |
| searchFlights() | BLR → SYD · 24 flights | 0 |
| sort by price | 24 flights → cheapest option | 4 |
| getBaggagePolicy() | Flight AI-308 · 30 kg checked | 7 |
| return result | { flight, baggage } | 10 |

`Run workflow` resets step to −1 and starts a 550 ms interval through steps 0–10. Button reads `Restart execution` while running. Zero-based highlighted code indices are `[0, 1, 2, 3, 5, 6, 7, 9, 10, 11, 13]`; trace entries change from faded dots to full-opacity green checks when their thresholds are reached. It stops on the following interval check after the last step. This simulates execution only; it does not run the displayed code, fetch 24 real flights or return AI-308 from the lab dataset.

Tags: `Loops`, `Conditions`, `Parallel execution`, `Filtering`, `Transformations`, `Dependent operations`.

Bottom: `The model generates the logic.` then purple `The runtime performs the computation.`

### Slide 11 — Discover capabilities. / Don’t load everything.

Section: `Under the hood`. Duration budget: 90 seconds. Heading has the indicated line break.

Lede: `A large catalog. A small context footprint.` Diagram: slate `AI agent`, animated arrow, then three adjacent boxes: blue `search` / `Find capabilities`; cyan `get_schema` / `Load selected types`; purple `execute` / `Run the workflow`.

Search form placeholder: `Search capabilities: flights, baggage, payments…`; magnifier icon; `Search` button; conditional `Reset`. Input's accessible label is `Search capability catalog`.

Empty-query state: a 300-cell illustrative grid and footer `Enterprise capability catalog · 300 illustrative tools` / `0 schemas loaded upfront`.

Typing filters **locally, immediately**, not on submit and not through the NitroStack server. Lowercase text, replace hyphens/underscores with spaces, split on whitespace, drop empty terms and stopwords `find`, `related`, `capabilities`, `tools`, `the`, `for`, `and`. A capability matches only if **every remaining term** occurs in its normalized name, description or aliases. There is no stemming, embedding search or rank score. Submitting prevents page navigation; Reset clears the query. A nonempty query containing only stopwords matches all 300 entries. Result cards show tool name and description in a three-column scrollable results region. No result click handler exists; schemas are never loaded by this slide.

Footer during search: `N matching capability/capabilities · 0 schemas loaded`, green when N > 0. Empty results message: `No capabilities match “QUERY”. Try flights, baggage, hotels or payments.` Result count is a polite live status region.

The catalog is exactly 10 domains × 30 actions. Domain descriptions/aliases:

| Domain | Description | Aliases |
| --- | --- | --- |
| flights | Flight search, fares, airlines and airports | travel aviation route ticket |
| hotels | Hotel rooms, stays and reservations | travel accommodation booking |
| payments | Payments, invoices and refunds | billing finance money |
| customers | Customer profiles and accounts | crm contact support |
| inventory | Inventory, products and stock | warehouse catalog item |
| shipments | Shipments, delivery and tracking | logistics shipping parcel |
| events | Calendar events and meetings | schedule appointment time |
| documents | Documents, files and permissions | storage content access |
| reports | Reports, metrics and dashboards | analytics data insights |
| employees | Employees, teams and roles | hr people staff |

Actions, in generation order: `search`, `get`, `list`, `create`, `update`, `cancel`, `compare`, `validate`, `check_availability`, `get_status`, `get_history`, `get_details`, `get_policy`, `get_price`, `get_summary`, `get_categories`, `get_locations`, `get_options`, `get_recommendations`, `get_rules`, `get_limits`, `get_metadata`, `get_changes`, `get_statistics`, `get_related`, `get_owner`, `get_permissions`, `get_schedule`, `get_notifications`, `get_audit_log`. Names are `${action}_${domain}`; descriptions are `${action with underscores replaced by spaces} · ${domain description}`. Exception: flights/get_policy becomes `get_baggage_policy` / `Checked baggage allowance, cabin bags and weight limits`.

Below: `01 Search the catalog`, `02 Load relevant schemas`, `03 Execute with typed bindings`. Footnote: `Illustrative interface names. Discovery results must respect the caller’s permissions.` The actual SDK also happens to expose these three default names, but this slide's 300-item catalog and substring search are separate from its BM25 discovery.

### Slide 12 — Can we trust AI-generated code?

Section: `The trust boundary`. Duration budget: 90 seconds.

Lede: `Treat generated code as untrusted. Make execution controlled.`

Left: code icon, `AI-generated JavaScript`, small code `await tools.call(...)`. Purple connector leads into a large pale-purple outlined enclosure labeled `ISOLATED SANDBOX` / `Trust boundary`. Four controls inside:

| Control | Exact supporting copy |
| --- | --- |
| Memory limits | Bounded allocation |
| Execution timeouts | Bounded runtime |
| Tool permissions | Scoped capabilities |
| Tool-call limits | Bounded operations |

Lower enclosure line: `Isolate · Authorize · Audit`.

Right: a connector and two outcome boxes: green `travel.searchFlights` / `Authorized`; neutral `admin.deleteAll` / `No permission`. `Try unauthorized call` toggles a local boolean, turns the latter red, changes it to `Blocked · permission denied`, and changes the outgoing connector to red. Button becomes `Reset request`; clicking again restores the neutral state. This is a **visual demonstration only**, not a server or sandbox call. Global replay remount also resets it.

Bottom statement: `Sandboxing does not replace authentication or authorization.` The actual runtime timeout test exists separately on the lab Architecture tab. The names on this conceptual slide are not actual registered lab method names.

### Slide 13 — Enterprise integration at scale

Section: `Putting it together`. Duration budget: 60 seconds.

Three-column comparison table, with amber Tool Calling and purple Code Mode header dots. Rows reveal at `i × 0.23` seconds; Code Mode column has a pale-purple background:

| DIMENSION | Tool Calling | Code Mode |
| --- | --- | --- |
| Tool discovery | Often upfront | On demand |
| Context | Full tool schemas | Selected schemas |
| Multi-step workflows | Repeated model interactions | Script execution |
| Intermediate data | Often returned to model | Processed in runtime |
| API coverage | Often curated | Broader catalogs possible |
| Orchestration | Model-driven | Generated executable logic |

Footnote: `Common architectural patterns; selective discovery is also possible with MCP.`

Closing question: `How difficult is it to actually build?`

No table controls or real requests. These are qualified architectural comparisons, not protocol restrictions.

### Slide 14 — Building Code Mode / with NitroStack

Section: `From architecture to execution`. Duration budget: 285 seconds / 04:45. Heading has the indicated line break.

Lede: `The architecture, made executable.` Left conceptual vertical stack: `Claude Code` / `The agent` → `NitroStack MCP Server` / `Discovery + execution interfaces` → `Sandboxed JavaScript` / `Generated workflow`. Downward connectors are horizontal SVG connectors rotated 90 degrees; nodes use terminal, network and code icons. Three green boxes underneath: `Flights`, `Pricing`, `Baggage`.

Right handoff card:

```text
LET’S BUILD IT
Less plumbing.
More capability.
Discover. Generate. Execute.
Launch Live Demo
04:45 · Live walkthrough
```

The launch link opens `/demo` in the same tab. Footnote: `Conceptual integration architecture. Live demo implementation is prepared separately.` The working lab now does exist; the footnote remains this wording. Shared connectors animate continuously. There is no embedded live terminal on the slide itself.

The slide's Claude Code label describes an external client path. The browser's Run Both path uses this repository's own OpenAI-compatible agent loop, **not Claude Code CLI behind the scenes**. Both can connect to the same NitroStack MCP server implementation.

### Slide 15 — Enterprise AI needs both.

Section: `The takeaway`. Duration budget: 15 seconds. No standard header.

Exact body:

```text
THE TAKEAWAY
MCP gave agents hands.

Code Mode gives them
a programmable interface.

Enterprise AI needs both.

Satyam Soni                                      Thank you.
```

White background. Muted first two statements, dark large conclusion, blue `both.`. Reveal groups begin at delays 0, 1 and 2 seconds, each fading/rising over 0.5 seconds. Signature row is separated by a horizontal line. No slide-specific interaction; Next is disabled.

## 3. Complete working demo: routes, modes and visible UI

### Runtime separation

```text
Audience browser (/demo)
  → same-origin Next.js /api/demo/{status,sources,run,replay,security}
    → local agent HTTP server, 127.0.0.1:4100 (local full execution)
      → one MCP stdio subprocess per mode/run
        → NitroStack travel server
          traditional: individual tools → TravelService → deterministic fixtures
          code: search/get_schema/execute → QuickJS WASM → callTool bridge
                → same registered TravelController/TravelService → same fixtures
      → OpenAI-compatible /chat/completions provider for model decisions
```

Provider requests are made by `runner.ts` in the agent backend. Provider credentials are never sent into MCP subprocesses or browser bundles. Each stdio subprocess gets only PATH, TRAVEL_MODE, TRAVEL_CATALOG_SIZE and NITRO_MCP_PROTOCOL_VERSION from `connectMcp`.

On Vercel, or when `DEMO_HOSTED_REPLAY=1`, **without DEMO_AGENT_URL**, the Next route uses `hostedDemo` directly. No live MCP subprocess/model/sandbox test runs there. It serves genuine saved traces and source files from the bundle, rejects live/security POSTs with 409, and marks status `executionMode:"recorded"`, `hosting:"vercel"`, `providerConfigured:false`. A configured external DEMO_AGENT_URL switches to proxy mode; Vercel requires its URL to begin with HTTPS and can attach DEMO_AGENT_TOKEN as server-side Bearer authorization. This optional external live backend is not implemented/deployed by the frontend itself.

### Local startup and environment

Root `npm run demo` runs `build:lab`, the webpack Next production build, then `scripts/dev-demo.mjs`. The launcher exports saved metrics, attempts Docker Compose startup, starts the lab workspace's agent, and reuses port 3000 if a Next server is already listening; otherwise starts Next. Agent binds to `127.0.0.1:${DEMO_AGENT_PORT || 4100}`. Next dev/start also bind to loopback. Launcher Ctrl+C sends SIGTERM to its owned child processes; Compose dashboard services remain running until separately stopped.

Live execution requires server-only OPENAI_API_KEY and OPENAI_MODEL in `.env.local`. Optional OPENAI_BASE_URL defaults to `https://api.openai.com/v1`; the runner appends `/chat/completions`. The backend loads `.env.local` with dotenv `override:true`. Restart after provider/config changes. No credential values belong in this context file.

Other implementation options: MODEL_MAX_ROUNDS (default 12 logical rounds), MODEL_MAX_COMPLETION_TOKENS (only sent if set), MODEL_SERIALIZE_REQUESTS (`1` coordinates one provider HTTP/retry slot across concurrent runs), MODEL_INPUT_USD_PER_MILLION, MODEL_OUTPUT_USD_PER_MILLION and MODEL_CACHED_INPUT_USD_PER_MILLION (default cached rate = input rate). DEMO_AGENT_PORT must match proxy configuration. There is no provider-specific Groq SDK; the recorded model ID is `openai/gpt-oss-120b`.

### Initial page and controls

The lab uses Geist Variable typography, white cards and amber/purple comparison colors. Header: NitroStack logo and `NitroStack / execution lab` link back to `/?slide=14`; center `NITROSTACK 1.1.3`, connection indicator and configured model or `Provider not configured` / `Connecting to local agent`; `Back to the talk` link. The center header is CSS-hidden below 1100 px.

Intro: `SAME CAPABILITIES. DIFFERENT INTERFACE.` / `From tool calls to code.` (`code.` purple). Mode buttons `Live execution` and `Recorded replay`. Hosted status forces replay and disables Live execution with tooltip `This deployment uses genuine recorded executions.` Mode switches reset displayed results and cannot be used during a run.

Prompt field label: `❯ AGENT REQUEST`, secondary label `Editable natural language`; textarea max length 6000. Default exact prompt:

> Find flights from Bengaluru to Sydney under ₹40,000, check their baggage allowances, and return the three cheapest options with at least 20 kg of checked baggage.

Catalog selector `TOOL CATALOG` / accessible `Tool catalog size`: 10, 100 or 1,000 capabilities. Default 10. Prompt and catalog are disabled during execution and replay. The “Editable” label remains even when replay locks the field.

Local-live buttons: `Run Tool Calling`, `Run Code Mode`, `Run Both`; replay hides the first two global buttons and changes the third to `Replay both modes`. Replay adds independent `Replay` buttons on the two panel headers, accessible as `Replay Tool Calling` / `Replay Code Mode`. These replay only that mode and preserve the other panel's events/metrics/result. A new live run, even a single mode, clears both panels. While any run/replay is active, other starts are disabled; `Cancel` aborts the browser stream. When idle it becomes `Reset`, which clears displayed events, metrics, traces, error, security output, replay metadata and inspector without deleting recordings or clearing the selected recording.

Status is fetched on mount, after session completion, and via error `Check connection`. The Grafana component independently polls status every 5 seconds. Initial selected recording is the latest entry containing both modes, unless the current selection remains valid. In replay, changing the selection restores its recorded prompt/catalog.

Replay banner: `RECORDED REPLAY · NOT LIVE`; before playback `Choose a previously recorded genuine execution. Replay makes no model requests.`; during/after playback `Genuine execution recorded LOCAL_TIMESTAMP · accelerated playback`. Selector label `Genuine recording`; options show local recorded date/time, catalog tools and mode names. Only paired recordings are offered, even locally where `/status` can list additional single-mode captures. No recording label claims that playback is live.

Errors show a red alert, message, `Check connection` and dismiss X. If local provider credentials are missing, a separate message instructs setting OPENAI_API_KEY and OPENAI_MODEL in `.env.local`, then restarting `npm run demo`.

Tabs: `Execution`, `Architecture`, `Build Mode`. The right-side label is currently **`Live flight availability`** (hidden below 750 px); despite that label, every travel result is deterministic fixture data. This is a current UI wording mismatch, not an actual live availability integration.

### Execution view and event inspector

Two side-by-side panels (stacked below 750 px):

- `Tool Calling` — `Individual tools. Model-driven orchestration.` Initial `Every tool, in context.` / `The model sees the exposed catalog and decides which calls to make.`
- `Code Mode` — `Discover. Generate. Execute in the sandbox.` Initial `One programmable interface.` / `The model discovers relevant capabilities, then writes JavaScript for QuickJS.`

Both initially say `Waiting for a real execution`. Status badges: Ready, Running, Complete, Recorded, Failed as applicable. Running icon rotates once per second. Panel scroll regions have bounded heights and auto-follow appended events while within 65 px of the bottom; scrolling up disables following, and `Jump to latest` reenables it.

Timeline excludes `code.generated` rows and shows all other events as clickable buttons. Each enters from opacity 0 / y=5. Model requests are categorized `MODEL INTERACTION N`; other categories use their event type. Row contains glyph, event name and rounded duration in ms when present, otherwise original local clock time (`en-GB`). Rows are inspection controls, not mocked execution steps.

Inspector opens a fade-animated modal with `MODE · event.type`, event name, original timestamp, optional duration with one decimal, and pretty JSON payload. Text: `Credentials and sensitive headers are redacted server-side.` Close by X, backdrop or Escape.

The Code Mode panel shows **only the latest** `code.generated` event's code under `ACTUAL MODEL-GENERATED JAVASCRIPT` / `ES2020`, in `generated-workflow.js`. Exact note: `Runtime instrumentation reports tool boundaries; line-level highlighting is unavailable.` Earlier generated scripts remain in event data/source recordings; they are not separate editors in this panel. Architecture's recent-event list can expose a recent code.generated payload. The slide 10 highlight animation must not be presented as instrumentation of this real JavaScript.

Completed result card: `FINAL RESULT · SAMPLE DATA` or `RECORDED RESULT · SAMPLE DATA`, ranked option rows with airline, id/flightId, checkedKg and INR price, then explanation. If options are missing/empty it renders the raw string or JSON answer. Trace errors render a panel failure box. Footer says REPLAY / LIVE TRACE / AWAITING EXECUTION plus event count and underlying calls. While incomplete the call count is derived from tool.start events; once a trace exists it uses trace.metrics.toolCalls.

Below: metrics table `MEASURE THE DIFFERENCE` or `RECORDED MEASUREMENTS`, heading `Same task. Actual numbers.`, then actual embedded Grafana. Metrics initially show em dashes. Full formulas are in section 6.

### Architecture view

Traditional vertical stack: `Language model` → `MCP client` → `Individual MCP tools`.

Code stack: `Language model` → `search · get_schema · execute` → `QuickJS sandbox` → `Authorized MCP tools`.

Each stack shows `Awaiting execution` or `Event driven` and `LATEST EVENT`. Latest model event highlights the first node; MCP/discovery events highlight the second; code.generated highlights the Code Mode sandbox; tool events highlight the final capability layer. Capability nodes count tool.start events. Every new latest event sends an amber/purple circle down the SVG connectors over 0.7 seconds while fading; the arrows depict both request and return directions. This animation is coarse event-driven visualization, not packet-level tracing.

Security card text: `A real boundary. A bounded runtime.` / `QuickJS WebAssembly · 64 MB heap · 2 second timeout · 40 tool calls per script` / `Only registered capabilities. No Node.js globals. Sandboxing complements authentication and authorization.`

Local `Test actual execution timeout` starts a separate Code Mode connection, lists tools, and calls `execute` with `while (true) {}`. MCP client timeout for that test is 10 seconds; sandbox execution timeout is 2000 ms. Response includes result, `blocked` based on MCP isError, measured wall time and `lineInstrumentation:false`. UI shows `BLOCKED BY THE SANDBOX` or `UNEXPECTED RESULT — inspect response`, the configured timeout and actual wall time, code and pretty result. It is disabled during runs, during a test, without status, and in hosted replay mode. It does not create a comparison recording. Backend busy lock prevents overlap with a live run.

`LIVE EVENT INSPECTOR` lists the last five events of each mode, concatenated traditional first and code second (not globally timestamp-sorted). Clicking opens the same modal. Empty message: `Run a workflow to inspect real MCP, model and tool events.` These labels remain even when inspecting replayed events.

### Build Mode and five-stage walkthrough

Build Mode fetches `/api/demo/sources` only on first opening and retains the response. Sidebar `THE WORKING PROJECT` exposes exactly eight files, in this order:

1. `travel-lab/src/app.module.ts`
2. `travel-lab/src/travel.tools.ts`
3. `travel-lab/src/travel.service.ts`
4. `travel-lab/src/dataset.ts`
5. `travel-lab/src/server.ts`
6. `travel-lab/src/mcp-client.ts`
7. `travel-lab/src/runner.ts`
8. `travel-lab/package.json`

The full exact displayed file contents are included in Appendix B. File buttons select the real source; a scrollable numbered editor displays it. `Copy file` and command copy buttons write the clipboard and show a check for 1500 ms. Failure reports `Clipboard unavailable. Select and copy the visible command.` Source note: `These files are read from the running project. No illustrative SDK methods.` Link: `Official Code Mode documentation` → `https://docs.nitrostack.ai/docs/templates/code-mode`. This is an existing link, not an assertion that remote docs were refreshed for this document.

Only while app.module.ts is selected, a diff shows:

```text
TRADITIONAL MCP
TRAVEL_MODE=traditional
transforms: []

CODE MODE
TRAVEL_MODE=code
transforms: [new CodeModeTransform(sandboxOptions)]
```

`COPYABLE WALKTHROUGH COMMANDS` displays:

```sh
npx @nitrostack/cli@1.1.3 init travel-example --preset code-mode --skip-install
npm run build:lab
npm run demo
claude mcp add --transport stdio --env TRAVEL_MODE=traditional --env TRAVEL_CATALOG_SIZE=10 travel-traditional -- node travel-lab/dist/server.js
claude mcp add --transport stdio --env TRAVEL_MODE=code --env TRAVEL_CATALOG_SIZE=10 travel-code -- node travel-lab/dist/server.js
claude mcp list
npm run record:demo
```

Command keys are scaffold, build, start, traditional, code, inspect and record. Hosted source commands use the relative server path above; local backend generates the same two Claude commands with this checkout's absolute compiled-server path. Scaffolding is a teaching command; startup does not scaffold or rewrite the existing project. For the external Claude Code path, select one travel MCP configuration at a time to avoid mixing tool surfaces. Browser execution does not require those Claude CLI commands.

Fixed lower stage bar reads `5 MINUTE WALKTHROUGH`, has numbered buttons 1–5, selected title/caption, `[ ] change stage · 1–5 jump`, and Next presenter stage. Shortcuts ignore editable controls and Meta/Ctrl/Alt. Navigation **does not start any model request**.

| Stage | Exact title | Exact caption | View and selected file/effect |
| --- | --- | --- | --- |
| 1 | The working tools | Inspect the travel server and live dataset. | Build Mode, travel.tools.ts |
| 2 | One configuration change | Enable NitroStack’s real CodeModeTransform. | Build Mode, app.module.ts |
| 3 | A different tool surface | Connect Claude Code. Compare tools/list. | Architecture; sets activeFile=mcp-client.ts for future Build Mode |
| 4 | Let the model write the workflow | Run the same prompt through both MCP configurations. | Execution; activeFile=runner.ts |
| 5 | Measure what happened | Inspect measured usage, tool calls and execution latency. | Execution; smooth-scroll metrics into view |

`1`–`5` jump, `[`/`]` decrement/increment with clamping; Next is disabled at stage 5. The stages are navigation labels, not an automatic timed sequence. On narrow screens stage caption, shortcut hint and supporting stage sentence are hidden.

## 4. Actual NitroStack implementation

Pinned SDK/CLI: **@nitrostack/core 1.1.3**, **@nitrostack/cli 1.1.3**. The lab is a separate ESM TypeScript workspace; it builds to `travel-lab/dist` with decorators and emitted metadata. Root typechecking excludes this workspace and generated Render context. MCP client uses `@modelcontextprotocol/sdk` stdio transport.

The actual application configuration (full source also in Appendix B) is:

```ts
export const mode = process.env.TRAVEL_MODE || "traditional";
export const sandboxOptions = {
  workerPoolSize: 1,
  memoryLimitMb: 64,
  timeoutMs: 2000,
  maxToolCalls: 40,
  allowDestructive: false,
  executeToolDescription:
    'Execute an ES2020 JavaScript async function BODY in QuickJS. The code string runs directly inside an async function. Use top-level await callTool(name, argsObject) and return the final JSON value. Do NOT submit a bare async arrow function or uninvoked function declaration; those do not execute. Do not use Markdown fences, TypeScript types or imports. Contract example: const result = await callTool("tool_name", {}); return result;',
};
```

`@McpApp`: module AppModule; server name `travel-${mode}`, version `1.0.0`, MCP protocol version `2025-06-18`; error-level logging; stdio transport; `transforms: mode === "code" ? [new CodeModeTransform(sandboxOptions)] : []`. `@Module`: name travel, controller TravelController, provider TravelService. `server.ts` imports reflect-metadata, creates the MCP app with McpApplicationFactory, starts stdio, and stops the server/worker pool on stdin end.

The actual transform behavior was checked against the locally installed 1.1.3 implementation in `node_modules/@nitrostack/core/dist/core/transforms/code-mode/`:

- Replaces the visible catalog with default synthetic meta-tools **search, get_schema, execute**. SDK supports always-visible passthrough tools, but this application configures none; all tested catalog sizes expose three tools in Code Mode.
- Retains the raw tool catalog and builds a BM25 index. Search ranks names/descriptions; an omitted/blank query browses a brief index. Authorization filtering is performed via the registry resolution chain. Search returns names/descriptions, not all input schemas. `search` accepts optional `query` and `limit`; exact runtime output is a text MCP result.
- `get_schema({tools:[...]})` returns the selected tools' descriptions and JSON input schemas in text sections. Unauthorized/unknown names are reported as not found. It is **not** a generated camelCase TypeScript client in this lab.
- `execute({code:"..."})` sends an ES2020 script body into the configured worker pool. The guest evaluator wraps it in an async function, injects async callTool and bridges calls back to host-side registered handlers. Result is serialized as text (strings kept as strings; other values JSON encoded, undefined/null normalized to null). An uninvoked async function expression is not a valid workflow body for this contract.
- Each callTool increments the per-script tool-call circuit breaker; more than 40 is rejected. Target resolution consults the registry/authorization chain and rejects calls to the Code Mode meta-tools themselves. Unknown tools fail. The destructive guard rejects destructive operations unless allowed; omitted destructive hints are treated conservatively unless readOnlyHint opts out. App tools explicitly declare readOnlyHint true, destructiveHint false, idempotentHint true and openWorldHint false.
- Execution uses QuickJS WebAssembly hosted by worker threads, not Node eval, Cloudflare Workers or a general browser runtime. No process, require or fetch is supplied to guest code. Heap/time limits and worker recovery are SDK mechanisms. The application has **no custom identity provider, user login or per-user authorization module configured**; its local protection is loopback/stdin isolation, fixed registered read-only capabilities, origin checks and the SDK's capability/destructive checks. Conceptual authorization diagrams do not imply a deployed enterprise IAM integration.

### Real tool catalog and data

At every size the first ten tools are:

| Tool | Inputs | Actual behavior |
| --- | --- | --- |
| search_flights | from, to; optional positive maxPrice; availableOnly default true | Normalize Bengaluru/Bangalore→BLR and Sydney→SYD; exact route match, exclusive price bound, seats>0 unless explicitly disabled; sort ascending; return `{sampleData,dataset,flights}` with available flag; **strip checkedKg** |
| get_flight_details | flightId | Full fixture, including baggage |
| compare_fares | flightIds array, 1–30 | Sorted price/seats summaries with sampleData and INR |
| get_baggage_policy | flightId | `{sampleData,flightId,checkedKg,cabinKg:7,includedInFare:true}` |
| check_availability | flightId | Seats and boolean available |
| get_airline_details | airlineCode | First matching carrier; Economy/sample support directory |
| get_airport_details | airportCode (IATA or city alias) | Fixture airport code/city/name/country |
| get_cancellation_policy | flightId | INR 3500 fee; permitted before 24 hours |
| get_refund_policy | flightId | Refundable, 7 business days, INR 3500 fee |
| get_layover_details | flightId | Via airport with 120-minute stop, or no stops |

Tool definitions use Zod input schemas. TravelController has empty prefix; methods are created dynamically for every definition and registered with the real NitroStack Tool decorator. Each dispatch emits structured `TRAVEL_EVENT` lines to stderr: tool.start with UUID/name/args/timestamp; tool.end with result/duration; or tool.error with error/duration. The MCP client parses these lines while stdout remains the MCP transport. These are how underlying controller invocations are counted and inspected, including calls made inside execute.

TRAVEL_CATALOG_SIZE is limited to 10, 100 or 1000; other values throw. Extra definitions are callable deterministic reference lookups named `reference__DOMAIN__REGION__FACET` until the requested count is reached. Domains: hotel, rail, car_rental, insurance, visa, cruise, ferry, tour, loyalty, transfer, accessibility. Regions: india, australia, singapore, malaysia, thailand, japan, uk, france, uae, usa. Facets: eligibility, fees, cancellation, refund, amenities, availability, documents, support, restrictions. Inputs are optional referenceId and locale; defaults standard / en-IN. Results include sampleData, dataset, domain/region/facet, one policy record, currency INR, serviceWindowHours 24 and total 1. These are real registered sample handlers, not live external integrations and not merely fake tool-name padding.

Dataset `travel-fixtures-2026-11-v1`: all flights BLR→SYD, INR per adult, sampleData true. Full fixture values are reproduced in Appendix B; eligibility-relevant data:

| ID | Airline | Price INR | Checked kg | Seats | Via | Minutes |
| --- | --- | ---: | ---: | ---: | --- | ---: |
| NS-101 | IndiGo | 29,800 | 15 | 8 | SIN | 930 |
| NS-102 | Air India | 36,400 | 25 | 6 | DEL | 1080 |
| NS-103 | Singapore Airlines | 38,900 | 30 | 4 | SIN | 870 |
| NS-104 | Malaysia Airlines | 33,700 | 20 | 5 | KUL | 960 |
| NS-105 | Qantas | 43,200 | 30 | 7 | direct | 690 |
| NS-106 | SriLankan Airlines | 31,900 | 30 | 0 | CMB | 1170 |
| NS-107 | Thai Airways | 35,200 | 20 | 3 | BKK | 1020 |
| NS-108 | Scoot | 27,300 | 0 | 9 | SIN | 1110 |
| NS-109 | Cathay Pacific | 39,500 | 23 | 2 | HKG | 1210 |
| NS-110 | Air India | 37,800 | 25 | 1 | BOM | 1000 |

Expected main-prompt answer, in order: **NS-104 / Malaysia Airlines / ₹33,700 / 20 kg; NS-107 / Thai Airways / ₹35,200 / 20 kg; NS-102 / Air India / ₹36,400 / 25 kg**. Sold-out NS-106 is excluded even though cheap and baggage-eligible. Scoot and IndiGo fail baggage; Qantas fails the price bound. Other eligible flights cost more. No booking/payment mutation is implemented.

## 5. Actual agent loop, genuine capture and replay

### Live execution sequence

1. UI POSTs `/api/demo/run` with `{mode:"traditional"|"code"|"both",prompt,catalogSize}`. Proxy validates same-origin/fixed endpoint; local backend enforces mode, 10/100/1000 catalog and a nonblank prompt up to 6000 characters. Body limit is 24,000 characters. A global local-backend busy flag rejects overlapping live runs/security tests with 409.
2. Backend opens SSE, sends session.start, runs the requested modes with **Promise.all** and separate subprocesses, and sends a heartbeat comment every 10 seconds. Cancel/disconnect aborts the controller; runner observes abort and closes its MCP connection.
3. Runner emits run.start, connects stdio, emits discovery.request and walks all paginated tools/list pages. It maps returned MCP inputSchema to Chat Completions function parameters and exposes the full result. It does not silently curate the traditional 100/1000-tool catalogs; a provider tool-count/context restriction may legitimately fail the run.
4. It records exposed count and serialized definition bytes/token estimate. Missing provider key/model then produces an honest error, before any model request.
5. System instructions identify deterministic sample data, INR adult prices, availability and baggage constraints, JSON final answers with options/explanation/sampleData, and allowed capabilities. Traditional mode is instructed to choose individual tool calls according to dependencies. Code Mode is additionally instructed to search, inspect exact schemas, use execute with an async-function **body**, use callTool directly, keep intermediate data inside the sandbox where useful, avoid Node globals/imports/Markdown and avoid calling meta-tools through callTool.
6. Each logical round sends model/messages/function definitions, tool_choice auto and optional max_completion_tokens to the compatible provider. It allows six HTTP attempts per round (five retries). Every HTTP attempt increments modelRequests. Response timeout is 90 seconds; parent cancellation also aborts it.
7. On HTTP 429, retries use numeric Retry-After or a provider “try again in XmYs” hint; otherwise exponential backoff capped at 30 seconds. Actual wait = clamp(ceil(seconds×1000)+500, 1000, 120000). It emits model.rate_limit. If serialization is enabled, provider slot/queue time and retry waits coordinate across modes; underlying tool calls remain independent/parallel. model.queue events explain the wait.
8. A specific HTTP 400 for an attempted nonexistent tool named JSON can trigger model.repair: retry with tool_choice none and an instruction to answer using already obtained results, without fabricating facts. No fake tool result is inserted.
9. Successful assistant usage is accounted; model.response records message, servedModel, usage and finish reason. The assistant message is appended to the conversation. If it requests tools, all requested calls in that response are executed with Promise.all. Invalid JSON arguments fall back to `{}`. Each is sent via MCP tools/call with a 20-second client timeout; errors become isError text results available to the model. `execute` additionally emits code.generated containing its actual code.
10. The **complete JSON-serialized MCP response** is appended as a role=tool message and its UTF-8 byte count added to intermediateBytes. This applies to individual tools, search, schemas, execute results and error results. Then another logical model round occurs with full accumulated history and the same initially visible function definitions.
11. If no tool calls remain, assistant text is trimmed, outer JSON Markdown fences stripped if present, and unpacked as JSON when possible. finish_reason length raises an error. Otherwise trace is marked complete, answer retained and run.complete emitted. Non-JSON final text can remain a string for other prompts. Default logical round budget is 12; retries do not consume extra logical rounds but do count extra HTTP requests.
12. Errors emit run.error and retain an error trace. Finally MCP is closed and final latency updated to include cleanup. Backend validates main-prompt answers and saves only successful nonempty trace sets, then sends session.complete with traces and recordingId.

### Recording integrity

`saveRecording` applies `mainResultError` only when prompt.trim() exactly equals MAIN_PROMPT and trace was complete. It requires option IDs exactly equal `[NS-104,NS-107,NS-102]` in order and price/checkedKg exactly equal fixtures. Failure changes trace to error, retains the answer for inspection, and prevents recording. Other prompts are not judged against this task's answer. Do not describe this as general semantic validation.

Successful recordings are version 1 JSON, UUID file name, top-level recordedAt, prompt/catalog/model and traces. Every trace has runId, mode, original start recordedAt, dataset, events, metrics, answer/status/error. Sensitive keys/string credentials are redacted before save/stream. Local redaction removes the configured key, Bearer values, sk- patterns and keys matching authorization/cookie/api-key/password/secret/credential/token (token count fields remain numeric). Hosted sanitization also handles gsk_ patterns and DEMO_AGENT_TOKEN.

`npm run record:demo` runs the actual model in both modes concurrently for MAIN_PROMPT/catalog 10, writes a redacted ignored `.debug/last-attempt.json`, checks expected option IDs, then calls saveRecording for the stronger fixture-value validation. No test double is offered as a saved successful recording. Recording a single live mode can produce a valid single-mode file, but the comparison selector/exporter require a paired file.

### Replay mechanics

Replay POST body `{id,mode}`; mode may be traditional/code/both (omitted means both). UUIDs are validated, and the chosen comparison must contain complete traces for both modes even when replaying just one. Backend/hosted handler filter to the requested mode, flatten its events, sort by original timestamp and stream session.replay metadata, original events, then session.complete with original traces/metrics and replay:true. Each adjacent event gap is clamped to **0–250 ms**; playback does not scale recorded metric durations or regenerate model messages. Hosted reads are credential-free and filesystem read-only. All counters during playback come from saved snapshots/events, not playback CPU/network time.

### The paired recording actually offered by the current UI

File: `travel-lab/recordings/5ea9dc58-41b9-4478-b413-016051667784.json`. Top-level recordedAt **2026-11-25T14:14:04.469Z** (19:44:04.469 Asia/Kolkata). Model `openai/gpt-oss-120b`, catalog 10, MAIN_PROMPT. Traditional trace starts 14:11:29.088Z, Code Mode 14:11:29.095Z. Both return the three expected flights.

Traditional recorded MCP sequence: search_flights(BLR,SYD,maxPrice=40000), then separate get_baggage_policy calls for NS-108, NS-101, NS-104, NS-107, NS-102, NS-110, NS-103. Eight underlying calls total. There are nine successful model responses, ten model.rate_limit events, five model.queue events and **19 actual model HTTP attempts**. It does not call compare_fares in this recording.

Code Mode sequence: `search({limit:10})` (query omitted, browsing the catalog), `get_schema({tools:["search_flights","get_baggage_policy"]})`, then **two execute calls**. Exact code of the first:

```js
const result = await callTool('search_flights', {from: 'BLR', to: 'SYD', maxPrice: 40000}); return result;
```

Exact code of the second:

```js
const flightIds = ['NS-108','NS-101','NS-104','NS-107','NS-102','NS-110','NS-103','NS-109'];
const promises = flightIds.map(id => callTool('get_baggage_policy', {flightId: id}));
const results = await Promise.all(promises);
return results;
```

Thus this paired Code Mode run returns a flight array to the model, then a baggage array to the model; the final filtering/selection is reflected in its assistant answer. It is **not** an optimized single script that returns only three final options. Nine underlying calls (one search plus eight baggage); four MCP meta-tool requests/responses, five successful model responses, four rate-limit events, five queue events and nine model HTTP attempts. UI's generated-code editor ultimately shows the second script only. These details explain why the real recording differs from the simplified architectural examples.

The repo also has four complete single-mode captures (listed in the generated inventory appendix). They are not selectable paired comparisons and are not exported to the recorded Grafana data. Some contain one combined search/baggage/filter script, but they must not be substituted into this pair's metrics.

## 6. Execution metrics: exact semantics and calculations

The comparison UI rows, in order: `Exposed tools`; `Initial tool definition tokens` (estimated); `Total model input tokens`; `Total model output tokens`; `Model API requests`; `Underlying tool calls`; `Tool response bytes sent to model` (B); `Execution wall time` (ms); `Estimated inference cost` (USD).

Heading note: `Provider usage when available. Definition counts use UTF-8 bytes ÷ 4.` / `Cost requires configured model pricing. No guaranteed improvement.` Method note: `Latency includes MCP startup, model requests and cleanup. Response bytes include all MCP responses supplied to the model, including discovery schemas and execution results. Underlying API calls are counted independently from model requests.`

| Metrics field | How it is obtained |
| --- | --- |
| catalogSize | Selected raw catalog size (10/100/1000), not number of exposed meta-tools |
| exposedTools | Total tools from paginated tools/list before model loop |
| initialDefinitionBytes | Buffer.byteLength(JSON.stringify(functions)); functions = `{type:"function",function:{name,description,parameters:inputSchema}}[]` |
| initialDefinitionTokens | ceil(serialized UTF-8 bytes / 4), an estimate, not a model tokenizer or billing count |
| inputTokens | Sum successful reply usage.prompt_tokens when both input/output counts are finite; otherwise per-round estimateTokens(request body) |
| outputTokens | Sum usage.completion_tokens; otherwise estimateTokens(assistant message including tool calls) |
| cachedInputTokens | Sum usage.prompt_tokens_details.cached_tokens or 0; tracked separately, already included in inputTokens |
| usageSource | provider if all counted rounds report usage, estimated if none do, mixed if both paths occur |
| modelRequests | Increment once before **each actual HTTP provider request**, including retries/rejections; not the logical loop index or number of successful replies |
| toolCalls | Increment only on actual TravelController tool.start stderr events, including those inside execute; not on search/get_schema/execute meta-tool invocations |
| intermediateBytes | Sum Buffer.byteLength(JSON.stringify(full MCP result)) for each requested tool/meta-tool response appended to the model history, including errors; internal handler data stays out unless returned by execute |
| latencyMs | Rounded performance.now()−start; starts before MCP connection, updated on every event and finally after connection cleanup; includes provider queues/retries and contention |
| costUSD | null unless input and output price env values are present and all prices are finite/nonnegative; formula below |

Cost formula:

```text
((inputTokens − cachedInputTokens) × inputPricePerMillion
 + cachedInputTokens × cachedPricePerMillion
 + outputTokens × outputPricePerMillion) / 1,000,000
```

Missing cached price defaults to input price. This is an inference estimate only; no provider billing verification, infrastructure charge or comprehensive discount model. Failed HTTP attempts add to request count but are not given invented token usage/cost. Reported usage is accumulated from successful assistant replies, not recomputed from all event payloads.

Per-row comparison uses `(traditional − code) / traditional × 100`. UI only shows a percentage when **both traces are complete** and baseline is a positive number. It shows absolute value to one decimal plus less/more/difference according to sign. No percentage for zero/missing/null baseline. Raw values are rounded for display with en-IN grouping; USD uses five decimal places. Definition estimate badge is always visible; input/output show estimated / mixed if applicable. Bar width is value divided by the row's max (minimum max 1), animated over 0.35 seconds.

Exact selected-pair measurements:

| Field | Tool Calling | Code Mode | UI comparison where applicable |
| --- | ---: | ---: | --- |
| exposedTools | 10 | 3 | 70.0% less |
| catalogSize | 10 | 10 | Not a UI row |
| initialDefinitionBytes | 4,517 | 1,984 | Not a UI row |
| initialDefinitionTokens | 1,130 | 496 | 56.1% less |
| inputTokens | 19,248 | 9,648 | 49.9% less |
| outputTokens | 1,468 | 944 | 35.7% less |
| cachedInputTokens | 2,048 | 1,024 | Not a UI row |
| modelRequests | 19 | 9 | 52.6% less |
| toolCalls | 8 | 9 | 12.5% more |
| intermediateBytes | 4,114 | 7,425 | 80.5% more |
| latencyMs | 155,356 | 83,124 | 46.5% less |
| costUSD | null | null | — |
| usageSource | provider | provider | No estimate/mixed usage badge |

Model requests include the original provider retries. Both traces ran concurrently and shared local/provider resources; these are observations of one saved run, not a controlled benchmark or a guaranteed improvement. The 4-versus-2 illustrative model-turn counters on slide 06 are a different quantity from 19-versus-9 actual HTTP attempts here.

### Actual Grafana and Prometheus

Grafana is an actual iframe, not an imitation chart built into React. Local address `http://localhost:3300/d/travel-agent-demo`; Prometheus at `http://localhost:9095`. The hosted Render context uses Grafana 13.2.1 and Prometheus 3.8.0; local Compose pins Grafana 12.3.0 and Prometheus 3.8.0. Render blueprint uses `plan: free`, Singapore, self-contained `observability/render` Docker context, `/api/health`, GOMEMLIMIT=128MiB, GOMAXPROCS=2 and unified alerting disabled. No Google Cloud instance is created by these files. The `observability/cloud-run` folder contains templates/alternative instructions, not evidence of a deployed Google Cloud service.

`prepare-observability.mjs` copies hosting configuration/exporter and only complete paired **aggregate recording fields** (no raw events, prompts or generated scripts) into a build context. It changes dashboard title to `NitroStack · Recorded agent execution` and tags to nitrostack/mcp/recorded. Docker's Node build stage runs the exporter; the final image runs a loopback-only metrics HTTP server (127.0.0.1:9096), loopback Prometheus (127.0.0.1:9090) and Grafana on PORT/default 8080. Grafana runs as user 472; ephemeral data is under /tmp; per-container bootstrap admin password is randomly generated and not printed. Anonymous role is Viewer; login form/basic auth/signup disabled; iframe embedding allowed; CSP frame-ancestors only self and `https://code-mode-presentation.vercel.app`. Prometheus retention is 1 hour/128 MB, query concurrency 2, max samples 100000, timeout 10 seconds. Idle free hosting can cold-start; no persistent history is promised.

Frontend uses server-only GRAFANA_PUBLIC_URL from status. It polls every 5 seconds. Hosted health requires HTTPS, an OK `/api/health` response and JSON `database === "ok"` within 4 seconds, rejecting host startup HTML. Root URLs become `/d/travel-agent-demo`. It sets orgId=1, theme=dark, kiosk=true, refresh=2s and var-recording=selected UUID. Actual Grafana can enforce its own minimum refresh interval. Iframe is lazy-loaded, keyed by recording ID and only shown when healthy plus a selection exists; height 2100 px, 2600 px below 750 px viewport. Open Grafana opens a new tab. Connection checker can be retriggered manually.

Wrapper labels: `GRAFANA · PROMETHEUS`; `Live agent execution` locally or `Recorded agent execution` hosted; Live/Connecting or Connected/Not connected. Hosted cold-start message `Waking up the Grafana dashboard.` and `The free hosted instance may take about a minute to start. Connection checks continue automatically.` Missing hosted URL says `Grafana is not connected to this deployment.` Local unavailable message says `Waiting for the local Grafana instance.` and `npm run observability:start`. These labels depend on hosting, not the replay toggle.

Exporter `travel-lab/src/observability.ts` writes Prometheus text atomically via metrics.tmp→metrics.txt, only when content changes. It reads complete paired recording JSONs into per-mode snapshots and exports every finite numeric Metrics property as a gauge `agent_demo_measurement` with labels source, recording_id, mode, model, usage_source, metric. Null costUSD and nonnumeric usageSource are not numeric measurements. Original capture time is a separate `agent_demo_recorded_timestamp_seconds` gauge. Live event snapshots are separately exported as source=live / recording_id=live, coalesced at 100 ms. Prometheus scrapes every 2 seconds.

**All current dashboard panel queries select source="recorded" and the chosen recording ID**, even the panel titled `Live measurements`. The local dashboard title `NitroStack · Live agent execution` and that last panel title are legacy labels; they do not change query semantics. The over-time plots show repeated scrapes of saved snapshot totals across the dashboard's current time window, **not the original run's within-execution timeline**. Original event timing belongs to replay; capture timestamp belongs to the separate timestamp metric. This distinction matters when explaining the bottom dashboard.

Dashboard UID `travel-agent-demo`, datasource UID `travel-prometheus`, default time `now-15m` to `now`. Panels in configured order:

1. Exposed tools (stat)
2. Definition tokens (stat)
3. API requests (stat)
4. Underlying tool calls (stat)
5. Model input tokens (bar gauge)
6. Model output tokens (bar gauge)
7. Latency (bar gauge; latencyMs / 1000, seconds)
8. Traffic (bar gauge; **initialDefinitionBytes + intermediateBytes**, grouped by mode)
9. Input token delta (stat)
10. API request delta (stat)
11. Latency delta (stat)
12. Traffic delta (stat)
13. Input tokens over time (time series)
14. API requests over time (time series)
15. Tool calls over time (time series)
16. Latency over time (time series, seconds)
17. Traffic over time (time series)
18. Mode comparison (bar gauge: input tokens, output tokens, API requests, tool calls)
19. Live measurements (table; recorded-source query)

First three rows are four panels across (24-column grid), then paired time series, full-width traffic/mode comparison/table. PromQL relabels raw mode code/traditional to Code Mode/Tool Calling for display. Delta formulas use 100 × (traditional−code)/traditional. **Grafana Traffic is not the same as the frontend response-bytes row:** selected pair totals are 8,631 bytes traditional and 9,409 bytes Code Mode, including initial definitions once. It is not a full network-wire byte counter and does not multiply definition size by every repeated HTTP request. Exact queries are reproduced in Appendix D.

## 7. Existing verification and interpretation boundaries

Repository tests use real stdio MCP transports and real QuickJS for parity on eligible flights, actual 100/1000 catalogs, search/schema retrieval, timeout, unknown capability denial, missing Node globals and worker recovery, plus redaction/result validation. A provider test double exercises runner retries, parallel calls, JSON-tool repair and usage accounting; it is explicitly test-only and is not the recorded live demo. Hosted tests check complete paired inventory, replay validation, exact saved answers/metrics, one-mode isolation, rejected live/security requests, source allowlist and Grafana startup-page rejection. This documentation task did not run models, regenerate recordings, modify tests or deploy anything.

Preserve these distinctions when using this context later:

- Slides 02/04/06/10/11/12 are teaching visuals or local simulations, not the actual measured backend.
- The 300-tool slide catalog and the real 10/100/1000-tool NitroStack catalogs are separate implementations.
- Typed SDK/camelCase examples illustrate the pattern; actual 1.1.3 code uses callTool with snake_case registered names and JSON schemas.
- Browser agent execution is OpenAI-compatible; external Claude Code is an optional MCP client path.
- Screenshot adoption/savings claims are third-party reports and screenshot content, not this project's benchmark.
- Recorded replay makes no model requests; shown usage/latency belongs to the original captured execution.
- Public Vercel code defaults to replay, not a credentialed live agent. Actual sandbox timeout test is local-only in that mode.
- UI wording such as Live flight availability, Live measurements and Inspect the travel server and live dataset does not override deterministic fixture behavior.
- The audience footer timer is removed. Existing presenter timer/notes remain; the current metadata budgets total 1200 seconds (20:00), matching the separately hard-coded presenter clock target.


## Appendix A. Exact existing slide metadata and presenter notes

These are existing strings from `lib/slides.ts`, transcribed without writing new speaker material. Standard-header visibility is described in sections 1–2.

| Index | Metadata title | Section | Budget seconds |
| --- | --- | --- | ---: |
| 00 | Solving the Agent Integration Layer for Enterprise AI | The integration layer | 0 |
| 01 | Giving AI agents hands | The foundation | 45 |
| 02 | MCP works. Until we scale. | The scaling problem | 60 |
| 03 | The context window problem | The scaling problem | 75 |
| 04 | What if agents could write code instead? | A different interface | 90 |
| 05 | The original Code Mode announcement | A different interface | 30 |
| 06 | From tool calling to code execution | A different interface | 100 |
| 07 | Anatomy of Code Mode | Under the hood | 100 |
| 08 | Code Mode comes to Claude Code | Code Mode in practice | 15 |
| 09 | Code Mode: reactions and adoption | Code Mode in practice | 45 |
| 10 | Code is a better interface / for complex workflows | Under the hood | 100 |
| 11 | Discover capabilities. / Don’t load everything. | Under the hood | 90 |
| 12 | Can we trust AI-generated code? | The trust boundary | 90 |
| 13 | Enterprise integration at scale | Putting it together | 60 |
| 14 | Building Code Mode / with NitroStack | From architecture to execution | 285 |
| 15 | Enterprise AI needs both. | The takeaway | 15 |

Total metadata budget: **1200 seconds (20:00)**. The retained presenter clock target is separately hard-coded as 20:00.

### Existing note 00

Welcome. This is a 20-minute technical journey from tool calling to programmable agent execution. Start the timer when moving to slide 1.

### Existing note 01

Anthropic introduced MCP in November 2024 to standardize connections between AI applications and external systems. Think of it as giving agents hands. Tools perform actions, resources expose data, and prompts provide reusable instructions. Today we focus on tools.

### Existing note 02

Walk through tools/list. Clients make tool specifications available to the model; exact loading strategies differ by client. Five travel tools are easy to reason about. What happens when an enterprise exposes thousands of capabilities? Press D to open the demo handoff and switch to your prepared Claude Code terminal.

### Existing note 03

These numbers are illustrative, not a measurement of any specific model. We assume 200k capacity, 20k conversation and 200 tokens per tool. Select 1,000 tools: definitions alone consume 200k tokens. Cost and accuracy depend on model, caching and tool selection. Dynamically enabling tools helps, but external selection can constrain agent autonomy. Can we reduce context without reducing capabilities?

### Existing note 04

The original Code Mode pattern generates TypeScript declarations or an SDK from tool specifications, then gives the model a code execution interface. The runtime still invokes the underlying capabilities. TypeScript is an interface for generation; the runtime executes JavaScript. Compact SDK types alone do not eliminate context limits. Large catalogs also need selective discovery.

### Existing note 05

Kenton Varda announced Code Mode on September 26, 2025: convert MCP tools into a TypeScript API and ask the agent to write code against it, using Dynamic Worker Loading. This is the original post screenshot supplied for the presentation.

### Existing note 06

Keep the request identical in both flows. Tool calling returns intermediate data to the model across dependent steps. Code Mode expresses the sequence in one script and returns a compact result. In this illustrative comparison there are four versus two model turns and three underlying tool calls on both sides. Sorting happens locally. Code Mode does not inherently reduce API calls.

### Existing note 07

Click each layer. The model generates logic. The isolated runtime executes it. Typed bindings translate calls into MCP or API requests. Intermediate state stays in runtime memory. Only a serialized result crosses back into model context. Tool services remain responsible for identity and authorization.

### Existing note 08

Official ClaudeDevs announcement of experimental Code Mode. Explain that Claude writes scripts to compose tool calls.

### Existing note 09

Three supplied screenshots together: Ravve Jay reports being impressed after trying Claude Code's Code Mode; Dheeraj Agrawal shares his own cost comparison; Kenton Varda reflects on adoption across harnesses. User-reported savings are specific to their examples.

### Existing note 10

Play the execution trace. Search flights, sort by price, fetch baggage for the selected flight, and serialize the result. This is illustrative execution, not a real airline integration. Code provides familiar control flow: loops, conditions, parallel execution, filters, transforms and dependent operations. The model generates logic; the runtime performs computation.

### Existing note 11

These are illustrative interface names, not mandated MCP methods. Search locates candidates; get_schema loads only needed contracts; execute runs the generated workflow. Progressive discovery supports broad catalogs while controlling context. Search quality and authorization filtering still matter.

### Existing note 12

Treat generated JavaScript as untrusted. Enforce memory budgets, execution timeouts, scoped tool permissions and tool-call budgets. Isolate runtime access and audit tool operations. Block unauthorized calls at the capability boundary. Sandboxing never replaces authentication or authorization. This diagram is a conceptual security model, not a functioning sandbox.

### Existing note 13

These are common architectural tendencies, not protocol limitations. MCP can also support dynamic discovery and selective loading. Code Mode adds generated executable orchestration on top of capabilities. So far, we have discussed Code Mode as an architectural pattern. How difficult is it to actually build?

### Existing note 14

Live demo agenda (4m45s): 0:00–0:45 scaffold the prepared NitroStack project; 0:45–1:30 enable Code Mode using the version-specific configuration; 1:30–2:15 connect Claude Code to the MCP server; 2:15–3:45 run the flight and baggage workflow; 3:45–4:45 compare discovery, model turns and intermediate data. The /demo route contains the working NitroStack 1.1.3 travel lab. Use the Build Mode tab and five-minute stage shortcuts to explain the actual files. Live runs use the configured OpenAI-compatible provider; genuine saved traces are available in explicitly labeled replay mode.

### Existing note 15

MCP gave agents hands. Code Mode gives them a programmable interface. Enterprise AI needs both. Thank you.

## Appendix B. Exact files displayed in Build Mode

The following are complete file contents at the reviewed commit, in the actual source-selector order. They are source snapshots, not modified examples. Commands and all other slide snippets are documented above.

### `travel-lab/src/app.module.ts`

````ts
import { McpApp, Module, CodeModeTransform } from "@nitrostack/core";
import { TravelController } from "./travel.tools.js";
import { TravelService } from "./travel.service.js";
export const mode = process.env.TRAVEL_MODE || "traditional";
export const sandboxOptions = {
  workerPoolSize: 1,
  memoryLimitMb: 64,
  timeoutMs: 2000,
  maxToolCalls: 40,
  allowDestructive: false,
  executeToolDescription:
    'Execute an ES2020 JavaScript async function BODY in QuickJS. The code string runs directly inside an async function. Use top-level await callTool(name, argsObject) and return the final JSON value. Do NOT submit a bare async arrow function or uninvoked function declaration; those do not execute. Do not use Markdown fences, TypeScript types or imports. Contract example: const result = await callTool("tool_name", {}); return result;',
};
@McpApp({
  module: AppModule,
  server: {
    name: `travel-${mode}`,
    version: "1.0.0",
    protocolVersion: "2025-06-18",
  },
  logging: { level: "error" },
  transport: { type: "stdio" },
  transforms: mode === "code" ? [new CodeModeTransform(sandboxOptions)] : [],
})
@Module({
  name: "travel",
  controllers: [TravelController],
  providers: [TravelService],
})
export class AppModule {}
````

### `travel-lab/src/travel.tools.ts`

````ts
import {
  ControllerDecorator as Controller,
  ToolDecorator as Tool,
  z,
  type ExecutionContext,
} from "@nitrostack/core";
import { randomUUID } from "node:crypto";
import { TravelService, type Input } from "./travel.service.js";
const flightInput = z.object({
  flightId: z.string().describe("Sample flight ID returned by search_flights"),
});
export const definitions: {
  name: string;
  description: string;
  inputSchema: z.ZodTypeAny;
}[] = [
  {
    name: "search_flights",
    description:
      "Search sample flights by origin and destination (IATA or city). Returns an object {sampleData, dataset, flights: [{id, airline, airlineCode, price, seats, from, to, via, durationMinutes, currency}]}. Use result.flights; flight identifier is id. Results are sorted by price ascending and exclude sold-out flights by default; availableOnly:false includes them. Baggage must be looked up separately. Sample data, not live availability.",
    inputSchema: z.object({
      from: z.string().describe("Origin IATA or city, e.g. BLR or Bengaluru"),
      to: z.string().describe("Destination IATA or city, e.g. SYD or Sydney"),
      maxPrice: z
        .number()
        .positive()
        .optional()
        .describe("Exclusive upper price bound in INR"),
      availableOnly: z.boolean().default(true).describe("Return only flights with seats by default; false includes sold-out fixtures"),
    }),
  },
  {
    name: "get_flight_details",
    description:
      "Read complete details for one sample flight including its itinerary and baggage allowance.",
    inputSchema: flightInput,
  },
  {
    name: "compare_fares",
    description:
      "Compare and sort the total INR prices of specified sample flight IDs.",
    inputSchema: z.object({ flightIds: z.array(z.string()).min(1).max(30) }),
  },
  {
    name: "get_baggage_policy",
    description:
      "Look up included checked baggage kilograms and cabin baggage for a sample flight ID. Returns {sampleData, flightId, checkedKg, cabinKg, includedInFare}.",
    inputSchema: flightInput,
  },
  {
    name: "check_availability",
    description:
      "Read available sample seats and availability for one flight ID.",
    inputSchema: flightInput,
  },
  {
    name: "get_airline_details",
    description:
      "Read the sample airline directory by carrier IATA code, e.g. AI, MH, TG or SQ.",
    inputSchema: z.object({ airlineCode: z.string() }),
  },
  {
    name: "get_airport_details",
    description: "Read the sample airport directory by IATA or city name.",
    inputSchema: z.object({ airportCode: z.string() }),
  },
  {
    name: "get_cancellation_policy",
    description: "Read sample cancellation rules and fees for a flight ID.",
    inputSchema: flightInput,
  },
  {
    name: "get_refund_policy",
    description:
      "Read sample refund eligibility, fees and processing days for a flight ID.",
    inputSchema: flightInput,
  },
  {
    name: "get_layover_details",
    description:
      "Read sample stopover airports and connection durations for a flight ID.",
    inputSchema: flightInput,
  },
];
export const catalogSize = Number(process.env.TRAVEL_CATALOG_SIZE || 10);
if (![10, 100, 1000].includes(catalogSize))
  throw new Error("TRAVEL_CATALOG_SIZE must be 10, 100 or 1000");
const domains = [
  "hotel",
  "rail",
  "car_rental",
  "insurance",
  "visa",
  "cruise",
  "ferry",
  "tour",
  "loyalty",
  "transfer",
  "accessibility",
];
const regions = [
  "india",
  "australia",
  "singapore",
  "malaysia",
  "thailand",
  "japan",
  "uk",
  "france",
  "uae",
  "usa",
];
const facets = [
  "eligibility",
  "fees",
  "cancellation",
  "refund",
  "amenities",
  "availability",
  "documents",
  "support",
  "restrictions",
];
for (const domain of domains)
  for (const region of regions)
    for (const facet of facets) {
      if (definitions.length >= catalogSize) break;
      definitions.push({
        name: `reference__${domain}__${region}__${facet}`,
        description: `Read ${facet} reference records for ${domain.replaceAll("_", " ")} in ${region}. Local sample ${domain} policy directory. Accepts a reference ID and locale; returns deterministic reference records with region, category and policy. Not airline flight search or flight baggage.`,
        inputSchema: z.object({
          referenceId: z
            .string()
            .optional()
            .describe("Reference identifier, defaults to standard"),
          locale: z.string().optional().describe("Language locale, e.g. en-IN"),
        }),
      });
    }
@Controller({ prefix: "" })
export class TravelController {
  constructor(private readonly service: TravelService) {}
  async dispatch(name: string, input: Input, _ctx: ExecutionContext) {
    const id = randomUUID(),
      start = performance.now();
    process.stderr.write(
      `TRAVEL_EVENT ${JSON.stringify({ type: "tool.start", callId: id, name, args: input, timestamp: new Date().toISOString() })}\n`,
    );
    try {
      const result = await this.service.invoke(name, input);
      process.stderr.write(
        `TRAVEL_EVENT ${JSON.stringify({ type: "tool.end", callId: id, name, result, durationMs: performance.now() - start, timestamp: new Date().toISOString() })}\n`,
      );
      return result;
    } catch (error) {
      process.stderr.write(
        `TRAVEL_EVENT ${JSON.stringify({ type: "tool.error", callId: id, name, error: String(error), durationMs: performance.now() - start, timestamp: new Date().toISOString() })}\n`,
      );
      throw error;
    }
  }
}
// The real NitroStack method decorator is applied to the generated catalog as well.
for (const definition of definitions) {
  const key = definition.name;
  Object.defineProperty(TravelController.prototype, key, {
    value: function (
      this: TravelController,
      input: Input,
      ctx: ExecutionContext,
    ) {
      return this.dispatch(key, input, ctx);
    },
    configurable: true,
  });
  Tool({
    ...definition,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  })(
    TravelController.prototype,
    key,
    Object.getOwnPropertyDescriptor(TravelController.prototype, key)!,
  );
}
````

### `travel-lab/src/travel.service.ts`

````ts
import { Injectable } from "@nitrostack/core";
import {
  airports,
  airportCode,
  DATASET_VERSION,
  flightById,
  flights,
} from "./dataset.js";
export interface Input {
  from?: string;
  to?: string;
  maxPrice?: number;
  flightId?: string;
  flightIds?: string[];
  airlineCode?: string;
  airportCode?: string;
  referenceId?: string;
  locale?: string;
  availableOnly?: boolean;
}
@Injectable()
export class TravelService {
  async invoke(name: string, input: Input): Promise<unknown> {
    if (name === "search_flights")
      return {
        sampleData: true,
        dataset: DATASET_VERSION,
        flights: flights
          .filter(
            (f) =>
              f.from === airportCode(input.from || "BLR") &&
              f.to === airportCode(input.to || "SYD") &&
              (!input.maxPrice || f.price < input.maxPrice) &&
              (input.availableOnly === false || f.seats > 0),
          )
          .sort((a,b)=>a.price-b.price)
          .map(({ checkedKg, ...f }) => ({...f,available:f.seats>0})),
      };
    if (name === "get_flight_details") return flightById(input.flightId!);
    if (name === "compare_fares")
      return {
        sampleData: true,
        currency: "INR",
        flights: input
          .flightIds!.map(flightById)
          .sort((a, b) => a.price - b.price)
          .map((f) => ({ flightId: f.id, price: f.price, seats: f.seats })),
      };
    if (name === "get_baggage_policy") {
      const f = flightById(input.flightId!);
      return {
        sampleData: true,
        flightId: f.id,
        checkedKg: f.checkedKg,
        cabinKg: 7,
        includedInFare: true,
      };
    }
    if (name === "check_availability") {
      const f = flightById(input.flightId!);
      return {
        sampleData: true,
        flightId: f.id,
        available: f.seats > 0,
        seats: f.seats,
      };
    }
    if (name === "get_airline_details") {
      const f = flights.find((f) => f.airlineCode === input.airlineCode);
      if (!f) throw new Error("Unknown sample airline");
      return {
        sampleData: true,
        code: f.airlineCode,
        name: f.airline,
        cabin: "Economy",
        support: "Sample support directory",
      };
    }
    if (name === "get_airport_details") {
      const code = airportCode(input.airportCode!);
      if (!airports[code]) throw new Error("Unknown sample airport");
      return { sampleData: true, code, ...airports[code] };
    }
    if (name === "get_cancellation_policy") {
      const f = flightById(input.flightId!);
      return {
        sampleData: true,
        flightId: f.id,
        currency: "INR",
        fee: 3500,
        allowedBeforeDepartureHours: 24,
      };
    }
    if (name === "get_refund_policy") {
      const f = flightById(input.flightId!);
      return {
        sampleData: true,
        flightId: f.id,
        refundable: true,
        processingBusinessDays: 7,
        feeINR: 3500,
      };
    }
    if (name === "get_layover_details") {
      const f = flightById(input.flightId!);
      return {
        sampleData: true,
        flightId: f.id,
        stops: f.via ? [{ airport: f.via, durationMinutes: 120 }] : [],
      };
    }
    const [, domain, region, facet] = name.split("__");
    return {
      sampleData: true,
      dataset: DATASET_VERSION,
      domain,
      region,
      facet,
      referenceId: input.referenceId || "standard",
      locale: input.locale || "en-IN",
      records: [
        {
          id: `${domain}-${region}-standard`,
          category: domain,
          region,
          policy: facet,
          title: `${region} ${domain} ${facet} reference`,
          description:
            "Deterministic read-only conference reference entry; verify with a real provider before travel.",
          currency: "INR",
          serviceWindowHours: 24,
        },
      ],
      total: 1,
    };
  }
}
````

### `travel-lab/src/dataset.ts`

````ts
/** Deterministic conference fixtures, never live availability. Prices are INR per adult. */
export const DATASET_VERSION = "travel-fixtures-2026-11-v1";
export const flights = [
  {
    id: "NS-101",
    airline: "IndiGo",
    airlineCode: "6E",
    price: 29800,
    checkedKg: 15,
    seats: 8,
    via: "SIN",
    durationMinutes: 930,
  },
  {
    id: "NS-102",
    airline: "Air India",
    airlineCode: "AI",
    price: 36400,
    checkedKg: 25,
    seats: 6,
    via: "DEL",
    durationMinutes: 1080,
  },
  {
    id: "NS-103",
    airline: "Singapore Airlines",
    airlineCode: "SQ",
    price: 38900,
    checkedKg: 30,
    seats: 4,
    via: "SIN",
    durationMinutes: 870,
  },
  {
    id: "NS-104",
    airline: "Malaysia Airlines",
    airlineCode: "MH",
    price: 33700,
    checkedKg: 20,
    seats: 5,
    via: "KUL",
    durationMinutes: 960,
  },
  {
    id: "NS-105",
    airline: "Qantas",
    airlineCode: "QF",
    price: 43200,
    checkedKg: 30,
    seats: 7,
    via: null,
    durationMinutes: 690,
  },
  {
    id: "NS-106",
    airline: "SriLankan Airlines",
    airlineCode: "UL",
    price: 31900,
    checkedKg: 30,
    seats: 0,
    via: "CMB",
    durationMinutes: 1170,
  },
  {
    id: "NS-107",
    airline: "Thai Airways",
    airlineCode: "TG",
    price: 35200,
    checkedKg: 20,
    seats: 3,
    via: "BKK",
    durationMinutes: 1020,
  },
  {
    id: "NS-108",
    airline: "Scoot",
    airlineCode: "TR",
    price: 27300,
    checkedKg: 0,
    seats: 9,
    via: "SIN",
    durationMinutes: 1110,
  },
  {
    id: "NS-109",
    airline: "Cathay Pacific",
    airlineCode: "CX",
    price: 39500,
    checkedKg: 23,
    seats: 2,
    via: "HKG",
    durationMinutes: 1210,
  },
  {
    id: "NS-110",
    airline: "Air India",
    airlineCode: "AI",
    price: 37800,
    checkedKg: 25,
    seats: 1,
    via: "BOM",
    durationMinutes: 1000,
  },
].map((f) => ({
  ...f,
  from: "BLR",
  to: "SYD",
  currency: "INR",
  sampleData: true,
}));
export const airports: Record<
  string,
  { city: string; name: string; country: string }
> = {
  BLR: { city: "Bengaluru", name: "Kempegowda International", country: "IN" },
  SYD: { city: "Sydney", name: "Sydney Kingsford Smith", country: "AU" },
  SIN: { city: "Singapore", name: "Changi", country: "SG" },
  DEL: { city: "Delhi", name: "Indira Gandhi International", country: "IN" },
  KUL: {
    city: "Kuala Lumpur",
    name: "Kuala Lumpur International",
    country: "MY",
  },
  CMB: { city: "Colombo", name: "Bandaranaike International", country: "LK" },
  BKK: { city: "Bangkok", name: "Suvarnabhumi", country: "TH" },
  HKG: { city: "Hong Kong", name: "Hong Kong International", country: "HK" },
  BOM: {
    city: "Mumbai",
    name: "Chhatrapati Shivaji Maharaj International",
    country: "IN",
  },
};
export function airportCode(value: string) {
  const clean = value.trim().toUpperCase();
  return (
    (
      { BENGALURU: "BLR", BANGALORE: "BLR", SYDNEY: "SYD" } as Record<
        string,
        string
      >
    )[clean] || clean
  );
}
export function flightById(id: string) {
  const f = flights.find((f) => f.id === id);
  if (!f) throw new Error(`Unknown sample flight: ${id}`);
  return f;
}
export const expectedOptions = flights
  .filter((f) => f.price < 40000 && f.seats > 0 && f.checkedKg >= 20)
  .sort((a, b) => a.price - b.price)
  .slice(0, 3)
  .map((f) => f.id);
````

### `travel-lab/src/server.ts`

````ts
import "reflect-metadata";
import { McpApplicationFactory } from "@nitrostack/core";
import { AppModule } from "./app.module.js";
const server = await McpApplicationFactory.create(AppModule);
await server.start({ transport: "stdio" });

// Stop the isolated server and its worker pool when the owning MCP client closes.
process.stdin.on("end", () => {
  void server.stop().finally(() => process.exit(0));
});
````

### `travel-lab/src/mcp-client.ts`

````ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";
import type { Mode } from "./types.js";
export async function connectMcp(
  mode: Mode,
  catalogSize: number,
  onToolEvent?: (event: Record<string, unknown>) => void,
) {
  // Deliberately do not pass provider credentials into the capability server.
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [fileURLToPath(new URL("./server.js", import.meta.url))],
    env: {
      PATH: process.env.PATH || "",
      TRAVEL_MODE: mode,
      TRAVEL_CATALOG_SIZE: String(catalogSize),
      NITRO_MCP_PROTOCOL_VERSION: "2025-06-18",
    },
    stderr: "pipe",
  });
  let pending = "";
  transport.stderr?.on("data", (chunk: Buffer) => {
    pending += chunk.toString();
    let i;
    while ((i = pending.indexOf("\n")) >= 0) {
      const line = pending.slice(0, i);
      pending = pending.slice(i + 1);
      if (line.startsWith("TRAVEL_EVENT ")) {
        try {
          onToolEvent?.(JSON.parse(line.slice(13)));
        } catch {}
      }
    }
  });
  const client = new Client({
    name: "codemode-conference-agent",
    version: "1.0.0",
  });
  try {
    await client.connect(transport);
    return {
      client,
      transport,
      close: async () => {
        await client.close();
        await transport.close();
      },
    };
  } catch (error) {
    await transport.close();
    throw error;
  }
}
export function unpack(result: unknown): unknown {
  const r = result as {
    structuredContent?: unknown;
    content?: { type: string; text?: string }[];
  };
  if (r.structuredContent !== undefined) return r.structuredContent;
  const text = (r.content || [])
    .filter((c) => c.type === "text")
    .map((c) => c.text || "")
    .join("\n");
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
````

### `travel-lab/src/runner.ts`

````ts
import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { connectMcp, unpack } from "./mcp-client.js";
import { DATASET_VERSION } from "./dataset.js";
import { redact } from "./redact.js";
import type { Metrics, Mode, RunTrace, TraceEvent } from "./types.js";
let providerQueue: Promise<void> = Promise.resolve();
let pendingProviderRequests = 0;
async function withProviderSlot(
  action: () => Promise<void>,
  onQueue: () => void,
  signal?: AbortSignal,
) {
  if (process.env.MODEL_SERIALIZE_REQUESTS !== "1") return action();
  const previous = providerQueue;
  let release: () => void = () => {};
  providerQueue = new Promise<void>((resolve) => {
    release = resolve;
  });
  if (pendingProviderRequests > 0) onQueue();
  pendingProviderRequests++;
  await previous;
  try {
    signal?.throwIfAborted();
    await action();
  } finally {
    pendingProviderRequests--;
    release();
  }
}
export const estimateTokens = (value: unknown) =>
  Math.ceil(
    Buffer.byteLength(
      typeof value === "string" ? value : JSON.stringify(value),
      "utf8",
    ) / 4,
  );
export const emptyMetrics = (catalogSize: number): Metrics => ({
  exposedTools: 0,
  catalogSize,
  initialDefinitionTokens: 0,
  initialDefinitionBytes: 0,
  inputTokens: 0,
  outputTokens: 0,
  cachedInputTokens: 0,
  modelRequests: 0,
  toolCalls: 0,
  intermediateBytes: 0,
  latencyMs: 0,
  costUSD: null,
  usageSource: "provider",
});
interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}
interface Message {
  role: string;
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}
interface ProviderReply {
  choices: {
    message: { content?: string; tool_calls?: ToolCall[] };
    finish_reason?: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    prompt_tokens_details?: { cached_tokens?: number };
  };
  error?: { message?: string };
  model?: string;
}
export async function runAgent(
  mode: Mode,
  prompt: string,
  catalogSize: number,
  onEvent: (e: TraceEvent) => void,
  signal?: AbortSignal,
): Promise<RunTrace> {
  const runId = randomUUID(),
    start = performance.now(),
    metrics = emptyMetrics(catalogSize),
    events: TraceEvent[] = [];
  const trace: RunTrace = {
    version: 1,
    runId,
    mode,
    prompt,
    catalogSize,
    model: process.env.OPENAI_MODEL || "",
    dataset: DATASET_VERSION,
    recordedAt: new Date().toISOString(),
    status: "error",
    events,
    metrics,
  };
  const emit = (
    type: string,
    name: string,
    payload?: unknown,
    durationMs?: number,
  ) => {
    metrics.latencyMs = Math.round(performance.now() - start);
    const event: TraceEvent = {
      id: randomUUID(),
      runId,
      mode,
      type,
      name,
      timestamp: new Date().toISOString(),
      durationMs,
      payload: redact(payload),
      metrics: { ...metrics },
    };
    events.push(event);
    onEvent(event);
  };
  let connection: Awaited<ReturnType<typeof connectMcp>> | undefined;
  try {
    emit("run.start", "Starting live MCP session", {
      mode,
      catalogSize,
      prompt,
      dataset: DATASET_VERSION,
      model: trace.model,
    });
    connection = await connectMcp(mode, catalogSize, (event) => {
      if (event.type === "tool.start") metrics.toolCalls++;
      emit(
        String(event.type),
        String(event.name),
        event,
        typeof event.durationMs === "number" ? event.durationMs : undefined,
      );
    });
    const cleanup = () => {
      void connection?.close();
    };
    signal?.addEventListener("abort", cleanup, { once: true });
    emit("discovery.request", "tools/list", {
      jsonrpc: "2.0",
      method: "tools/list",
      params: {},
    });
    const tools: Awaited<
      ReturnType<typeof connection.client.listTools>
    >["tools"] = [];
    let cursor: string | undefined;
    do {
      const page = await connection.client.listTools(cursor ? { cursor } : {});
      tools.push(...page.tools);
      cursor = page.nextCursor;
    } while (cursor);
    const functions = tools.map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description,
        parameters: t.inputSchema,
      },
    }));
    metrics.exposedTools = tools.length;
    metrics.initialDefinitionBytes = Buffer.byteLength(
      JSON.stringify(functions),
    );
    metrics.initialDefinitionTokens = estimateTokens(functions);
    emit("discovery.result", `${tools.length} tools exposed`, {
      tools,
      definitionTokensEstimated: metrics.initialDefinitionTokens,
      definitionBytes: metrics.initialDefinitionBytes,
    });
    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL)
      throw new Error(
        "Configure OPENAI_API_KEY and OPENAI_MODEL in .env.local, then restart npm run demo. No model request was made.",
      );
    const common =
      "You are a travel research agent using deterministic sample travel data, never real availability. Follow the user request faithfully, only use available capabilities, check availability and baggage as needed. All prices are per adult INR. Unless the user explicitly requests sold-out options, only recommend available flights (seats > 0). Apply every eligibility constraint before selecting the requested cheapest options. Do not invent tool results. When complete, return JSON as assistant message content, with no tool calls. JSON is a text format, never a tool or function name. Return your final answer as JSON with an options array (each item includes id, airline, price, checkedKg), plus a brief explanation and sampleData:true. For other user questions use an appropriate JSON answer. You may batch independent calls in parallel. If no flights match say so. Bengaluru is BLR and Sydney is SYD.";
    const system =
      common +
      (mode === "code"
        ? ' Discover tools with search, inspect exact schemas with get_schema, then write ES2020 JavaScript for execute. The code string is the BODY of an async function, executed immediately: use top-level await callTool(name,argsObject) and return a JSON value. Never submit a bare async () => {...} or uninvoked function: that returns null without calling tools. No Markdown fences. Tool-agnostic contract example: const result = await callTool("tool_name", {}); return result; callTool returns the tool handler result directly (not an MCP content envelope). Use Promise.all for independent requests if useful. Do not invoke meta-tools through callTool. No Node globals, import, fetch, require or process. Keep intermediate data in the sandbox. Return only necessary final options.'
        : " Use the individual MCP tools to answer. Choose parallel or sequential calls according to dependencies.");
    const messages: Message[] = [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ];
    let measured = 0,
      estimated = 0;
    for (
      let turn = 0;
      turn < Number(process.env.MODEL_MAX_ROUNDS || 12);
      turn++
    ) {
      signal?.throwIfAborted();
      const body = {
        model: process.env.OPENAI_MODEL,
        messages,
        tools: functions,
        tool_choice: "auto",
        ...(process.env.MODEL_MAX_COMPLETION_TOKENS
          ? {
              max_completion_tokens: Number(
                process.env.MODEL_MAX_COMPLETION_TOKENS,
              ),
            }
          : {}),
      };
      let data: ProviderReply = { choices: [] };
      let modelStart = performance.now();
      const base = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
      await withProviderSlot(
        async () => {
          for (let attempt = 0; attempt < 6; attempt++) {
            signal?.throwIfAborted();
            metrics.modelRequests++;
            emit("model.request", `Model request ${metrics.modelRequests}`, {
              model: body.model,
              messages: structuredClone(body.messages),
              toolChoice: body.tool_choice,
              toolNames: tools.map((t) => t.name),
              toolDefinitionCount: tools.length,
              toolDefinitionsReference: "discovery.result",
              turn: turn + 1,
              attempt: attempt + 1,
            });
            modelStart = performance.now();
            const response = await fetch(
              `${base.replace(/\/$/, "")}/chat/completions`,
              {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: JSON.stringify(body),
                signal: AbortSignal.any([
                  signal || new AbortController().signal,
                  AbortSignal.timeout(90000),
                ]),
              },
            );
            const text = await response.text();
            try {
              data = JSON.parse(text);
            } catch {
              throw new Error(
                `Provider returned non-JSON (HTTP ${response.status})`,
              );
            }
            if (response.status === 429 && attempt < 5) {
              const header = response.headers.get("retry-after");
              const hint = String(data.error?.message || "").match(
                /try again in (?:(\d+)m)?([\d.]+)s/i,
              );
              const seconds =
                header && Number.isFinite(Number(header))
                  ? Number(header)
                  : hint
                    ? Number(hint[1] || 0) * 60 + Number(hint[2])
                    : Math.min(30, 2 ** (attempt + 1));
              const waitMs = Math.max(
                1000,
                Math.min(120000, Math.ceil(seconds * 1000) + 500),
              );
              emit(
                "model.rate_limit",
                `Rate limited · retrying in ${(waitMs / 1000).toFixed(1)}s`,
                {
                  httpStatus: 429,
                  retry: attempt + 1,
                  maxRetries: 5,
                  waitMs,
                  providerMessage: data.error?.message,
                },
                performance.now() - modelStart,
              );
              await delay(waitMs, undefined, { signal });
              continue;
            }
            if(response.status===400 && attempt<5 && body.tool_choice!=="none" && /attempted to call tool ['"]JSON['"]/i.test(data.error?.message||"")) {
              emit("model.repair", "Provider rejected a nonexistent JSON tool", {httpStatus:400,providerMessage:data.error?.message,action:"Request final assistant content using tool_choice:none; no tool result is fabricated."});
              body.tool_choice="none";
              body.messages=[...messages,{role:"system",content:"JSON is not a callable tool. Use the actual tool results already obtained to answer as JSON text in assistant content. If the data is insufficient, say so rather than inventing facts. Do not request another tool."}];
              continue;
            }
            if (!response.ok)
              throw new Error(
                `Provider HTTP ${response.status}: ${data.error?.message || "Request rejected"}`,
              );
            break;
          }
        },
        () =>
          emit("model.queue", "Waiting for provider slot", {
            reason:
              "Configured provider concurrency is 1; tool calls are not serialized.",
          }),
        signal,
      );
      const raw = data.choices?.[0]?.message;
      if (!raw) throw new Error("Provider response has no assistant message");
      const message: Message = {
        role: "assistant",
        content: raw.content || null,
        ...(raw.tool_calls?.length ? { tool_calls: raw.tool_calls } : {}),
      };
      if (
        data.usage &&
        Number.isFinite(data.usage.prompt_tokens) &&
        Number.isFinite(data.usage?.completion_tokens)
      ) {
        metrics.inputTokens += data.usage.prompt_tokens;
        metrics.outputTokens += data.usage.completion_tokens;
        metrics.cachedInputTokens +=
          data.usage.prompt_tokens_details?.cached_tokens || 0;
        measured++;
      } else {
        metrics.inputTokens += estimateTokens(body);
        metrics.outputTokens += estimateTokens(message);
        estimated++;
      }
      metrics.usageSource = estimated
        ? measured
          ? "mixed"
          : "estimated"
        : "provider";
      const inputPrice = Number(process.env.MODEL_INPUT_USD_PER_MILLION),
        outputPrice = Number(process.env.MODEL_OUTPUT_USD_PER_MILLION),
        cachedPrice = Number(
          process.env.MODEL_CACHED_INPUT_USD_PER_MILLION ||
            process.env.MODEL_INPUT_USD_PER_MILLION,
        );
      if (
        process.env.MODEL_INPUT_USD_PER_MILLION &&
        process.env.MODEL_OUTPUT_USD_PER_MILLION &&
        [inputPrice, outputPrice, cachedPrice].every(
          (n) => Number.isFinite(n) && n >= 0,
        )
      )
        metrics.costUSD =
          ((metrics.inputTokens - metrics.cachedInputTokens) * inputPrice +
            metrics.cachedInputTokens * cachedPrice +
            metrics.outputTokens * outputPrice) /
          1000000;
      emit(
        "model.response",
        `Model response ${metrics.modelRequests}`,
        {
          message,
          servedModel: data.model || trace.model,
          usage: data.usage || null,
          finishReason: data.choices[0].finish_reason,
        },
        performance.now() - modelStart,
      );
      messages.push(message);
      if (!message.tool_calls?.length) {
        if (data.choices[0].finish_reason === "length")
          throw new Error(
            "Provider output limit reached before a final answer",
          );
        trace.answer = unpack({
          content: [
            {
              type: "text",
              text: (message.content || "")
                .trim()
                .replace(/^```(?:json)?\s*/i, "")
                .replace(/\s*```$/, ""),
            },
          ],
        });
        trace.status = "complete";
        emit("run.complete", "Final answer", { answer: trace.answer });
        break;
      }
      const results = await Promise.all(
        message.tool_calls.map(async (call) => {
          let args: Record<string, unknown>;
          try {
            args = JSON.parse(call.function.arguments);
          } catch {
            args = {};
          }
          emit("mcp.request", call.function.name, {
            jsonrpc: "2.0",
            method: "tools/call",
            params: { name: call.function.name, arguments: args },
            modelToolCallId: call.id,
          });
          if (call.function.name === "execute")
            emit("code.generated", "Model-generated JavaScript", {
              code: args.code,
              instrumentation:
                "Tool boundaries only; NitroStack does not expose line-level execution hooks.",
            });
          const callStart = performance.now();
          let result: unknown;
          try {
            result = await connection!.client.callTool(
              { name: call.function.name, arguments: args },
              undefined,
              { timeout: 20000 },
            );
          } catch (error) {
            result = {
              isError: true,
              content: [{ type: "text", text: String(error) }],
            };
          }
          const serialized = JSON.stringify(result);
          metrics.intermediateBytes += Buffer.byteLength(serialized);
          emit(
            "mcp.response",
            call.function.name,
            {
              result,
              modelToolCallId: call.id,
              bytesToModel: Buffer.byteLength(serialized),
            },
            performance.now() - callStart,
          );
          return {
            role: "tool",
            tool_call_id: call.id,
            content: serialized,
          } as Message;
        }),
      );
      messages.push(...results);
    }
    if (trace.status !== "complete")
      throw new Error(
        `Model did not finish within ${process.env.MODEL_MAX_ROUNDS || 12} requests`,
      );
    signal?.removeEventListener("abort", cleanup);
  } catch (error) {
    trace.error = String(
      redact(error instanceof Error ? error.message : String(error)),
    );
    emit("run.error", "Execution failed", { error: trace.error });
  } finally {
    await connection?.close().catch(() => {});
    metrics.latencyMs = Math.round(performance.now() - start);
  }
  return trace;
}
````

### `travel-lab/package.json`

````json
{"name":"@codemode/travel-lab","version":"1.0.0","private":true,"type":"module","scripts":{"build":"tsc -p tsconfig.json","start":"node --env-file-if-exists=../.env.local dist/agent.js","test":"node --test dist/integration.test.js","record":"node --env-file-if-exists=../.env.local dist/record.js"},"dependencies":{"@nitrostack/core":"1.1.3","@modelcontextprotocol/sdk":"^1.25.0","dotenv":"^16.6.1","zod":"^3.25.0"},"devDependencies":{"@nitrostack/cli":"1.1.3"}}
````

## Appendix C. Recording inventory and exact selected-pair totals

| File ID | Top-level capture UTC | Stored modes/status | Available as paired replay/export |
| --- | --- | --- | --- |
| 5ea9dc58-41b9-4478-b413-016051667784 | 2026-11-25T14:14:04.469Z | traditional: complete, code: complete | Yes |
| 762121d2-f9ae-4913-8df9-c1943f96bb4d | 2026-11-25T19:56:49.322Z | code: complete | No |
| c4044c55-56bc-4ff6-9677-742ff82dd709 | 2026-11-25T19:55:24.901Z | traditional: complete | No |
| ddd61c41-3285-44b4-8c1d-fdc7082006e1 | 2026-11-25T19:06:24.939Z | code: complete | No |
| f5a8ecae-5a2b-487f-96f3-927a2553dcdc | 2026-11-25T14:53:15.228Z | code: complete | No |

Exact selected-pair metric objects (not recomputed during replay):

```json
{
  "traditional": {
    "exposedTools": 10,
    "catalogSize": 10,
    "initialDefinitionTokens": 1130,
    "initialDefinitionBytes": 4517,
    "inputTokens": 19248,
    "outputTokens": 1468,
    "cachedInputTokens": 2048,
    "modelRequests": 19,
    "toolCalls": 8,
    "intermediateBytes": 4114,
    "latencyMs": 155356,
    "costUSD": null,
    "usageSource": "provider"
  },
  "code": {
    "exposedTools": 3,
    "catalogSize": 10,
    "initialDefinitionTokens": 496,
    "initialDefinitionBytes": 1984,
    "inputTokens": 9648,
    "outputTokens": 944,
    "cachedInputTokens": 1024,
    "modelRequests": 9,
    "toolCalls": 9,
    "intermediateBytes": 7425,
    "latencyMs": 83124,
    "costUSD": null,
    "usageSource": "provider"
  }
}
```

### Selected-pair event inventory

Counts refer to original saved events. `model.request` counts include rate-limited attempts; `model.response` only counts successful parsed assistant replies.

**traditional**: 79 total events.

| Event type | Count |
| --- | ---: |
| run.start | 1 |
| discovery.request | 1 |
| discovery.result | 1 |
| model.request | 19 |
| model.response | 9 |
| mcp.request | 8 |
| tool.start | 8 |
| tool.end | 8 |
| mcp.response | 8 |
| model.queue | 5 |
| model.rate_limit | 10 |
| run.complete | 1 |

**code**: 55 total events.

| Event type | Count |
| --- | ---: |
| run.start | 1 |
| discovery.request | 1 |
| discovery.result | 1 |
| model.queue | 5 |
| model.request | 9 |
| model.response | 5 |
| mcp.request | 4 |
| mcp.response | 4 |
| model.rate_limit | 4 |
| code.generated | 2 |
| tool.start | 9 |
| tool.end | 9 |
| run.complete | 1 |

## Appendix D. Exact Grafana query inventory

Read from `observability/grafana/dashboards/travel-demo.json`. The generated hosted dashboard retains these queries and panel titles; it changes only the overall title and tags. Internal panel IDs are not their presentation order.

Recording selector configuration:

```json
{
  "list": [
    {
      "name": "recording",
      "label": "Run",
      "type": "query",
      "datasource": {
        "type": "prometheus",
        "uid": "travel-prometheus"
      },
      "query": {
        "query": "label_values(agent_demo_measurement{source=\"recorded\"}, recording_id)",
        "refId": "StandardVariableQuery"
      },
      "definition": "label_values(agent_demo_measurement{source=\"recorded\"}, recording_id)",
      "refresh": 1,
      "multi": false,
      "includeAll": false,
      "current": {
        "text": "5ea9dc58-41b9-4478-b413-016051667784",
        "value": "5ea9dc58-41b9-4478-b413-016051667784"
      },
      "hide": 2
    }
  ]
}
```

### Exposed tools (id 1, stat)

Grid position: `{"x": 0, "y": 0, "w": 6, "h": 5}`.

Target A; instant query: false; legend: `{{mode}}`.

```promql
label_replace(label_replace((agent_demo_measurement{source="recorded",recording_id="$recording",metric="exposedTools"}), "mode", "Code Mode", "mode", "code"), "mode", "Tool Calling", "mode", "traditional")
```

### Definition tokens (id 2, stat)

Grid position: `{"x": 6, "y": 0, "w": 6, "h": 5}`.

Target A; instant query: false; legend: `{{mode}}`.

```promql
label_replace(label_replace((agent_demo_measurement{source="recorded",recording_id="$recording",metric="initialDefinitionTokens"}), "mode", "Code Mode", "mode", "code"), "mode", "Tool Calling", "mode", "traditional")
```

### API requests (id 3, stat)

Grid position: `{"x": 12, "y": 0, "w": 6, "h": 5}`.

Target A; instant query: false; legend: `{{mode}}`.

```promql
label_replace(label_replace((agent_demo_measurement{source="recorded",recording_id="$recording",metric="modelRequests"}), "mode", "Code Mode", "mode", "code"), "mode", "Tool Calling", "mode", "traditional")
```

### Underlying tool calls (id 4, stat)

Grid position: `{"x": 18, "y": 0, "w": 6, "h": 5}`.

Target A; instant query: false; legend: `{{mode}}`.

```promql
label_replace(label_replace((agent_demo_measurement{source="recorded",recording_id="$recording",metric="toolCalls"}), "mode", "Code Mode", "mode", "code"), "mode", "Tool Calling", "mode", "traditional")
```

### Model input tokens (id 5, bargauge)

Grid position: `{"x": 0, "y": 5, "w": 6, "h": 5}`.

Target A; instant query: true; legend: `{{mode}}`.

```promql
label_replace(label_replace((agent_demo_measurement{source="recorded",recording_id="$recording",metric="inputTokens"}), "mode", "Code Mode", "mode", "code"), "mode", "Tool Calling", "mode", "traditional")
```

### Model output tokens (id 6, bargauge)

Grid position: `{"x": 6, "y": 5, "w": 6, "h": 5}`.

Target A; instant query: true; legend: `{{mode}}`.

```promql
label_replace(label_replace((agent_demo_measurement{source="recorded",recording_id="$recording",metric="outputTokens"}), "mode", "Code Mode", "mode", "code"), "mode", "Tool Calling", "mode", "traditional")
```

### Latency (id 7, bargauge)

Grid position: `{"x": 12, "y": 5, "w": 6, "h": 5}`.

Target A; instant query: true; legend: `{{mode}}`.

```promql
label_replace(label_replace((agent_demo_measurement{source="recorded",recording_id="$recording",metric="latencyMs"} / 1000), "mode", "Code Mode", "mode", "code"), "mode", "Tool Calling", "mode", "traditional")
```

### Traffic (id 8, bargauge)

Grid position: `{"x": 18, "y": 5, "w": 6, "h": 5}`.

Target A; instant query: true; legend: `{{mode}}`.

```promql
label_replace(label_replace((sum by (mode) (agent_demo_measurement{source="recorded",recording_id="$recording",metric=~"initialDefinitionBytes|intermediateBytes"})), "mode", "Code Mode", "mode", "code"), "mode", "Tool Calling", "mode", "traditional")
```

### Input token delta (id 9, stat)

Grid position: `{"x": 0, "y": 10, "w": 6, "h": 4}`.

Target A; instant query: false; legend: `delta`.

```promql
100 * (sum(agent_demo_measurement{source="recorded",recording_id="$recording",mode="traditional",metric="inputTokens"}) - sum(agent_demo_measurement{source="recorded",recording_id="$recording",mode="code",metric="inputTokens"})) / sum(agent_demo_measurement{source="recorded",recording_id="$recording",mode="traditional",metric="inputTokens"})
```

### API request delta (id 10, stat)

Grid position: `{"x": 6, "y": 10, "w": 6, "h": 4}`.

Target A; instant query: false; legend: `delta`.

```promql
100 * (sum(agent_demo_measurement{source="recorded",recording_id="$recording",mode="traditional",metric="modelRequests"}) - sum(agent_demo_measurement{source="recorded",recording_id="$recording",mode="code",metric="modelRequests"})) / sum(agent_demo_measurement{source="recorded",recording_id="$recording",mode="traditional",metric="modelRequests"})
```

### Latency delta (id 11, stat)

Grid position: `{"x": 12, "y": 10, "w": 6, "h": 4}`.

Target A; instant query: false; legend: `delta`.

```promql
100 * (sum(agent_demo_measurement{source="recorded",recording_id="$recording",mode="traditional",metric="latencyMs"}) - sum(agent_demo_measurement{source="recorded",recording_id="$recording",mode="code",metric="latencyMs"})) / sum(agent_demo_measurement{source="recorded",recording_id="$recording",mode="traditional",metric="latencyMs"})
```

### Traffic delta (id 12, stat)

Grid position: `{"x": 18, "y": 10, "w": 6, "h": 4}`.

Target A; instant query: false; legend: `delta`.

```promql
100 * (sum(agent_demo_measurement{source="recorded",recording_id="$recording",mode="traditional",metric=~"initialDefinitionBytes|intermediateBytes"}) - sum(agent_demo_measurement{source="recorded",recording_id="$recording",mode="code",metric=~"initialDefinitionBytes|intermediateBytes"})) / sum(agent_demo_measurement{source="recorded",recording_id="$recording",mode="traditional",metric=~"initialDefinitionBytes|intermediateBytes"})
```

### Input tokens over time (id 20, timeseries)

Grid position: `{"x": 0, "y": 14, "w": 12, "h": 8}`.

Target A; instant query: false; legend: `{{mode}}`.

```promql
label_replace(label_replace((agent_demo_measurement{source="recorded",recording_id="$recording",metric="inputTokens"}), "mode", "Code Mode", "mode", "code"), "mode", "Tool Calling", "mode", "traditional")
```

### API requests over time (id 21, timeseries)

Grid position: `{"x": 12, "y": 14, "w": 12, "h": 8}`.

Target A; instant query: false; legend: `{{mode}}`.

```promql
label_replace(label_replace((agent_demo_measurement{source="recorded",recording_id="$recording",metric="modelRequests"}), "mode", "Code Mode", "mode", "code"), "mode", "Tool Calling", "mode", "traditional")
```

### Tool calls over time (id 22, timeseries)

Grid position: `{"x": 0, "y": 22, "w": 12, "h": 8}`.

Target A; instant query: false; legend: `{{mode}}`.

```promql
label_replace(label_replace((agent_demo_measurement{source="recorded",recording_id="$recording",metric="toolCalls"}), "mode", "Code Mode", "mode", "code"), "mode", "Tool Calling", "mode", "traditional")
```

### Latency over time (id 23, timeseries)

Grid position: `{"x": 12, "y": 22, "w": 12, "h": 8}`.

Target A; instant query: false; legend: `{{mode}}`.

```promql
label_replace(label_replace((agent_demo_measurement{source="recorded",recording_id="$recording",metric="latencyMs"} / 1000), "mode", "Code Mode", "mode", "code"), "mode", "Tool Calling", "mode", "traditional")
```

### Traffic over time (id 26, timeseries)

Grid position: `{"x": 0, "y": 30, "w": 24, "h": 8}`.

Target A; instant query: false; legend: `{{mode}}`.

```promql
label_replace(label_replace((sum by (mode) (agent_demo_measurement{source="recorded",recording_id="$recording",metric=~"initialDefinitionBytes|intermediateBytes"})), "mode", "Code Mode", "mode", "code"), "mode", "Tool Calling", "mode", "traditional")
```

### Mode comparison (id 24, bargauge)

Grid position: `{"x": 0, "y": 38, "w": 24, "h": 8}`.

Target A; instant query: true; legend: `input tokens · {{mode}}`.

```promql
label_replace(label_replace((agent_demo_measurement{source="recorded",recording_id="$recording",metric="inputTokens"}), "mode", "Code Mode", "mode", "code"), "mode", "Tool Calling", "mode", "traditional")
```

Target B; instant query: true; legend: `output tokens · {{mode}}`.

```promql
label_replace(label_replace((agent_demo_measurement{source="recorded",recording_id="$recording",metric="outputTokens"}), "mode", "Code Mode", "mode", "code"), "mode", "Tool Calling", "mode", "traditional")
```

Target C; instant query: true; legend: `API requests · {{mode}}`.

```promql
label_replace(label_replace((agent_demo_measurement{source="recorded",recording_id="$recording",metric="modelRequests"}), "mode", "Code Mode", "mode", "code"), "mode", "Tool Calling", "mode", "traditional")
```

Target D; instant query: true; legend: `tool calls · {{mode}}`.

```promql
label_replace(label_replace((agent_demo_measurement{source="recorded",recording_id="$recording",metric="toolCalls"}), "mode", "Code Mode", "mode", "code"), "mode", "Tool Calling", "mode", "traditional")
```

### Live measurements (id 13, table)

Grid position: `{"x": 0, "y": 46, "w": 24, "h": 9}`.

Target A; instant query: true; legend: ``.

```promql
label_replace(label_replace((agent_demo_measurement{source="recorded",recording_id="$recording"}), "mode", "Code Mode", "mode", "code"), "mode", "Tool Calling", "mode", "traditional")
```

## Appendix E. Complete supporting implementation sources

These source snapshots define the browser execution UI, real agent/session API, replay/proxy behavior, validation, redaction, metric export and hosting. They supplement the slide inventory rather than add new presentation content. Styles were read for the visual descriptions; their full CSS is left in the repository.

### `travel-lab/src/types.ts`

````ts
export type Mode = "traditional" | "code";
export interface Metrics {
  exposedTools: number;
  catalogSize: number;
  initialDefinitionTokens: number;
  initialDefinitionBytes: number;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  modelRequests: number;
  toolCalls: number;
  intermediateBytes: number;
  latencyMs: number;
  costUSD: number | null;
  usageSource: "provider" | "estimated" | "mixed";
}
export interface TraceEvent {
  id: string;
  runId: string;
  mode: Mode;
  type: string;
  name: string;
  timestamp: string;
  durationMs?: number;
  payload?: unknown;
  metrics?: Metrics;
}
export interface RunTrace {
  version: 1;
  runId: string;
  mode: Mode;
  prompt: string;
  catalogSize: number;
  model: string;
  dataset: string;
  recordedAt: string;
  status: "complete" | "error";
  events: TraceEvent[];
  metrics: Metrics;
  answer?: unknown;
  error?: string;
}
export const MAIN_PROMPT =
  "Find flights from Bengaluru to Sydney under ₹40,000, check their baggage allowances, and return the three cheapest options with at least 20 kg of checked baggage.";
````

### `travel-lab/src/agent.ts`

````ts
import { createServer } from "node:http";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { runAgent } from "./runner.js";
import { connectMcp, unpack } from "./mcp-client.js";
import { redact } from "./redact.js";
import { mainResultError } from "./validation.js";
import { refreshRecordedMetrics, publishLiveMetric } from "./observability.js";
import type { Mode, RunTrace, TraceEvent } from "./types.js";
config({
  path: fileURLToPath(new URL("../../.env.local", import.meta.url)),
  override: true,
});
const root = new URL("../../", import.meta.url),
  recordings = new URL("../recordings/", import.meta.url);
export interface Recording {
  version: 1;
  id: string;
  recordedAt: string;
  prompt: string;
  catalogSize: number;
  model: string;
  traces: RunTrace[];
}
export async function saveRecording(traces: RunTrace[]) {
  for (const trace of traces) {
    const error = mainResultError(trace);
    if (error) {
      trace.status = "error";
      trace.error = error;
    }
  }

  if (!traces.length || traces.some((t) => t.status !== "complete"))
    return null;
  const recording: Recording = {
    version: 1,
    id: randomUUID(),
    recordedAt: new Date().toISOString(),
    prompt: traces[0].prompt,
    catalogSize: traces[0].catalogSize,
    model: traces[0].model,
    traces,
  };
  await mkdir(recordings, { recursive: true });
  await writeFile(
    new URL(`${recording.id}.json`, recordings),
    JSON.stringify(redact(recording), null, 2),
  );
  await refreshRecordedMetrics();
  return recording.id;
}
async function listRecordings() {
  await mkdir(recordings, { recursive: true });
  const files = (await readdir(recordings)).filter((f) => f.endsWith(".json"));
  const rows = await Promise.all(
    files.map(async (f) => {
      try {
        const r = JSON.parse(
          await readFile(new URL(f, recordings), "utf8"),
        ) as Recording;
        return {
          id: r.id,
          recordedAt: r.recordedAt,
          prompt: r.prompt,
          catalogSize: r.catalogSize,
          model: r.model,
          modes: r.traces.map((t) => t.mode),
        };
      } catch {
        return null;
      }
    }),
  );
  return rows
    .filter(Boolean)
    .sort((a, b) => b!.recordedAt.localeCompare(a!.recordedAt));
}
async function body(req: import("node:http").IncomingMessage) {
  let data = "";
  for await (const chunk of req) {
    data += chunk;
    if (data.length > 24000) throw new Error("Request body too large");
  }
  return JSON.parse(data || "{}");
}
const sources = [
  "travel-lab/src/app.module.ts",
  "travel-lab/src/travel.tools.ts",
  "travel-lab/src/travel.service.ts",
  "travel-lab/src/dataset.ts",
  "travel-lab/src/server.ts",
  "travel-lab/src/mcp-client.ts",
  "travel-lab/src/runner.ts",
  "travel-lab/package.json",
];
let busy = false;
const server = createServer(async (req, res) => {
  const pathname = new URL(req.url || "/", "http://localhost").pathname;
  const json = (status: number, data: unknown) => {
    res.writeHead(status, {
      "content-type": "application/json",
      "cache-control": "no-store",
    });
    res.end(JSON.stringify(redact(data)));
  };
  let ownsBusy = false;
  try {
    if (
      req.headers.origin &&
      !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.origin)
    ) {
      json(403, { error: "Local demo requests only" });
      return;
    }
    if (pathname === "/status") {
      await refreshRecordedMetrics();
      const grafanaReady = await fetch("http://127.0.0.1:3300/api/health", {
        signal: AbortSignal.timeout(1200),
      })
        .then((r) => r.ok)
        .catch(() => false);
      json(200, {
        ready: true,
        providerConfigured:
          !!process.env.OPENAI_API_KEY && !!process.env.OPENAI_MODEL,
        model: process.env.OPENAI_MODEL || null,
        provider: "OpenAI-compatible Chat Completions",
        sdkVersion: "1.1.3",
        grafana: { ready: grafanaReady, url: "http://localhost:3300" },
        dataset: "travel-fixtures-2026-11-v1",
        sandbox: {
          runtime: "QuickJS WebAssembly",
          timeoutMs: 2000,
          memoryLimitMb: 64,
          maxToolCalls: 40,
        },
        recordings: await listRecordings(),
        busy,
      });
      return;
    }
    if (pathname === "/sources") {
      json(200, {
        files: await Promise.all(
          sources.map(async (path) => ({
            path,
            code: await readFile(new URL(path, root), "utf8"),
          })),
        ),
        commands: {
          scaffold:
            "npx @nitrostack/cli@1.1.3 init travel-example --preset code-mode --skip-install",
          build: "npm run build:lab",
          start: "npm run demo",
          traditional: `claude mcp add --transport stdio --env TRAVEL_MODE=traditional --env TRAVEL_CATALOG_SIZE=10 travel-traditional -- node ${fileURLToPath(new URL("travel-lab/dist/server.js", root))}`,
          code: `claude mcp add --transport stdio --env TRAVEL_MODE=code --env TRAVEL_CATALOG_SIZE=10 travel-code -- node ${fileURLToPath(new URL("travel-lab/dist/server.js", root))}`,
          inspect: "claude mcp list",
          record: "npm run record:demo",
        },
      });
      return;
    }
    if (req.method !== "POST") {
      json(405, { error: "POST required" });
      return;
    }
    if (!["/run", "/replay", "/security"].includes(pathname)) {
      json(404, { error: "Unknown endpoint" });
      return;
    }
    const input = await body(req);
    if (pathname === "/security") {
      if (busy) {
        json(409, { error: "Wait for the current run to finish" });
        return;
      }
      busy = true;
      ownsBusy = true;
      let c: Awaited<ReturnType<typeof connectMcp>> | undefined;
      const started = performance.now();
      try {
        c = await connectMcp("code", 10);
        await c.client.listTools();
        const result = await c.client.callTool(
          { name: "execute", arguments: { code: "while (true) {}" } },
          undefined,
          { timeout: 10000 },
        );
        const blocked = !!(result as { isError?: boolean }).isError;
        json(200, {
          test: "Actual QuickJS timeout",
          code: "while (true) {}",
          timeoutMs: 2000,
          blocked,
          result: unpack(result),
          durationMs: Math.round(performance.now() - started),
          lineInstrumentation: false,
        });
      } finally {
        await c?.close();
        busy = false;
      }
      return;
    }
    if (pathname === "/run" && busy) {
      json(409, {
        error: "A live run is already active. Wait or cancel it first.",
      });
      return;
    }
    const modes: Mode[] =
      input.mode === "both"
        ? ["traditional", "code"]
        : input.mode === "traditional"
          ? ["traditional"]
          : input.mode === "code"
            ? ["code"]
            : [];
    if (pathname === "/replay" && input.mode !== undefined && !modes.length) {
      json(400, { error: "Choose traditional, code, or both for replay." });
      return;
    }
    if (
      pathname === "/run" &&
      (!modes.length ||
        ![10, 100, 1000].includes(input.catalogSize) ||
        typeof input.prompt !== "string" ||
        !input.prompt.trim() ||
        input.prompt.length > 6000)
    ) {
      json(400, {
        error:
          "Choose a mode, a catalog of 10/100/1000, and a prompt (1–6,000 characters).",
      });
      return;
    }
    let recording: Recording | undefined;
    if (pathname === "/replay") {
      if (typeof input.id !== "string" || !/^[a-f0-9-]{36}$/.test(input.id)) {
        json(400, { error: "Choose a genuine recording" });
        return;
      }
      try {
        recording = JSON.parse(
          await readFile(new URL(`${input.id}.json`, recordings), "utf8"),
        );
      } catch {
        json(404, { error: "Recording not found" });
        return;
      }
    }
    if (pathname === "/run") {
      busy = true;
      ownsBusy = true;
    }
    if (
      recording &&
      !["traditional", "code"].every((mode) =>
        recording!.traces.some(
          (t) => t.mode === mode && t.status === "complete",
        ),
      )
    ) {
      json(400, {
        error:
          "Select a genuine comparison recording containing both Tool Calling and Code Mode.",
      });
      return;
    }
    res.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    });
    res.flushHeaders();
    const controller = new AbortController();
    res.on("close", () => controller.abort());
    const send = (data: unknown) => {
      if (!res.destroyed)
        res.write(`data: ${JSON.stringify(redact(data))}\n\n`);
    };
    const heartbeat = setInterval(() => {
      if (!res.destroyed) res.write(": heartbeat\n\n");
    }, 10000);
    try {
      if (recording) {
        const replayTraces = recording.traces.filter(
          (trace) => !modes.length || modes.includes(trace.mode),
        );
        send({
          type: "session.replay",
          recording: {
            id: recording.id,
            recordedAt: recording.recordedAt,
            prompt: recording.prompt,
            catalogSize: recording.catalogSize,
            model: recording.model,
          },
          notice:
            "REPLAY — recorded genuine execution, accelerated playback; no live model requests.",
        });
        const all = replayTraces
          .flatMap((t) => t.events)
          .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        let previous = all[0]?.timestamp;
        for (const event of all) {
          if (controller.signal.aborted) break;
          const delay = Math.max(
            0,
            Math.min(
              250,
              new Date(event.timestamp).getTime() -
                new Date(previous || event.timestamp).getTime(),
            ),
          );
          if (delay) await new Promise((r) => setTimeout(r, delay));
          send(event);
          previous = event.timestamp;
        }
        send({
          type: "session.complete",
          traces: replayTraces,
          replay: true,
          recordingId: recording.id,
        });
      } else {
        send({
          type: "session.start",
          modes,
          prompt: input.prompt,
          catalogSize: input.catalogSize,
        });
        const traces = await Promise.all(
          modes.map((mode) =>
            runAgent(
              mode,
              input.prompt.trim(),
              input.catalogSize,
              (event) => {
                publishLiveMetric(event);
                send(event);
              },
              controller.signal,
            ),
          ),
        );
        const recordingId = await saveRecording(traces);
        send({ type: "session.complete", traces, replay: false, recordingId });
      }
    } catch (error) {
      send({ type: "session.error", error: String(error) });
    } finally {
      clearInterval(heartbeat);
      if (pathname === "/run") busy = false;
      res.end();
    }
  } catch (error) {
    if (!res.headersSent) json(500, { error: String(error) });
    else res.end();
    if (ownsBusy) busy = false;
  }
});
void refreshRecordedMetrics();
if (process.argv[1] === fileURLToPath(import.meta.url))
  server.listen(Number(process.env.DEMO_AGENT_PORT || 4100), "127.0.0.1", () =>
    console.log("Travel agent backend listening on http://127.0.0.1:4100"),
  );
````

### `travel-lab/src/validation.ts`

````ts
import { expectedOptions,flightById } from './dataset.js';
import { MAIN_PROMPT,type RunTrace } from './types.js';
/** Validate only the known conference prompt. Other natural-language prompts retain their own meaning. */
export function mainResultError(trace:RunTrace):string|undefined{
 if(trace.status!=='complete'||trace.prompt.trim()!==MAIN_PROMPT)return;
 const answer=trace.answer as {options?:{id?:string;flightId?:string;price?:number;checkedKg?:number}[]};
 const options=answer?.options;
 if(!Array.isArray(options)||JSON.stringify(options.map(f=>f.id||f.flightId))!==JSON.stringify(expectedOptions))return `Result validation failed: expected available flights ${expectedOptions.join(', ')} in fare order. The model's answer has been retained for inspection; no recording was saved.`;
 for(const option of options){const f=flightById((option.id||option.flightId)!);if(option.price!==f.price||option.checkedKg!==f.checkedKg)return `Result validation failed: price or baggage for ${f.id} differs from the deterministic tool data. No recording was saved.`;}
}
````

### `travel-lab/src/record.ts`

````ts
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import { redact } from "./redact.js";
import { runAgent } from "./runner.js";
import { MAIN_PROMPT } from "./types.js";
import { saveRecording } from "./agent.js";
import { expectedOptions } from "./dataset.js";
config({
  path: fileURLToPath(new URL("../../.env.local", import.meta.url)),
  override: true,
});
if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL)
  throw new Error(
    "Set OPENAI_API_KEY and OPENAI_MODEL in .env.local before recording.",
  );
const traces = await Promise.all(
  (["traditional", "code"] as const).map((mode) =>
    runAgent(mode, MAIN_PROMPT, 10, (e) =>
      console.log(`${mode}: ${e.type} ${e.name}`),
    ),
  ),
);
const debugDir=new URL("../.debug/",import.meta.url);
await mkdir(debugDir,{recursive:true});
await writeFile(new URL("last-attempt.json",debugDir),JSON.stringify(redact(traces),null,2));
for (const trace of traces) {
  if (trace.status !== "complete") continue;
  const answer = trace.answer as {
    options?: { id?: string; flightId?: string }[];
  };
  const ids = answer?.options?.map((option) => option.id || option.flightId);
  if (JSON.stringify(ids) !== JSON.stringify(expectedOptions)) {
    throw new Error(
      `${trace.mode} returned unexpected options: ${JSON.stringify(ids)}. Expected ${expectedOptions.join(", ")}. No verified recording was saved.`,
    );
  }
}
const id = await saveRecording(traces);
if (!id) {
  console.error(traces.map((t) => ({ mode: t.mode, error: t.error })));
  process.exitCode = 1;
} else console.log(`Genuine recording saved: ${id}`);
````

### `travel-lab/src/redact.ts`

````ts
export function redact(value: unknown): unknown {
  const secrets = [process.env.OPENAI_API_KEY].filter((s): s is string => !!s);
  const clean = (v: unknown): unknown => {
    if (typeof v === "string") {
      let t = v;
      for (const secret of secrets) t = t.split(secret).join("[REDACTED]");
      return t
        .replace(/Bearer\s+[\w.\-]+/gi, "Bearer [REDACTED]")
        .replace(/sk-[A-Za-z0-9_-]{12,}/g, "[REDACTED]");
    }
    if (Array.isArray(v)) return v.map(clean);
    if (v && typeof v === "object")
      return Object.fromEntries(
        Object.entries(v).map(([k, val]) => [
          k,
          /authorization|cookie|api.?key|password|secret|credential|token$/i.test(
            k,
          ) && !k.toLowerCase().includes("tokens")
            ? "[REDACTED]"
            : clean(val),
        ]),
      );
    return v;
  };
  return clean(value);
}
````

### `travel-lab/src/observability.ts`

````ts
import { mkdir, readFile, readdir, writeFile, rename } from "node:fs/promises";
import type { Metrics, RunTrace, TraceEvent } from "./types.js";
const directory = new URL("../../observability/metrics/", import.meta.url);
const recordings = new URL("../recordings/", import.meta.url);
interface Snapshot {
  source: string;
  recordingId: string;
  mode: string;
  model: string;
  recordedAt: string;
  metrics: Metrics;
}
const snapshots = new Map<string, Snapshot>();
let lastWritten = "";
let writes: Promise<void> = Promise.resolve(),
  timer: ReturnType<typeof setTimeout> | undefined;
function escape(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("\n", "\\n");
}
function render() {
  const lines = [
    "# HELP agent_demo_measurement Actual saved or streamed travel agent measurements. Token estimates are identified by metric name.",
    "# TYPE agent_demo_measurement gauge",
    "# HELP agent_demo_recorded_timestamp_seconds Original capture time, not Prometheus scrape time.",
    "# TYPE agent_demo_recorded_timestamp_seconds gauge",
  ];
  for (const row of snapshots.values()) {
    const labels = `source="${escape(row.source)}",recording_id="${escape(row.recordingId)}",mode="${row.mode}",model="${escape(row.model)}",usage_source="${row.metrics.usageSource}"`;
    for (const [key, value] of Object.entries(row.metrics)) {
      if (typeof value === "number" && Number.isFinite(value))
        lines.push(
          `agent_demo_measurement{${labels},metric="${key}"} ${value}`,
        );
    }
    const ts = Date.parse(row.recordedAt) / 1000;
    if (Number.isFinite(ts))
      lines.push(`agent_demo_recorded_timestamp_seconds{${labels}} ${ts}`);
  }
  return lines.join("\n") + "\n";
}
function flush() {
  const value = render();
  writes = writes
    .catch(() => {})
    .then(async () => {
      if (lastWritten === value) return;
      await mkdir(directory, { recursive: true });
      const temp = new URL("metrics.tmp", directory);
      await writeFile(temp, value);
      await rename(temp, new URL("metrics.txt", directory));
      lastWritten = value;
    });
  return writes;
}
export async function refreshRecordedMetrics() {
  await mkdir(recordings, { recursive: true });
  for (const file of (await readdir(recordings)).filter((f) =>
    f.endsWith(".json"),
  )) {
    try {
      const r = JSON.parse(
        await readFile(new URL(file, recordings), "utf8"),
      ) as {
        id: string;
        model: string;
        recordedAt: string;
        traces: RunTrace[];
      };
      if (
        !["traditional", "code"].every((mode) =>
          r.traces.some((t) => t.mode === mode && t.status === "complete"),
        )
      )
        continue;
      for (const trace of r.traces)
        snapshots.set(`recorded:${r.id}:${trace.mode}`, {
          source: "recorded",
          recordingId: r.id,
          mode: trace.mode,
          model: trace.model,
          recordedAt: trace.recordedAt,
          metrics: trace.metrics,
        });
    } catch {}
  }
  await flush();
}
export function publishLiveMetric(event: TraceEvent) {
  if (!event.metrics) return;
  const model =
    (event.type === "run.start"
      ? (event.payload as { model?: string })?.model
      : undefined) ||
    snapshots.get(`live:${event.mode}`)?.model ||
    "configured-model";
  snapshots.set(`live:${event.mode}`, {
    source: "live",
    recordingId: "live",
    mode: event.mode,
    model,
    recordedAt: event.timestamp,
    metrics: event.metrics,
  });
  if (!timer)
    timer = setTimeout(() => {
      timer = undefined;
      void flush();
    }, 100);
}
````

### `lib/hosted-demo.ts`

````ts
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import type { Mode, RunTrace } from "../travel-lab/src/types";

interface Recording {
  id: string;
  recordedAt: string;
  prompt: string;
  catalogSize: number;
  model: string;
  traces: RunTrace[];
}
const sourceFiles = [
  "travel-lab/src/app.module.ts",
  "travel-lab/src/travel.tools.ts",
  "travel-lab/src/travel.service.ts",
  "travel-lab/src/dataset.ts",
  "travel-lab/src/server.ts",
  "travel-lab/src/mcp-client.ts",
  "travel-lab/src/runner.ts",
  "travel-lab/package.json",
];
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
function sanitize(value: unknown): unknown {
  if (typeof value === "string") {
    let text = value;
    for (const secret of [process.env.OPENAI_API_KEY, process.env.DEMO_AGENT_TOKEN])
      if (secret) text = text.split(secret).join("[REDACTED]");
    return text.replace(/Bearer\s+[\w.\-]+/gi, "Bearer [REDACTED]")
      .replace(/(?:gsk_|sk-)[A-Za-z0-9_-]{12,}/g, "[REDACTED]");
  }
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === "object")
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      /authorization|cookie|api.?key|password|secret|credential|token$/i.test(key) && !key.toLowerCase().includes("tokens")
        ? "[REDACTED]" : sanitize(item),
    ]));
  return value;
}
async function recordings(): Promise<Recording[]> {
  const directory = join(process.cwd(), "travel-lab", "recordings");
  const names = await readdir(directory).catch(() => [] as string[]);
  const results = await Promise.all(names.filter((name) => name.endsWith(".json") && uuid.test(name.slice(0, -5))).map(async (name) => {
    try {
      const record = sanitize(JSON.parse(await readFile(join(directory, name), "utf8"))) as Recording;
      if (!uuid.test(record.id) || !Array.isArray(record.traces)) return null;
      if (!["traditional", "code"].every((mode) => record.traces.some((trace) => trace.mode === mode && trace.status === "complete"))) return null;
      return record;
    } catch { return null; }
  }));
  return results.filter((record): record is Recording => !!record).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}
function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "cache-control": "no-store" } });
}
export async function hostedDemo(request: Request, endpoint: string): Promise<Response> {
  if (endpoint === "status" && request.method === "GET") {
    const saved = await recordings();
    const dashboard = process.env.GRAFANA_PUBLIC_URL || "";
    let grafanaReady = false;
    if (dashboard.startsWith("https://")) {
      grafanaReady = await fetch(new URL("/api/health", dashboard), { signal: AbortSignal.timeout(4000), cache: "no-store" })
        .then(async (response) => response.ok && (await response.json()).database === "ok")
        .catch(() => false);
    }
    return json({
      ready: true, executionMode: "recorded", hosting: "vercel",
      providerConfigured: false, model: saved[0]?.model || null,
      sdkVersion: "1.1.3", dataset: "travel-fixtures-2026-11-v1", busy: false,
      grafana: { ready: grafanaReady, url: dashboard, hosted: true },
      recordings: saved.map(({ traces, ...record }) => ({ ...record, modes: traces.map((trace) => trace.mode) })),
    });
  }
  if (endpoint === "sources" && request.method === "GET") {
    return json({
      files: await Promise.all(sourceFiles.map(async (path) => ({ path, code: await readFile(join(process.cwd(), path), "utf8") }))),
      commands: {
        scaffold: "npx @nitrostack/cli@1.1.3 init travel-example --preset code-mode --skip-install",
        build: "npm run build:lab", start: "npm run demo",
        traditional: "claude mcp add --transport stdio --env TRAVEL_MODE=traditional --env TRAVEL_CATALOG_SIZE=10 travel-traditional -- node travel-lab/dist/server.js",
        code: "claude mcp add --transport stdio --env TRAVEL_MODE=code --env TRAVEL_CATALOG_SIZE=10 travel-code -- node travel-lab/dist/server.js",
        inspect: "claude mcp list", record: "npm run record:demo",
      },
    });
  }
  if (request.method !== "POST") return json({ error: "POST required" }, 405);
  if (endpoint !== "replay") return json({ error: "This deployment plays genuine saved recordings. Live execution is available in the local lab." }, 409);
  let input: { id?: unknown; mode?: unknown };
  try { input = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  if (!input || typeof input !== "object" || typeof input.id !== "string" || !uuid.test(input.id)) return json({ error: "Choose a genuine recording" }, 400);
  if (input.mode !== undefined && !["traditional", "code", "both"].includes(String(input.mode))) return json({ error: "Choose traditional, code, or both for replay." }, 400);
  const record = (await recordings()).find((item) => item.id === input.id);
  if (!record) return json({ error: "Recording not found" }, 404);
  const modes: Mode[] = input.mode === "traditional" ? ["traditional"] : input.mode === "code" ? ["code"] : ["traditional", "code"];
  const traces = record.traces.filter((trace) => modes.includes(trace.mode));
  const events = traces.flatMap((trace) => trace.events).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  let cancelled = false;
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (value: unknown) => { if (!cancelled && !request.signal.aborted) controller.enqueue(encoder.encode(`data: ${JSON.stringify(value)}\n\n`)); };
      try {
        const { traces: _traces, ...metadata } = record;
        send({ type: "session.replay", recording: metadata, notice: "REPLAY — recorded genuine execution; no live model requests." });
        let previous = events[0]?.timestamp;
        for (const event of events) {
          if (cancelled || request.signal.aborted) break;
          const delay = Math.max(0, Math.min(250, Date.parse(event.timestamp) - Date.parse(previous || event.timestamp)));
          if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
          send(event); previous = event.timestamp;
        }
        if (!cancelled && !request.signal.aborted) send({ type: "session.complete", traces, replay: true, recordingId: record.id });
        if (!cancelled) controller.close();
      } catch (error) { if (!cancelled) controller.error(error); }
    },
    cancel() { cancelled = true; },
  });
  return new Response(stream, { headers: { "content-type": "text/event-stream", "cache-control": "no-store, no-transform", "x-accel-buffering": "no" } });
}
````

### `app/api/demo/[...path]/route.ts`

````ts
import type { NextRequest } from "next/server";
import { hostedDemo } from "../../../../lib/hosted-demo";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  if (
    path.length !== 1 ||
    !["status", "sources", "run", "replay", "security"].includes(path[0])
  )
    return Response.json({ error: "Unknown demo endpoint" }, { status: 404 });
  const origin = request.headers.get("origin");
  let originHost: string | undefined;
  try { originHost = origin ? new URL(origin).host : undefined; }
  catch { return Response.json({ error: "Invalid request origin" }, { status: 403 }); }
  if (
    (originHost &&
      originHost !==
        (request.headers.get("host") || request.nextUrl.host)) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return Response.json(
      { error: "Same-origin requests required" },
      { status: 403 },
    );
  if ((process.env.VERCEL === "1" || process.env.DEMO_HOSTED_REPLAY === "1") && !process.env.DEMO_AGENT_URL)
    return hostedDemo(request, path[0]);
  try {
    const baseUrl = process.env.DEMO_AGENT_URL || `http://127.0.0.1:${process.env.DEMO_AGENT_PORT || 4100}`;
    if (process.env.VERCEL === "1" && !baseUrl.startsWith("https://"))
      return Response.json({ error: "The hosted live agent requires an HTTPS endpoint." }, { status: 503 });
    const result = await fetch(
      `${baseUrl.replace(/\/$/, "")}/${path[0]}`,
      {
        method: request.method,
        headers: {
          "content-type": "application/json",
          ...(process.env.DEMO_AGENT_TOKEN ? { authorization: `Bearer ${process.env.DEMO_AGENT_TOKEN}` } : {}),
        },
        body: request.method === "POST" ? await request.text() : undefined,
        signal: request.signal,
        cache: "no-store",
      },
    );
    return new Response(result.body, {
      status: result.status,
      headers: {
        "content-type":
          result.headers.get("content-type") || "application/json",
        "cache-control": "no-store, no-transform",
        "x-accel-buffering": "no",
      },
    });
  } catch {
    return Response.json(
      {
        error:
          "Travel agent backend is not running. Start all services with npm run demo.",
      },
      { status: 503 },
    );
  }
}
export const GET = proxy;
export const POST = proxy;
````

### `components/grafana-dashboard.tsx`

````tsx
"use client";
import { useEffect, useState } from "react";
import { ExternalLink, Loader2, RefreshCw } from "lucide-react";
export default function GrafanaDashboard({
  recordingId,
}: {
  recordingId: string;
}) {
  const [ready, setReady] = useState(false),
    [dashboardUrl, setDashboardUrl] = useState("http://localhost:3300"),
    [hosted, setHosted] = useState(false),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const r = await fetch("/api/demo/status");
        const data = await r.json();
        if (alive) {
          setReady(!!data.grafana?.ready);
          setDashboardUrl(data.grafana?.url || "");
          setHosted(data.hosting === "vercel" || !!data.grafana?.hosted);
        }
      } catch {
        if (alive) setReady(false);
      }
    };
    void check();
    const timer = setInterval(check, 5000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [attempt]);
  let url = "";
  try {
    const target = new URL(dashboardUrl);
    if (["http:", "https:"].includes(target.protocol)) {
      if (target.pathname === "/") target.pathname = "/d/travel-agent-demo";
      for (const [key, value] of Object.entries({ orgId: "1", theme: "dark", kiosk: "true", refresh: "2s", "var-recording": recordingId })) target.searchParams.set(key, value);
      url = target.toString();
    }
  } catch {}
  return (
    <section
      className="grafana-dashboard"
      aria-label="Embedded Grafana execution dashboard"
    >
      <header>
        <div>
          <span className="eyebrow">GRAFANA · PROMETHEUS</span>
          <h3>{hosted ? "Recorded agent execution" : "Live agent execution"}</h3>
        </div>
        <div>
          <span className={`grafana-connection ${ready ? "ready" : ""}`}>
            <i />
            {ready ? hosted ? "Connected" : "Live" : hosted ? "Not connected" : "Connecting"}
          </span>
          {url && <a href={url} target="_blank" rel="noreferrer">
            Open Grafana
            <ExternalLink size={13} />
          </a>}
        </div>
      </header>
      {ready && recordingId && url ? (
        <iframe
          key={recordingId}
          title={`Grafana: Tool Calling and Code Mode ${hosted ? "recorded" : "live"} measurements`}
          src={url}
          loading="lazy"
        />
      ) : (
        <div className="grafana-loading">
          <Loader2 size={24} className="spinning" />
          <strong>
            {ready
              ? "Waiting for live metrics."
              : hosted ? url ? "Waking up the Grafana dashboard." : "Grafana is not connected to this deployment." : "Waiting for the local Grafana instance."}
          </strong>
          {hosted && url && <span>The free hosted instance may take about a minute to start. Connection checks continue automatically.</span>}
          {!hosted && <><span>Start Docker Desktop and run:</span><code>npm run observability:start</code></>}
          <button onClick={() => setAttempt((a) => a + 1)}>
            <RefreshCw size={14} />
            Check connection
          </button>
        </div>
      )}
    </section>
  );
}
````

### `scripts/dev-demo.mjs`

````js
import { spawn, spawnSync } from "node:child_process";
import { createConnection } from "node:net";
const children = [];
let stopping = false;
function start(args) {
  const p = spawn("npm", args, { stdio: "inherit", env: process.env });
  children.push(p);
  p.on("exit", (code) => {
    if (!stopping) {
      stop();
      process.exitCode = code || 0;
    }
  });
  return p;
}
function stop() {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill("SIGTERM");
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
await import("../travel-lab/dist/observability.js").then((module) =>
  module.refreshRecordedMetrics(),
);
const observability = spawnSync(
  "docker",
  ["compose", "-f", "observability/compose.yaml", "up", "-d"],
  { stdio: "inherit" },
);
if (observability.status !== 0)
  console.warn(
    "Grafana is not running yet. Start Docker Desktop and run npm run observability:start.",
  );
start(["run", "start", "--workspace", "@codemode/travel-lab"]);
// Reuse an already running Next preview; start one if the port is free.
const socket = createConnection({ port: 3000, host: "127.0.0.1" });
socket.once("connect", () => {
  console.log("Reusing the existing Next.js app at http://localhost:3000/demo");
  socket.end();
});
socket.once("error", () => start(["run", "start"]));
````

### `scripts/prepare-observability.mjs`

````js
import { cp, mkdir, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
export async function prepareObservability(directory) {
  const target = directory || await mkdtemp(join(tmpdir(), "code-mode-grafana-"));
  await mkdir(target, { recursive: true });
  const files = [
    "observability/cloud-run/start.sh",
    "observability/cloud-run/prometheus.yml",
    "observability/cloud-run/datasource.yaml",
    "observability/grafana/provisioning/dashboards/default.yaml",
    "travel-lab/src/observability.ts",
  ];
  for (const file of files) {
    const destination = join(target, file.replace(/^observability\//, ""));
    await mkdir(dirname(destination), { recursive: true });
    await cp(join(root, file), destination);
  }
  await cp(join(root, "observability/cloud-run/Dockerfile"), join(target, "Dockerfile"));
  const dashboard = JSON.parse(await readFile(join(root, "observability/grafana/dashboards/travel-demo.json"), "utf8"));
  dashboard.title = "NitroStack · Recorded agent execution";
  dashboard.tags = ["nitrostack", "mcp", "recorded"];
  const dashboardPath = join(target, "grafana/dashboards/travel-demo.json");
  await mkdir(dirname(dashboardPath), { recursive: true });
  await writeFile(dashboardPath, JSON.stringify(dashboard, null, 2));
  const recordings = join(root, "travel-lab/recordings");
  const destination = join(target, "travel-lab/recordings");
  await mkdir(destination, { recursive: true });
  let pairs = 0;
  for (const file of (await readdir(recordings)).filter((name) => /^[a-f0-9-]{36}\.json$/i.test(name))) {
    const record = JSON.parse(await readFile(join(recordings, file), "utf8"));
    if (!Array.isArray(record.traces) || !["traditional", "code"].every((mode) => record.traces.some((trace) => trace.mode === mode && trace.status === "complete"))) continue;
    // Cloud Build receives only public aggregate measurements, never raw events,
    // generated scripts, provider credentials, local env files, or prompts.
    const snapshot = {
      id: record.id, model: record.model, recordedAt: record.recordedAt,
      traces: record.traces.map(({ mode, status, recordedAt, model, metrics }) => ({ mode, status, recordedAt, model, metrics })),
    };
    await writeFile(join(destination, file), JSON.stringify(snapshot));
    pairs++;
  }
  if (!pairs) throw new Error("No genuine complete recording pairs found.");
  await writeFile(join(target, ".gcloudignore"), ".git\n.env*\nnode_modules\n");
  return { directory: target, recordingPairs: pairs };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(await prepareObservability(process.argv[2]), null, 2));
}
````

### `render.yaml`

````yaml
services:
  - type: web
    name: code-mode-grafana
    runtime: docker
    plan: free
    region: singapore
    dockerContext: ./observability/render
    dockerfilePath: ./observability/render/Dockerfile
    healthCheckPath: /api/health
    envVars:
      - key: GOMEMLIMIT
        value: 128MiB
      - key: GOMAXPROCS
        value: "2"
      - key: GF_UNIFIED_ALERTING_ENABLED
        value: "false"
````

### `observability/render/Dockerfile`

````dockerfile
FROM node:22-alpine AS measurements
WORKDIR /build
COPY travel-lab/src/observability.ts travel-lab/src/observability.ts
COPY travel-lab/recordings/ travel-lab/recordings/
RUN node --experimental-strip-types --input-type=module -e "import('./travel-lab/src/observability.ts').then(module => module.refreshRecordedMetrics())"

FROM prom/prometheus:v3.8.0 AS prometheus

FROM grafana/grafana:13.2.1
USER root
RUN apk add --no-cache busybox-extras bash
COPY --from=prometheus /bin/prometheus /usr/local/bin/prometheus
COPY --from=measurements /build/observability/metrics/metrics.txt /opt/travel-observability/metrics/metrics.txt
COPY cloud-run/prometheus.yml /etc/prometheus/prometheus.yml
COPY cloud-run/datasource.yaml /etc/grafana/provisioning/datasources/prometheus.yaml
COPY grafana/provisioning/dashboards/default.yaml /etc/grafana/provisioning/dashboards/default.yaml
COPY grafana/dashboards/travel-demo.json /etc/grafana/dashboards/travel-demo.json
COPY cloud-run/start.sh /opt/travel-observability/start.sh
RUN chmod 755 /opt/travel-observability/start.sh
ENV GF_PATHS_DATA=/tmp/grafana-data \
    GF_PATHS_LOGS=/tmp/grafana-logs \
    GF_PATHS_PLUGINS=/tmp/grafana-plugins \
    GF_AUTH_ANONYMOUS_ENABLED=true \
    GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer \
    GF_AUTH_DISABLE_LOGIN_FORM=true \
    GF_AUTH_BASIC_ENABLED=false \
    GF_USERS_ALLOW_SIGN_UP=false \
    GF_SECURITY_ALLOW_EMBEDDING=true \
    GF_SECURITY_COOKIE_SECURE=true \
    GF_SECURITY_COOKIE_SAMESITE=none \
    GF_SECURITY_CONTENT_SECURITY_POLICY=true \
    GF_SECURITY_CONTENT_SECURITY_POLICY_TEMPLATE="frame-ancestors 'self' https://code-mode-presentation.vercel.app" \
    GF_ANALYTICS_REPORTING_ENABLED=false \
    GF_ANALYTICS_CHECK_FOR_UPDATES=false \
    GF_NEWS_NEWS_FEED_ENABLED=false \
    GF_PLUGINS_PREINSTALL_DISABLED=true \
    GF_USERS_DEFAULT_THEME=dark
USER 472
EXPOSE 8080
ENTRYPOINT ["/opt/travel-observability/start.sh"]
````

### `observability/render/cloud-run/start.sh`

````bash
#!/usr/bin/env bash
set -euo pipefail

export GF_SERVER_HTTP_ADDR=0.0.0.0
export GF_SERVER_HTTP_PORT="${PORT:-8080}"
# Only anonymous Viewer access is exposed. Bootstrap credentials are generated
# per container and never printed, stored in the image, or sent to the browser.
export GF_SECURITY_ADMIN_PASSWORD="$(head -c 48 /dev/urandom | base64 | tr -d '\n')"
mkdir -p /tmp/prometheus "$GF_PATHS_DATA" "$GF_PATHS_LOGS" "$GF_PATHS_PLUGINS"

/bin/busybox-extras httpd -f -p 127.0.0.1:9096 -h /opt/travel-observability/metrics &
metrics_pid=$!
/usr/local/bin/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --web.listen-address=127.0.0.1:9090 \
  --storage.tsdb.path=/tmp/prometheus \
  --storage.tsdb.retention.time=1h \
  --storage.tsdb.retention.size=128MB \
  --query.max-concurrency=2 \
  --query.max-samples=100000 \
  --query.timeout=10s &
prometheus_pid=$!
/run.sh &
grafana_pid=$!
cleanup() { kill "$grafana_pid" "$prometheus_pid" "$metrics_pid" 2>/dev/null || true; }
trap cleanup EXIT TERM INT
# Restart the container if any required process exits.
wait -n "$grafana_pid" "$prometheus_pid" "$metrics_pid"
````

### `observability/render/cloud-run/prometheus.yml`

````yaml
global:
  scrape_interval: 2s
  evaluation_interval: 2s
scrape_configs:
  - job_name: travel-agent-recordings
    metrics_path: /metrics.txt
    fallback_scrape_protocol: PrometheusText0.0.4
    static_configs:
      - targets: [127.0.0.1:9096]
````

### `observability/render/cloud-run/datasource.yaml`

````yaml
apiVersion: 1
datasources:
  - name: Travel execution metrics
    uid: travel-prometheus
    type: prometheus
    access: proxy
    url: http://127.0.0.1:9090
    isDefault: true
    editable: false
````

### `observability/compose.yaml`

````yaml
name: codemode-observability
services:
  metrics:
    image: busybox:1.37.0
    command: ["httpd", "-f", "-p", "8080", "-h", "/www"]
    volumes:
      - ./metrics:/www:ro
    read_only: true
    restart: unless-stopped
  prometheus:
    image: prom/prometheus:v3.8.0
    command: ["--config.file=/etc/prometheus/prometheus.yml", "--storage.tsdb.retention.time=1d", "--storage.tsdb.path=/prometheus", "--web.enable-lifecycle"]
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
    tmpfs:
      - /prometheus:rw,size=256m,uid=65534,gid=65534,mode=0755
    ports:
      - "127.0.0.1:9095:9090"
    depends_on: [metrics]
    restart: unless-stopped
  grafana:
    image: grafana/grafana:12.3.0
    environment:
      GF_SERVER_ROOT_URL: "http://localhost:3300"
      GF_PLUGINS_PREINSTALL_DISABLED: "true"
      GF_SECURITY_ALLOW_EMBEDDING: "true"
      GF_AUTH_ANONYMOUS_ENABLED: "true"
      GF_AUTH_ANONYMOUS_ORG_ROLE: "Viewer"
      GF_AUTH_DISABLE_LOGIN_FORM: "true"
      GF_AUTH_BASIC_ENABLED: "false"
      GF_USERS_ALLOW_SIGN_UP: "false"
      GF_ANALYTICS_REPORTING_ENABLED: "false"
      GF_ANALYTICS_CHECK_FOR_UPDATES: "false"
      GF_NEWS_NEWS_FEED_ENABLED: "false"
      GF_USERS_DEFAULT_THEME: "dark"
      GF_DASHBOARDS_DEFAULT_HOME_DASHBOARD_PATH: /etc/grafana/dashboards/travel-demo.json
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning:ro
      - ./grafana/dashboards:/etc/grafana/dashboards:ro
    tmpfs:
      - /var/lib/grafana:rw,size=256m,uid=472,gid=472,mode=0755
    ports:
      - "127.0.0.1:3300:3000"
    depends_on: [prometheus]
    restart: unless-stopped
````

### `observability/grafana/provisioning/dashboards/default.yaml`

````yaml
apiVersion: 1
providers:
  - name: Travel agent comparison
    orgId: 1
    folder: NitroStack
    type: file
    disableDeletion: true
    updateIntervalSeconds: 5
    allowUiUpdates: false
    options:
      path: /etc/grafana/dashboards
````

### `observability/grafana/provisioning/datasources/prometheus.yaml`

````yaml
apiVersion: 1
datasources:
  - name: Travel execution metrics
    uid: travel-prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
````

