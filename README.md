# @neoffice/nora-learn-react

Standalone React package that brings Nora's interactive Learn tutorials to SPA apps (Mint, Raven, Helpdesk). Full port of the Frappe Desk Learn system with zero `frappe.*` dependencies.

## Features

- **Step-by-step sidebar** — Floating panel with progress bar, step messages, Continue/Do-it-for-me buttons
- **Auto-proposal popup** — Notification card when a matching Learn is available for the current route
- **Element highlighting** — Violet glow on target DOM elements with positioned popover
- **Ask NORA chat** — OpenClaw AI integration for contextual help during tutorials
- **Prerequisite dialog** — Handles mandatory and recommended prerequisites
- **Auto-resume** — Resumes interrupted sessions from localStorage (10min window)
- **Snooze/Dismiss** — 24h snooze or permanent dismiss per learn
- **Dark mode** — Full dark mode support via `[data-theme="dark"]`

## Installation

```bash
yarn add git+https://github.com/bvisible/nora-learn-react.git#main
```

## Usage

```tsx
// App.tsx
import { NoraLearnProvider } from '@neoffice/nora-learn-react'
import '@neoffice/nora-learn-react/styles'
import { toast } from 'sonner'

function App() {
  return (
    <FrappeProvider>
      <NoraLearnProvider config={{
        appName: 'mint',
        navigate: (url) => { window.location.href = url },
        getCurrentRoute: () => window.location.pathname,
        showAlert: (msg, variant) => toast[variant](msg),
      }}>
        {/* Your app content */}
      </NoraLearnProvider>
    </FrappeProvider>
  )
}
```

That's it. The provider handles everything: auto-proposal, session management, sidebar, chat.

## Config options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `appName` | `string` | — | App identifier for context |
| `navigate` | `(url) => void` | `window.location.href = url` | Navigation function |
| `getCurrentRoute` | `() => string` | `window.location.pathname` | Current route getter |
| `showAlert` | `(msg, variant) => void` | `console.log` | Toast/alert function |
| `csrfToken` | `string` | `window.csrf_token` | CSRF token for API calls |
| `noraIconUrl` | `string` | `/assets/nora/images/nora_icon.svg` | NORA icon URL |
| `translate` | `(text) => string` | `frappe._messages` lookup | Translation function |

## Architecture

```
src/
├── core/           # Framework-agnostic (extractable for Vue later)
│   ├── types.ts    # TypeScript interfaces
│   ├── api.ts      # HTTP client (fetch + CSRF) for Learn + Chat APIs
│   ├── session.ts  # LearnSession engine (port of nora_learn_player.js)
│   ├── browser-actions.ts  # highlight, click, set_value, navigate
│   └── utils.ts    # escapeHtml, renderMarkdown, translate
├── hooks/          # React hooks
│   ├── useLearnSession.ts     # Session lifecycle
│   ├── useAvailableLearns.ts  # Boot data + route matching
│   └── useRouteChange.ts     # pushState/popstate detection
├── components/     # React components (all render via portals)
│   ├── NoraLearnProvider.tsx  # Context + orchestrator
│   ├── LearnSidebar.tsx       # Floating sidebar
│   ├── LearnPopup.tsx         # Notification card
│   ├── StepPopover.tsx        # Positioned popover with arrow
│   ├── StepMessage.tsx        # Step content + buttons
│   ├── ChatArea.tsx           # Ask NORA (OpenClaw)
│   └── PrerequisiteDialog.tsx # Prerequisite dialog
└── styles/
    └── nora-learn.css         # Full CSS (sidebar, popover, assist panel, dark mode)
```

## API endpoints used

All endpoints are from `nora.api.learn_engine` (standard Frappe session auth):

- `start_learn`, `get_learn_state`, `get_step_as_message`
- `advance_step`, `pause_learn`, `complete_learn`, `reset_learn`
- `get_available_learns`, `cleanup_nora_demo_documents`

Chat endpoints from `nora.api.quick_chat`:

- `start_conversation`, `send_message_in_thread`
- `get_thread_messages`, `get_browser_actions`

## Creating SPA-compatible Learns

When authoring Nora Learn documents for SPA apps:

- Set `entry_route` starting with `/` (e.g., `/mint`, `/raven`)
- Use **CSS selectors** in `action_target` (not Frappe fieldnames)
- Use DOM-based `wait_condition` (not `cur_frm.doc.*`)
- Test that `highlight_actions` selectors match the SPA's DOM

## Development

```bash
yarn install
yarn dev    # Watch mode
yarn build  # Production build
```

## Related

- **Nora** — `bvisible/nora` (Frappe app with Learn DocTypes + API)
- **frappe-sidebar-react** — `bvisible/frappe-sidebar-react` (same package pattern)
