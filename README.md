# Snake Classic

A two-mode canvas Snake game with keyboard, swipe and on-screen controls in 12 languages.

## Measurement

Private exact-once stages are:

`snake_view` → `snake_start` → `snake_progress` → `snake_complete`

- Opening menus, selecting a mode, retrying and resetting do not count as a start.
- Start requires activating the board; progress requires the first completed grid movement.
- Completion requires game over.
- Successful sharing and related-card selection emit `snake_share` and `snake_related_click` without score, rank, mode, duration, food, direction, language or URL.

## Advertising

Ad serving is suspended for the invalid-traffic restriction that began on 2026-09-03. No loader, manual unit, interstitial, rewarded revive or simulated ad surface remains.

## Verification

Run `npm run verify:snake-suspension` from the portfolio root.
