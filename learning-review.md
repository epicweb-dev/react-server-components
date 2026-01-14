# React Server Components Workshop - Learning Review

## Overview
This document captures my experience completing the React Server Components workshop by Kent C. Dodds on EpicReact.dev.

---

## Exercise 01: Warm Up

### Exercise 01.01: Static React App

**Objective:** Set up a basic hono.js server to serve static assets and a data API endpoint.

**Solution diff notes:** My solution matched the official solution functionally. Only differences were:
- Comments I left in the code (non-harmful)
- Minor parentheses formatting around arrow function parameters

**Feedback:** no notes.

The exercise successfully introduces the application codebase and hono.js server setup without overwhelming with React Server Components concepts too early. The "hand-holdy" approach with commented-out solution code makes this appropriate as a warm-up.

---

## Exercise 02: Server Components

### Exercise 02.01: RSCs

**Objective:** Implement React Server Components by using `react-server-dom-esm` to generate serialized JSX on the server and render it in the browser.

**Solution diff notes:** My solution matched exactly - no differences.

**Feedback:** no notes.

The exercise excellently explains the `react-server` export condition concept and why RSCs need a special environment. The step-by-step approach (package.json → import map → server → client) creates a clear mental model of how RSC data flows through the system.

---

### Exercise 02.02: Async Components

**Objective:** Refactor components to use async/await for data loading instead of receiving data as props from the server route.

**Solution diff notes:** My solution matched exactly - no differences.

**Feedback:** no notes.

This exercise clearly demonstrates the benefit of RSCs - components can load their own data with async/await. The transformation from "data-as-props" to "data-in-component" is straightforward and impactful.

---

### Exercise 02.03: Streaming

**Objective:** Add Suspense boundaries around async server components to enable granular loading states and out-of-order streaming.

**Solution diff notes:** My solution matched with only trivial import ordering difference (`Suspense, Fragment` vs `Fragment, Suspense`).

**Feedback:** no notes.

The exercise effectively demonstrates how Suspense works with RSCs for streaming. The pre-built fallback components (ShipFallback, SearchResultsFallback) minimize boilerplate and keep focus on the Suspense concept.

---

### Exercise 02.04: Server Context

**Objective:** Use Node.js `AsyncLocalStorage` to eliminate prop drilling for `search` and `shipId` values across server components.

**Solution diff notes:** My solution matched with only cosmetic formatting differences (multi-line vs single-line h() calls, import ordering).

**Feedback:** no notes.

Excellent introduction to `AsyncLocalStorage` as a replacement for React Context in RSC environments. The explanation of why Context doesn't work in RSCs and the recommended alternative is valuable knowledge.

---

## Exercise 03: Client Components

### Exercise 03.01: Node.js Loader

**Objective:** Register a Node.js custom loader to handle `'use client'` modules and transform their exports into reference registrations.

**Solution diff notes:** My solution matched exactly - no differences.

**Feedback:** no notes.

The exercise effectively demonstrates how the RSC bundler handles `'use client'` directives through Node.js custom loaders. The console.log debugging approach helps visualize what the server sees for client components.

---

### Exercise 03.02: Module Resolution

**Objective:** Configure `renderToPipeableStream` and `createFromFetch` with module base paths so client component references are properly resolved.

**Solution diff notes:** My solution matched exactly - no differences.

**Feedback:** no notes.

Clear explanation of the server-side and client-side module resolution requirements. The warning about esm.sh and needing full URLs is helpful context.

---

## Exercise 04: Client Router

### Exercise 04.01: Client Router

**Objective:** Implement client-side navigation to avoid full page refreshes when users search and select ships.

**Solution diff notes:** My solution matched exactly - no differences after aligning with minor formatting conventions.

**Feedback:** no notes.

Good introduction to building a custom router for RSC apps. The pre-built `useLinkHandler` utility and `mergeLocationState` helper keep focus on the navigation logic rather than boilerplate. Clear explanation of `pushState` vs `replaceState` usage.

---

### Exercise 04.02: Pending UI

**Objective:** Implement pending UI states using `useTransition`, `useDeferredValue`, and show visual feedback during navigation.

**Solution diff notes:** My solution matched exactly after including all required changes (ShipDetailsPendingTransition, useSpinDelay for extra credit).

**Feedback:** no notes.

Excellent exercise on pending states. The approach of using `useDeferredValue` to keep the old location until the transition completes is elegant. The extra credit with `useSpinDelay` to avoid flash of loading state is a nice UX touch.

---

### Exercise 04.03: Race Conditions

**Objective:** Prevent out-of-order navigation updates using a ref to track the latest navigation request.

**Solution diff notes:** My solution matched exactly - no differences.

**Feedback:** no notes.

Simple but effective pattern using Symbol and a ref to handle race conditions. The explanation is clear and the test scenario (simulated delay for "st" search) helps verify the fix works.

---

### Exercise 04.04: History

**Objective:** Handle browser back/forward buttons by listening to the `popstate` event.

**Solution diff notes:** My solution matched exactly - no differences.

**Feedback:** no notes.

Straightforward exercise on handling browser history navigation. Clear explanation of the popstate event and proper cleanup in useEffect.

---

### Exercise 04.05: Cache

**Objective:** Implement content caching using `window.history.state` to enable instant back/forward navigation without refetching.

**Solution diff notes:** My solution matched exactly - no differences.

**Feedback:** no notes.

Clever use of `window.history.state` as a cache key. The ObservableMap pattern with `useSyncExternalStore` is elegant for triggering re-renders on cache updates.

---

## Exercise 05: Server Actions

### Exercise 05.01: Action Reference

**Objective:** Create a server action with `'use server'` directive and wire it up to a client component using `useActionState`.

**Solution diff notes:** My solution matched exactly - no differences.

**Feedback:** no notes.

Good introduction to server actions. The debug logging helps visualize how the RSC loader transforms `'use server'` modules into references. Clear warning about `react-server-dom-esm` form handling.

---

### Exercise 05.02: Client Side

**Objective:** Implement the `callServer` function to handle action calls from the client, sending them to the server via POST request.

**Solution diff notes:** My solution matched exactly - no differences.

**Feedback:** no notes.

Clear explanation of how `callServer` works with `createFromFetch`. The use of `RSC.encodeReply` for serializing arguments is an important detail.

---

### Exercise 05.03: Server Side

**Objective:** Handle server action POST requests by parsing the action reference, importing the action function, and executing it.

**Solution diff notes:** My solution matched exactly - no differences.

**Feedback:** no notes.

Good coverage of the server-side action handling. The validation of `$$typeof` for server references is an important security consideration that's explicitly called out.

---

### Exercise 05.04: Revalidation

**Objective:** Update the UI after server actions by caching the new RSC payload and triggering a re-render when the stream completes.

**Solution diff notes:** My solution matched exactly - no differences.

**Feedback:** no notes.

This is a complex but well-explained exercise. The `onStreamFinished` utility pattern for waiting on stream completion is clever. The explanation of why we need to reassign `updateContentKey` from within the component is clear.

---

### Exercise 05.05: History Revalidation

**Objective:** Revalidate cached content when navigating back/forward to ensure up-to-date data after server actions.

**Solution diff notes:** My solution matched exactly - no differences.

**Feedback:** no notes.

Nice culmination of the workshop. The approach of always fetching new content on popstate while using the cached version initially (if available) provides the best UX.

---

## Workshop Summary

**Overall Assessment:** Excellent workshop on React Server Components.

**Strengths:**
- Progressive complexity - each exercise builds naturally on the previous
- Clear explanations of RSC concepts (server vs client components, streaming, actions)
- Practical patterns (AsyncLocalStorage, content caching, race condition handling)
- Good balance between hand-holding early on and more independent work later

**All exercises completed successfully with solutions matching the official solutions.**

