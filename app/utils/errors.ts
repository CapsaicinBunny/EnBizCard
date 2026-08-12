/**
 * `catch` binds `unknown`, so unwrap a message without assuming an Error.
 *
 * Lives in `app/utils/` rather than in a component so it is one of the few
 * things `tsc --noEmit` actually checks — vue-tsc cannot read SFCs (see
 * CLAUDE.md), so a copy inside a `.vue` file would be unverified.
 */
export function errorText(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}
