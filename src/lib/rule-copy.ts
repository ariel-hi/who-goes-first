/** Presentation copy only; never normalizes or mutates an approved title.
 * An optional clipped display title lets OG images retain their existing limit.
 */
export function ruleHeading(gameName: string, displayName = gameName): string {
  return /[.!?…]$/u.test(gameName)
    ? `Starting rule for ${displayName}`
    : `Who goes first in ${displayName}?`;
}
