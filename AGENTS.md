<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Phase 1 uses TanStack routes for the application shell and a streaming server route for Copilot; this preserves the project's server boundary and supports live AI output.
- Copilot saves one user-owned conversation in Lovable Cloud with row-level access; this matches the selected cross-device history model.
- Planned future workspaces appear as distinct preview routes, not simulated working tools; this keeps Phase 1 navigation coherent without implying unbuilt science features exist.
- Email verification and OAuth return to the public /auth/callback route, which completes the session client-side; protected destinations are reached only after the session exists.
- Shell transitions animate a stable content wrapper without pathname keys or filters to avoid extra page remounts and expensive compositing.
- Signed-out Copilot uses natural document height so authentication controls remain reachable; only signed-in chat has viewport-constrained scrolling.
