# Infinite Table vs PrimeNG Table vs AG Grid vs TanStack Table vs NG-ZORRO Table — benchmark report

- Run: `ci` · 2026-11-26T13:38:46.738Z
- Infinite Table 11.0.0 · PrimeNG Table 21.1.10 · AG Grid 36.3.0 · TanStack Table 9.3.2 · NG-ZORRO Table 22.2.1
- 1,000,000 rows (data checksum `1000000:19e5eebe`) × 20 columns, identical data for every grid
- Chrome 136.0.7103.25 · headless · CPU throttling 1× · viewport 1400×1000
- 5 measured runs per grid per scenario (+1 warmup, discarded), interleaved, fresh browser context per run
- Linux 7.0.0-1017-azure x64 · AMD EPYC 7763 64-Core Processor × 4
- Served from http://localhost:5580/
- Grid body: 759-760 px high, with the same number of rows in view in every grid (to get there, the setup made the boxes taller: Infinite +24 px, AG Grid +3 px, TanStack +2 px)

The "Infinite vs ..." columns compare Infinite Table with one other grid: the ratio of the medians (Infinite / other, so < 1 means Infinite has the lower value), its 95% bootstrap confidence interval, and the grid that does better. A grid is only named when the interval excludes 1; "≈" means no significant difference. When the other grid has zeros among its values (e.g. 0% blank samples) a ratio means nothing, so the difference of the medians (Infinite − other) and its interval are shown instead, and a grid is only named when that interval excludes 0.

# 1,000,000 rows

Scroll range - browsers cap element sizes (Chrome ~16.7M-33.5M px, depending on the version), so a grid has to map the scrollbar onto the rows when the content is taller than that. One that doesn't can't reach its last rows: its scrolling results are for the rows it can reach, and the same wheel gesture goes over fewer rows in it.

| | Infinite | PrimeNG | AG Grid | TanStack | NG-ZORRO |
|---|---:|---:|---:|---:|---:|
| Last row reachable with the scrollbar | yes (1,000,000) | **no** - stops at row 838,881 | yes (1,000,000) | **no** - stops at row 838,860 | **no** - stops at row 838,861 |
| Native scroll range | 31,999,240 px | 33,553,632 px | 31,999,240 px | 33,553,630 px | 33,553,668 px |
| Content px per scrollbar px | 1.250 | 1.000 | 1.250 | 1.000 | 1.000 |

## mount - 1,000,000 rows

Mount the grid with all the rows (data already in memory). "Visible" = from setState to the end of the first frame committed with the whole viewport (first/last visible row and column) showing the right content. "Settled" = until the first frame committed after the grid's last DOM mutation. Memory is the JS heap retained by the grid after GC (heap after mount - heap before mount).

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Time to first rows painted (lower is better) | 589 ms (±4.65) | 125 ms (±4.31) | 948 ms (±13.1) | 866 ms (±7.45) | 119 ms (±6.08) | 4.71 × (4.56–4.97) **PrimeNG** | 0.62 × (0.60–0.63) **Infinite** | 0.68 × (0.67–0.68) **Infinite** | 4.96 × (4.56–5.09) **NG-ZORRO** |
| Time until settled (lower is better) | 629 ms (±4.96) | 125 ms (±4.31) | 1053 ms (±11.5) | 866 ms (±7.45) | 161 ms (±4.60) | 5.03 × (4.88–5.31) **PrimeNG** | 0.60 × (0.58–0.60) **Infinite** | 0.73 × (0.71–0.73) **Infinite** | 3.91 × (3.75–4.02) **NG-ZORRO** |
| Main thread: layout (lower is better) | 4.26 ms (±0.12) | 12.2 ms (±0.29) | 8.74 ms (±0.15) | 4.78 ms (±0.12) | 10.1 ms (±0.17) | 0.35 × (0.33–0.36) **Infinite** | 0.49 × (0.46–0.50) **Infinite** | 0.89 × (0.84–0.91) **Infinite** | 0.42 × (0.39–0.43) **Infinite** |
| Main thread: style recalc (lower is better) | 8.39 ms (±0.46) | 7.06 ms (±0.16) | 14.8 ms (±0.51) | 2.04 ms (±0.40) | 9.08 ms (±0.39) | 1.19 × (1.15–1.31) **PrimeNG** | 0.57 × (0.54–0.62) **Infinite** | 4.12 × (2.94–4.64) **TanStack** | 0.92 × (0.86–1.02) ≈ |
| Main thread: all tasks (lower is better) | 658 ms (±6.07) | 127 ms (±4.03) | 967 ms (±14.0) | 893 ms (±7.34) | 281 ms (±8.10) | 5.19 × (5.04–5.47) **PrimeNG** | 0.68 × (0.66–0.69) **Infinite** | 0.74 × (0.73–0.75) **Infinite** | 2.34 × (2.21–2.38) **NG-ZORRO** |
| JS heap retained by grid (lower is better) | 90.6 MB (±0.03) | 2.15 MB (±0.00) | 212 MB (±0.01) | 288 MB (±0.07) | 14.2 MB (±0.00) | 42.1 × (42.1–42.1) **PrimeNG** | 0.43 × (0.43–0.43) **Infinite** | 0.31 × (0.31–0.31) **Infinite** | 6.38 × (6.38–6.38) **NG-ZORRO** |
| DOM elements in grid (lower is better) | 609 (±0.00) | 1068 (±0.00) | 637 (±0.00) | 352 (±0.00) | 797 (±0.00) | 0.57 × (0.57–0.57) **Infinite** | 0.96 × (0.96–0.96) **Infinite** | 1.73 × (1.73–1.73) **TanStack** | 0.76 × (0.76–0.76) **Infinite** |

## sort-string - 1,000,000 rows

Click the "code" column header (string column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Ascending: click to sorted rows painted (lower is better) | 1773 ms (±34.4) | 1591 ms (±69.8) | 3465 ms (±22.4) | 4280 ms (±112) | 1407 ms (±9.38) | 1.11 × (1.02–1.16) **PrimeNG** | 0.51 × (0.51–0.53) **Infinite** | 0.41 × (0.41–0.44) **Infinite** | 1.26 × (1.25–1.31) **NG-ZORRO** |
| Ascending: click to settled (lower is better) | 1776 ms (±34.4) | 1591 ms (±69.8) | 3465 ms (±22.4) | 4280 ms (±112) | 1407 ms (±9.38) | 1.12 × (1.02–1.16) **PrimeNG** | 0.51 × (0.51–0.53) **Infinite** | 0.41 × (0.41–0.44) **Infinite** | 1.26 × (1.25–1.31) **NG-ZORRO** |
| Descending: click to sorted rows painted (lower is better) | 1817 ms (±38.4) | 348 ms (±1.99) | 3460 ms (±15.3) | 4108 ms (±116) | 1424 ms (±8.69) | 5.22 × (5.13–5.41) **PrimeNG** | 0.53 × (0.52–0.54) **Infinite** | 0.44 × (0.42–0.46) **Infinite** | 1.28 × (1.25–1.32) **NG-ZORRO** |
| Descending: click to settled (lower is better) | 1817 ms (±38.4) | 348 ms (±1.99) | 3460 ms (±15.3) | 4108 ms (±116) | 1424 ms (±8.69) | 5.22 × (5.13–5.41) **PrimeNG** | 0.53 × (0.52–0.54) **Infinite** | 0.44 × (0.42–0.46) **Infinite** | 1.28 × (1.25–1.32) **NG-ZORRO** |
| Ascending: main thread, all tasks (lower is better) | 1834 ms (±31.9) | 1753 ms (±78.3) | 3808 ms (±46.3) | 4282 ms (±112) | 1483 ms (±22.3) | 1.05 × (0.96–1.08) ≈ | 0.48 × (0.47–0.50) **Infinite** | 0.43 × (0.42–0.45) **Infinite** | 1.24 × (1.20–1.28) **NG-ZORRO** |
| Descending: main thread, all tasks (lower is better) | 1831 ms (±37.6) | 349 ms (±2.03) | 3463 ms (±15.3) | 4108 ms (±116) | 1425 ms (±8.62) | 5.26 × (5.17–5.44) **PrimeNG** | 0.53 × (0.52–0.55) **Infinite** | 0.45 × (0.43–0.47) **Infinite** | 1.29 × (1.26–1.33) **NG-ZORRO** |

## sort-number - 1,000,000 rows

Click the "salary" column header (number column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Ascending: click to sorted rows painted (lower is better) | 656 ms (±7.53) | 1339 ms (±9.85) | 2959 ms (±23.8) | 3565 ms (±81.0) | 903 ms (±37.1) | 0.49 × (0.49–0.50) **Infinite** | 0.22 × (0.22–0.23) **Infinite** | 0.18 × (0.18–0.19) **Infinite** | 0.73 × (0.67–0.74) **Infinite** |
| Ascending: click to settled (lower is better) | 659 ms (±7.53) | 1339 ms (±9.85) | 2959 ms (±23.8) | 3565 ms (±81.0) | 903 ms (±37.1) | 0.49 × (0.49–0.50) **Infinite** | 0.22 × (0.22–0.23) **Infinite** | 0.18 × (0.18–0.19) **Infinite** | 0.73 × (0.67–0.75) **Infinite** |
| Descending: click to sorted rows painted (lower is better) | 642 ms (±35.9) | 503 ms (±3.34) | 3021 ms (±17.1) | 3290 ms (±83.2) | 925 ms (±5.11) | 1.28 × (1.25–1.43) **PrimeNG** | 0.21 × (0.21–0.24) **Infinite** | 0.20 × (0.19–0.22) **Infinite** | 0.69 × (0.68–0.78) **Infinite** |
| Descending: click to settled (lower is better) | 642 ms (±35.9) | 503 ms (±3.34) | 3021 ms (±17.1) | 3290 ms (±83.2) | 925 ms (±5.11) | 1.28 × (1.25–1.43) **PrimeNG** | 0.21 × (0.21–0.24) **Infinite** | 0.20 × (0.19–0.22) **Infinite** | 0.69 × (0.68–0.78) **Infinite** |
| Ascending: main thread, all tasks (lower is better) | 712 ms (±10.2) | 1486 ms (±34.0) | 3266 ms (±82.7) | 4044 ms (±236) | 1071 ms (±73.5) | 0.48 × (0.46–0.49) **Infinite** | 0.22 × (0.21–0.22) **Infinite** | 0.18 × (0.17–0.20) **Infinite** | 0.66 × (0.58–0.69) **Infinite** |
| Descending: main thread, all tasks (lower is better) | 667 ms (±34.9) | 660 ms (±34.7) | 3323 ms (±45.5) | 3290 ms (±83.2) | 1069 ms (±10.9) | 1.01 × (0.92–1.11) ≈ | 0.20 × (0.19–0.22) **Infinite** | 0.20 × (0.19–0.22) **Infinite** | 0.62 × (0.61–0.69) **Infinite** |

## scroll-jump - 1,000,000 rows

Programmatic jumps to 10 far-away scroll positions (like dragging the scrollbar thumb). Measured from setting scrollTop to the end of the first frame committed with the first and last visible rows showing the right content, at the right position.

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Jump to rows painted (median of jumps) (lower is better) | 43.0 ms (±1.44) | 52.0 ms (±1.33) | 34.5 ms (±0.22) | 29.3 ms (±0.56) | 23.1 ms (±0.51) | 0.83 × (0.79–0.87) **Infinite** | 1.25 × (1.21–1.31) **AG Grid** | 1.46 × (1.41–1.54) **TanStack** | 1.86 × (1.78–1.95) **NG-ZORRO** |
| Jump to rows painted (worst jump) (lower is better) | 60.4 ms (±20.1) | 72.2 ms (±3.16) | 68.5 ms (±1.91) | 70.7 ms (±4.30) | 32.5 ms (±1.11) | 0.84 × (0.77–1.45) ≈ | 0.88 × (0.83–1.52) ≈ | 0.85 × (0.77–1.48) ≈ | 1.86 × (1.75–3.30) **NG-ZORRO** |
| Jump to settled (median of jumps) (lower is better) | 43.0 ms (±1.44) | 52.0 ms (±1.33) | 34.5 ms (±0.22) | 29.3 ms (±0.56) | 23.1 ms (±0.51) | 0.83 × (0.79–0.87) **Infinite** | 1.25 × (1.21–1.31) **AG Grid** | 1.46 × (1.41–1.54) **TanStack** | 1.86 × (1.78–1.95) **NG-ZORRO** |
| Main thread, all tasks (all jumps) (lower is better) | 576 ms (±7.67) | 648 ms (±8.99) | 574 ms (±6.90) | 635 ms (±27.3) | 360 ms (±4.29) | 0.89 × (0.87–0.91) **Infinite** | 1.00 × (0.98–1.02) ≈ | 0.91 × (0.86–0.96) **Infinite** | 1.60 × (1.57–1.63) **NG-ZORRO** |

## scroll-vertical - 1,000,000 rows

Wheel-scroll down 24000px at 8000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for every grid). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Frames fully presented (higher is better) | 81.0 % (±3.28) | 54.3 % (±1.11) | 49.6 % (±0.22) | 49.9 % (±0.27) | 56.9 % (±3.84) | 1.49 × (1.43–1.58) **Infinite** | 1.63 × (1.57–1.73) **Infinite** | 1.63 × (1.56–1.72) **Infinite** | 1.43 × (1.25–1.51) **Infinite** |
| Frames presented without main-thread update (lower is better) | 19.0 % (±3.28) | 45.7 % (±1.11) | 48.7 % (±0.12) | 49.0 % (±0.28) | 43.1 % (±3.84) | 0.42 × (0.31–0.49) **Infinite** | 0.39 × (0.29–0.46) **Infinite** | 0.39 × (0.29–0.46) **Infinite** | 0.44 × (0.33–0.56) **Infinite** |
| Frames dropped (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 1.68 % (±0.32) | 1.11 % (±0.55) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 (0.00 to 0.00) ≈ |
| Main thread frame rate (rAF) (higher is better) | 41.5 fps (±3.82) | 38.5 fps (±0.94) | 58.4 fps (±0.36) | 59.0 fps (±0.63) | 58.4 fps (±0.60) | 1.08 × (1.01–1.24) **Infinite** | 0.71 × (0.67–0.81) **AG Grid** | 0.70 × (0.66–0.81) **TanStack** | 0.71 × (0.67–0.82) **NG-ZORRO** |
| p95 rAF frame interval (lower is better) | 50.0 ms (±2.10) | 50.0 ms (±0.00) | 16.8 ms (±0.00) | 16.7 ms (±0.04) | 16.8 ms (±0.05) | 1.00 × (0.92–1.00) ≈ | 2.98 × (2.73–2.98) **AG Grid** | 2.99 × (2.75–3.00) **TanStack** | 2.98 × (2.73–2.99) **NG-ZORRO** |
| Worst rAF frame interval (lower is better) | 133 ms (±7.41) | 100 ms (±9.14) | 33.4 ms (±7.42) | 49.9 ms (±27.8) | 33.4 ms (±41.5) | 1.33 × (1.14–1.50) **PrimeNG** | 3.99 × (2.67–4.49) **AG Grid** | 2.67 × (1.33–4.01) **TanStack** | 3.99 × (1.14–4.49) **NG-ZORRO** |
| rAF intervals > 25ms (lower is better) | 23.4 % (±10.3) | 38.3 % (±1.24) | 2.76 % (±0.26) | 1.11 % (±0.46) | 1.68 % (±0.99) | 0.61 × (0.28–0.86) **Infinite** | 8.48 × (3.95–12.0) **AG Grid** | 21.1 × (6.68–43.1) **TanStack** | 14.0 × (3.99–42.2) **NG-ZORRO** |
| Long animation frames: total blocking (lower is better) | 0.40 ms (±3.76) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | +0.40 (0.00 to +8.70) ≈ | +0.40 (0.00 to +8.70) ≈ | +0.40 (0.00 to +8.70) ≈ | +0.40 (0.00 to +8.70) ≈ |
| Main thread: layout (lower is better) | 83.2 ms (±2.55) | 187 ms (±2.16) | 509 ms (±3.70) | 99.7 ms (±3.71) | 224 ms (±7.42) | 0.45 × (0.44–0.47) **Infinite** | 0.16 × (0.16–0.17) **Infinite** | 0.84 × (0.82–0.92) **Infinite** | 0.37 × (0.35–0.40) **Infinite** |
| Main thread: style recalc (lower is better) | 307 ms (±15.1) | 230 ms (±0.98) | 162 ms (±7.02) | 49.5 ms (±4.63) | 285 ms (±9.77) | 1.33 × (1.25–1.41) **PrimeNG** | 1.90 × (1.76–2.02) **AG Grid** | 6.20 × (5.16–6.57) **TanStack** | 1.08 × (0.99–1.14) ≈ |
| Main thread: all tasks (lower is better) | 1897 ms (±27.0) | 1704 ms (±9.92) | 1871 ms (±13.8) | 1297 ms (±14.3) | 1702 ms (±23.4) | 1.11 × (1.09–1.13) **PrimeNG** | 1.01 × (0.99–1.03) ≈ | 1.46 × (1.43–1.49) **TanStack** | 1.11 × (1.08–1.13) **NG-ZORRO** |

## scroll-horizontal - 1,000,000 rows

Wheel-scroll right/left over all columns, 4 sweeps at 4000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for every grid). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Frames fully presented (higher is better) | 84.9 % (±6.33) | 96.7 % (±0.36) | 80.3 % (±1.79) | 80.3 % (±8.88) | 82.8 % (±5.29) | 0.88 × (0.86–1.02) ≈ | 1.06 × (1.03–1.23) **Infinite** | 1.06 × (1.03–1.40) **Infinite** | 1.03 × (1.00–1.20) **Infinite** |
| Frames presented without main-thread update (lower is better) | 15.1 % (±6.23) | 3.31 % (±0.36) | 19.0 % (±1.50) | 19.0 % (±8.50) | 17.2 % (±5.29) | 4.57 × (0.42–6.05) ≈ | 0.80 × (0.07–0.87) **Infinite** | 0.80 × (0.07–0.87) **Infinite** | 0.88 × (0.08–0.96) **Infinite** |
| Frames dropped (lower is better) | 0.00 % (±0.26) | 0.00 % (±0.00) | 0.74 % (±0.29) | 0.70 % (±0.38) | 0.00 % (±0.00) | 0.00 (0.00 to +0.59) ≈ | 0.00 × (0.00–0.79) **Infinite** | 0.00 × (0.00–0.84) **Infinite** | 0.00 (0.00 to +0.59) ≈ |
| Main thread frame rate (rAF) (higher is better) | 60.0 fps (±0.27) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 1.00 × (0.99–1.00) ≈ | 1.00 × (0.99–1.00) ≈ | 1.00 × (0.99–1.00) ≈ | 1.00 × (0.99–1.00) ≈ |
| p95 rAF frame interval (lower is better) | 16.7 ms (±0.00) | 16.7 ms (±0.00) | 16.7 ms (±0.05) | 16.7 ms (±0.04) | 16.7 ms (±0.05) | 1.00 × (1.00–1.00) ≈ | 1.00 × (0.99–1.00) ≈ | 1.00 × (0.99–1.00) ≈ | 1.00 × (0.99–1.00) ≈ |
| Worst rAF frame interval (lower is better) | 16.8 ms (±9.06) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 1.00 × (1.00–1.99) ≈ | 1.00 × (1.00–1.99) ≈ | 1.00 × (1.00–1.99) ≈ | 1.00 × (1.00–1.99) ≈ |
| rAF intervals > 25ms (lower is better) | 0.00 % (±0.45) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to +0.83) ≈ | 0.00 (0.00 to +0.83) ≈ | 0.00 (0.00 to +0.83) ≈ | 0.00 (0.00 to +0.83) ≈ |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Main thread: layout (lower is better) | 10.6 ms (±0.13) | 0.00 ms (±0.00) | 75.4 ms (±0.87) | 48.8 ms (±7.52) | 0.00 ms (±0.00) | +10.6 (+10.4 to +10.7) **PrimeNG** | 0.14 × (0.14–0.14) **Infinite** | 0.22 × (0.16–0.22) **Infinite** | +10.6 (+10.4 to +10.7) **NG-ZORRO** |
| Main thread: style recalc (lower is better) | 26.6 ms (±0.16) | 0.00 ms (±0.00) | 43.7 ms (±2.45) | 14.6 ms (±0.40) | 2.88 ms (±0.19) | +26.6 (+26.4 to +26.8) **PrimeNG** | 0.61 × (0.55–0.63) **Infinite** | 1.83 × (1.79–1.90) **TanStack** | 9.23 × (8.12–9.61) **NG-ZORRO** |
| Main thread: all tasks (lower is better) | 374 ms (±5.73) | 257 ms (±6.60) | 491 ms (±7.23) | 528 ms (±11.4) | 198 ms (±8.03) | 1.46 × (1.41–1.51) **PrimeNG** | 0.76 × (0.74–0.77) **Infinite** | 0.71 × (0.68–0.72) **Infinite** | 1.89 × (1.76–1.94) **NG-ZORRO** |

## correctness-vertical - 1,000,000 rows

Same kind of vertical wheel gesture, faster (20000px/s). After every painted frame, samples points across the body and checks the cell there is the one that should be there for the current scroll position: "blank" = no cell, "wrong" = a cell for another row/column (stale content, or position lagging behind the scroll). This is the main thread's view of the frame; it reads layout, so it is never combined with the timing passes.

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Blank samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 2.86 % (±0.84) | 3.23 % (±0.27) | 16.1 % (±0.79) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Wrong/stale samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Frames with any blank/wrong sample (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 14.3 % (±4.22) | 16.1 % (±1.36) | 90.1 % (±1.20) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Worst frame: correct samples (higher is better) | 100 % (±0.00) | 100 % (±0.00) | 80.0 % (±0.00) | 80.0 % (±0.00) | 0.00 % (±0.00) | 1.00 × (1.00–1.00) ≈ | 1.25 × (1.25–1.25) **Infinite** | 1.25 × (1.25–1.25) **Infinite** | +100 (+100 to +100) **Infinite** |

## correctness-horizontal - 1,000,000 rows

Same kind of horizontal wheel gesture. After every painted frame, samples points across the body and checks the cell there is the one that should be there for the current scroll position: "blank" = no cell, "wrong" = a cell for another row/column (stale content, or position lagging behind the scroll). This is the main thread's view of the frame; it reads layout, so it is never combined with the timing passes.

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Blank samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Wrong/stale samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Frames with any blank/wrong sample (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Worst frame: correct samples (higher is better) | 100 % (±0.00) | 100 % (±0.00) | 100 % (±0.00) | 100 % (±0.00) | 100 % (±0.00) | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ |

## visual-blank-vertical - 1,000,000 rows

Fast vertical wheel gesture (20000px/s) while recording what the compositor actually displays (CDP screencast). Each frame is checked for blank areas: vertical runs of the body with no text where rows should be. Unlike the correctness probe, this also catches the compositor scrolling ahead of the main thread. Screencast capture skips frames under load and adds overhead - compare the grids, not absolute numbers.

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Captured frames with blank rows (lower is better) | 0.00 % (±0.00) | 93.3 % (±0.70) | 47.4 % (±8.73) | 47.8 % (±7.18) | 98.6 % (±0.62) | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Blank body area (avg over frames) (lower is better) | 0.00 % (±0.00) | 88.3 % (±0.85) | 20.5 % (±3.41) | 19.4 % (±2.73) | 71.6 % (±1.91) | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Worst frame: blank rows (lower is better) | 0.00 rows (±0.00) | 18.0 rows (±0.00) | 18.0 rows (±0.00) | 18.0 rows (±0.00) | 18.0 rows (±0.00) | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Captured frames (higher is better) | 62.0 (±1.52) | 74.0 (±0.71) | 38.0 (±1.64) | 46.0 (±1.30) | 72.0 (±0.55) | 0.84 × (0.82–0.88) **PrimeNG** | 1.63 × (1.51–1.71) **Infinite** | 1.35 × (1.33–1.44) **Infinite** | 0.86 × (0.85–0.90) **NG-ZORRO** |

## updates-low - 1,000,000 rows

Live updates, low frequency. The grid shows the rows in the order of the data. 5 updates of 1,000 random rows each, one at a time: each update is sent 500 ms after the previous one is painted. An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. Measured from sending the update to the end of the first frame committed with the viewport showing it (the right rows, with the new values, in the right order).

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Update to rows painted (median of updates) (lower is better) | 346 ms (±2.27) | 30.0 ms (±0.84) | 96.6 ms (±0.54) | 605 ms (±2.85) | 37.3 ms (±0.28) | 11.5 × (11.0–11.8) **PrimeNG** | 3.58 × (3.53–3.60) **AG Grid** | 0.57 × (0.57–0.58) **Infinite** | 9.26 × (9.17–9.41) **NG-ZORRO** |
| Update to rows painted (worst update) (lower is better) | 509 ms (±21.8) | 41.4 ms (±2.55) | 115 ms (±5.90) | 897 ms (±6.65) | 42.3 ms (±0.50) | 12.3 × (11.2–13.3) **PrimeNG** | 4.41 × (4.00–4.67) **AG Grid** | 0.57 × (0.54–0.60) **Infinite** | 12.0 × (11.4–12.6) **NG-ZORRO** |
| Update to settled (median of updates) (lower is better) | 346 ms (±2.27) | 30.0 ms (±0.84) | 96.6 ms (±0.54) | 605 ms (±2.85) | 37.3 ms (±0.28) | 11.5 × (11.0–11.8) **PrimeNG** | 3.58 × (3.53–3.60) **AG Grid** | 0.57 × (0.57–0.58) **Infinite** | 9.26 × (9.17–9.41) **NG-ZORRO** |
| Main thread: layout (all updates) (lower is better) | 3.24 ms (±0.48) | 28.8 ms (±1.47) | 3.78 ms (±0.78) | 5.15 ms (±0.32) | 10.0 ms (±0.49) | 0.11 × (0.10–0.14) **Infinite** | 0.86 × (0.61–1.11) ≈ | 0.63 × (0.55–0.77) **Infinite** | 0.32 × (0.28–0.40) **Infinite** |
| Main thread: style recalc (all updates) (lower is better) | 0.21 ms (±0.01) | 14.8 ms (±0.45) | 1.78 ms (±0.17) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.01 × (0.01–0.02) **Infinite** | 0.12 × (0.10–0.13) **Infinite** | +0.21 (+0.20 to +0.23) **TanStack** | +0.21 (+0.20 to +0.23) **NG-ZORRO** |
| Main thread: all tasks (all updates) (lower is better) | 1885 ms (±24.9) | 263 ms (±5.11) | 686 ms (±8.57) | 3363 ms (±15.9) | 313 ms (±7.19) | 7.17 × (6.89–7.35) **PrimeNG** | 2.75 × (2.71–2.82) **AG Grid** | 0.56 × (0.56–0.57) **Infinite** | 6.02 × (5.93–6.27) **NG-ZORRO** |

## updates-low-sorted - 1,000,000 rows

Live updates, low frequency. The grid shows sorted by salary, highest first - the updates change the salaries, so rows move. 5 updates of 1,000 random rows each, one at a time: each update is sent 500 ms after the previous one is painted. An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. Measured from sending the update to the end of the first frame committed with the viewport showing it (the right rows, with the new values, in the right order).

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Update to rows painted (median of updates) (lower is better) | 586 ms (±8.75) | 1654 ms (±12.3) | 3739 ms (±44.4) | 4191 ms (±37.5) | 1338 ms (±14.3) | 0.35 × (0.35–0.37) **Infinite** | 0.16 × (0.15–0.16) **Infinite** | 0.14 × (0.14–0.14) **Infinite** | 0.44 × (0.43–0.45) **Infinite** |
| Update to rows painted (worst update) (lower is better) | 750 ms (±17.0) | 1703 ms (±23.9) | 3828 ms (±49.6) | 4830 ms (±172) | 1362 ms (±27.0) | 0.44 × (0.43–0.45) **Infinite** | 0.20 × (0.19–0.20) **Infinite** | 0.16 × (0.15–0.16) **Infinite** | 0.55 × (0.53–0.57) **Infinite** |
| Update to settled (median of updates) (lower is better) | 586 ms (±8.75) | 1654 ms (±12.3) | 3739 ms (±44.4) | 4191 ms (±37.5) | 1338 ms (±14.3) | 0.35 × (0.35–0.37) **Infinite** | 0.16 × (0.15–0.16) **Infinite** | 0.14 × (0.14–0.14) **Infinite** | 0.44 × (0.43–0.45) **Infinite** |
| Main thread: layout (all updates) (lower is better) | 13.6 ms (±0.38) | 31.0 ms (±13.7) | 21.9 ms (±1.19) | 16.2 ms (±0.49) | 17.3 ms (±0.10) | 0.44 × (0.22–0.46) **Infinite** | 0.62 × (0.59–0.70) **Infinite** | 0.84 × (0.79–0.86) **Infinite** | 0.78 × (0.75–0.81) **Infinite** |
| Main thread: style recalc (all updates) (lower is better) | 0.33 ms (±0.07) | 26.3 ms (±2.95) | 0.13 ms (±0.01) | 0.00 ms (±0.00) | 9.50 ms (±0.43) | 0.01 × (0.01–0.02) **Infinite** | 2.61 × (2.37–3.71) **AG Grid** | +0.33 (+0.30 to +0.47) **TanStack** | 0.03 × (0.03–0.05) **Infinite** |
| Main thread: all tasks (all updates) (lower is better) | 3135 ms (±36.6) | 8524 ms (±43.4) | 19066 ms (±143) | 22156 ms (±546) | 7010 ms (±84.6) | 0.37 × (0.36–0.37) **Infinite** | 0.16 × (0.16–0.17) **Infinite** | 0.14 × (0.14–0.14) **Infinite** | 0.45 × (0.44–0.46) **Infinite** |

## updates-low-filtered - 1,000,000 rows

Live updates, low frequency. The grid shows filtered to a salary of at least 115,000 (about half of the rows) - the updates change the salaries, so rows go in and out of the filter. 5 updates of 1,000 random rows each, one at a time: each update is sent 500 ms after the previous one is painted. An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. Measured from sending the update to the end of the first frame committed with the viewport showing it (the right rows, with the new values, in the right order).

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Update to rows painted (median of updates) (lower is better) | 313 ms (±7.10) | 90.5 ms (±0.73) | 347 ms (±10.9) | 1976 ms (±25.7) | 61.3 ms (±1.44) | 3.46 × (3.38–3.58) **PrimeNG** | 0.90 × (0.87–0.95) **Infinite** | 0.16 × (0.15–0.16) **Infinite** | 5.10 × (4.86–5.26) **NG-ZORRO** |
| Update to rows painted (worst update) (lower is better) | 434 ms (±11.7) | 141 ms (±3.03) | 389 ms (±13.5) | 2061 ms (±13.3) | 65.7 ms (±0.73) | 3.09 × (2.96–3.22) **PrimeNG** | 1.12 × (1.07–1.18) **AG Grid** | 0.21 × (0.21–0.22) **Infinite** | 6.61 × (6.48–6.93) **NG-ZORRO** |
| Update to settled (median of updates) (lower is better) | 322 ms (±9.39) | 99.9 ms (±2.89) | 347 ms (±10.9) | 1976 ms (±25.7) | 61.3 ms (±1.44) | 3.22 × (3.03–3.40) **PrimeNG** | 0.93 × (0.89–0.98) **Infinite** | 0.16 × (0.16–0.17) **Infinite** | 5.25 × (5.01–5.53) **NG-ZORRO** |
| Main thread: layout (all updates) (lower is better) | 5.62 ms (±0.45) | 35.6 ms (±0.70) | 6.65 ms (±0.07) | 6.80 ms (±0.72) | 8.92 ms (±0.51) | 0.16 × (0.14–0.18) **Infinite** | 0.84 × (0.77–0.95) **Infinite** | 0.83 × (0.69–0.94) **Infinite** | 0.63 × (0.58–0.72) **Infinite** |
| Main thread: style recalc (all updates) (lower is better) | 0.45 ms (±0.02) | 23.7 ms (±4.52) | 0.69 ms (±0.12) | 0.77 ms (±0.12) | 0.51 ms (±0.02) | 0.02 × (0.01–0.02) **Infinite** | 0.66 × (0.52–0.75) **Infinite** | 0.59 × (0.47–0.70) **Infinite** | 0.89 × (0.85–0.98) **Infinite** |
| Main thread: all tasks (all updates) (lower is better) | 1703 ms (±39.5) | 607 ms (±8.27) | 1919 ms (±48.3) | 8919 ms (±44.5) | 549 ms (±3.02) | 2.81 × (2.74–2.92) **PrimeNG** | 0.89 × (0.86–0.92) **Infinite** | 0.19 × (0.19–0.20) **Infinite** | 3.10 × (3.04–3.22) **NG-ZORRO** |

## updates-low-grouped - 1,000,000 rows

Live updates, low frequency. The grid shows grouped by department (10 collapsed groups), with the sum of the salaries of each group - the updates change the salaries, so the sums change. 5 updates of 1,000 random rows each, one at a time: each update is sent 500 ms after the previous one is painted. An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. Measured from sending the update to the end of the first frame committed with the viewport showing it (the right rows, with the new values, in the right order).

| Metric | Infinite median (sd) | TanStack median (sd) | Infinite vs TanStack |
|---|---:|---:|---:|
| Update to rows painted (median of updates) (lower is better) | 1068 ms (±16.5) | 1967 ms (±11.6) | 0.54 × (0.54–0.56) **Infinite** |
| Update to rows painted (worst update) (lower is better) | 1306 ms (±10.2) | 2471 ms (±63.3) | 0.53 × (0.52–0.55) **Infinite** |
| Update to settled (median of updates) (lower is better) | 1068 ms (±16.5) | 1967 ms (±11.6) | 0.54 × (0.54–0.56) **Infinite** |
| Main thread: layout (all updates) (lower is better) | 1.76 ms (±0.17) | 2.72 ms (±0.34) | 0.65 × (0.54–0.79) **Infinite** |
| Main thread: style recalc (all updates) (lower is better) | 0.38 ms (±0.04) | 0.00 ms (±0.00) | +0.38 (+0.34 to +0.44) **TanStack** |
| Main thread: all tasks (all updates) (lower is better) | 5571 ms (±43.3) | 11080 ms (±170) | 0.50 × (0.50–0.52) **Infinite** |

## updates-high - 1,000,000 rows

Live updates, high frequency. The grid shows the rows in the order of the data. A feed of 50 updates a second, of 100 random rows each, for 4 s (200 updates). An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. The page hands the grid the updates once per animation frame: all the ones that arrived since the previous frame, as one update - so a grid that keeps the main thread busy gets them later, and more at once. "Lag at the end" = from the arrival of the last update to the end of the first frame committed with the viewport showing it. "Update delay" = from the arrival of an update to the frame that hands it to the grid. Frames, gaps and blocking time come from the trace, from the first update until the last one is painted: the frames the main thread committed, and the part over 50 ms of every task.

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Lag at the end: last update to painted (lower is better) | 505 ms (±79.6) | 58.5 ms (±3.41) | 120 ms (±41.0) | 983 ms (±113) | 51.3 ms (±9.88) | 8.63 × (6.95–10.6) **PrimeNG** | 4.21 × (2.25–5.14) **AG Grid** | 0.51 × (0.40–0.60) **Infinite** | 9.84 × (7.57–13.3) **NG-ZORRO** |
| Update delay, p95 (lower is better) | 381 ms (±9.01) | 30.4 ms (±2.67) | 96.9 ms (±7.30) | 770 ms (±90.3) | 60.8 ms (±3.81) | 12.5 × (10.6–13.0) **PrimeNG** | 3.93 × (3.58–4.27) **AG Grid** | 0.49 × (0.42–0.56) **Infinite** | 6.26 × (5.58–6.56) **NG-ZORRO** |
| Frames committed per second (higher is better) | 2.68 fps (±0.05) | 32.0 fps (±0.33) | 9.85 fps (±0.65) | 1.41 fps (±0.03) | 27.4 fps (±0.78) | 0.08 × (0.08–0.09) **PrimeNG** | 0.27 × (0.25–0.29) **AG Grid** | 1.90 × (1.84–1.96) **Infinite** | 0.10 × (0.10–0.10) **NG-ZORRO** |
| Gap between frames, p95 (lower is better) | 501 ms (±8.91) | 44.1 ms (±3.04) | 132 ms (±22.7) | 932 ms (±74.5) | 55.9 ms (±9.08) | 11.4 × (10.9–12.8) **PrimeNG** | 3.79 × (2.80–4.14) **AG Grid** | 0.54 × (0.48–0.58) **Infinite** | 8.97 × (8.12–12.4) **NG-ZORRO** |
| Longest gap between frames (lower is better) | 536 ms (±13.0) | 64.4 ms (±8.76) | 217 ms (±9.04) | 953 ms (±85.5) | 162 ms (±24.3) | 8.33 × (6.67–9.02) **PrimeNG** | 2.48 × (2.32–2.62) **AG Grid** | 0.56 × (0.49–0.60) **Infinite** | 3.30 × (2.97–4.37) **NG-ZORRO** |
| Long tasks: total blocking time (lower is better) | 3633 ms (±78.2) | 0.00 ms (±0.00) | 2056 ms (±145) | 4548 ms (±123) | 168 ms (±39.1) | +3633 (+3533 to +3716) **PrimeNG** | 1.77 × (1.64–1.96) **AG Grid** | 0.80 × (0.77–0.83) **Infinite** | 21.6 × (17.7–30.7) **NG-ZORRO** |
| Main thread: layout (lower is better) | 6.59 ms (±0.48) | 641 ms (±14.3) | 27.1 ms (±3.59) | 6.56 ms (±0.37) | 189 ms (±8.45) | 0.01 × (0.01–0.01) **Infinite** | 0.24 × (0.19–0.28) **Infinite** | 1.00 × (0.86–1.10) ≈ | 0.03 × (0.03–0.04) **Infinite** |
| Main thread: style recalc (lower is better) | 0.28 ms (±0.01) | 298 ms (±9.88) | 12.7 ms (±0.79) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 × (0.00–0.00) **Infinite** | 0.02 × (0.02–0.02) **Infinite** | +0.28 (+0.26 to +0.29) **TanStack** | +0.28 (+0.26 to +0.29) **NG-ZORRO** |
| Main thread: all tasks (lower is better) | 4487 ms (±79.7) | 4036 ms (±3.46) | 4099 ms (±40.3) | 4983 ms (±108) | 4029 ms (±9.80) | 1.11 × (1.09–1.13) **PrimeNG** | 1.09 × (1.06–1.11) **AG Grid** | 0.90 × (0.87–0.93) **Infinite** | 1.11 × (1.09–1.13) **NG-ZORRO** |

## updates-high-sorted - 1,000,000 rows

Live updates, high frequency. The grid shows sorted by salary, highest first - the updates change the salaries, so rows move. A feed of 50 updates a second, of 100 random rows each, for 4 s (200 updates). An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. The page hands the grid the updates once per animation frame: all the ones that arrived since the previous frame, as one update - so a grid that keeps the main thread busy gets them later, and more at once. "Lag at the end" = from the arrival of the last update to the end of the first frame committed with the viewport showing it. "Update delay" = from the arrival of an update to the frame that hands it to the grid. Frames, gaps and blocking time come from the trace, from the first update until the last one is painted: the frames the main thread committed, and the part over 50 ms of every task.

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Lag at the end: last update to painted (lower is better) | 865 ms (±291) | 2888 ms (±23.3) | 7555 ms (±319) | 4978 ms (±310) | 1546 ms (±20.9) | 0.30 × (0.29–0.50) **Infinite** | 0.11 × (0.10–0.19) **Infinite** | 0.17 × (0.15–0.29) **Infinite** | 0.56 × (0.53–0.94) **Infinite** |
| Update delay, p95 (lower is better) | 696 ms (±49.8) | 1657 ms (±16.4) | 3959 ms (±135) | 4547 ms (±91.9) | 1314 ms (±9.33) | 0.42 × (0.38–0.45) **Infinite** | 0.18 × (0.16–0.19) **Infinite** | 0.15 × (0.14–0.17) **Infinite** | 0.53 × (0.48–0.57) **Infinite** |
| Frames committed per second (higher is better) | 1.46 fps (±0.03) | 0.58 fps (±0.00) | 0.17 fps (±0.00) | 0.22 fps (±0.01) | 0.72 fps (±0.00) | 2.50 × (2.48–2.61) **Infinite** | 8.40 × (8.32–8.91) **Infinite** | 6.52 × (6.43–7.00) **Infinite** | 2.01 × (1.99–2.10) **Infinite** |
| Gap between frames, p95 (lower is better) | 849 ms (±25.9) | 1784 ms (±23.0) | 7560 ms (±267) | 4776 ms (±111) | 1473 ms (±22.7) | 0.48 × (0.45–0.49) **Infinite** | 0.11 × (0.11–0.12) **Infinite** | 0.18 × (0.17–0.19) **Infinite** | 0.58 × (0.55–0.59) **Infinite** |
| Longest gap between frames (lower is better) | 868 ms (±33.4) | 1800 ms (±27.3) | 7759 ms (±279) | 4809 ms (±110) | 1493 ms (±27.2) | 0.48 × (0.45–0.51) **Infinite** | 0.11 × (0.10–0.12) **Infinite** | 0.18 × (0.17–0.19) **Infinite** | 0.58 × (0.55–0.61) **Infinite** |
| Long tasks: total blocking time (lower is better) | 4257 ms (±256) | 6524 ms (±24.4) | 11383 ms (±325) | 8834 ms (±294) | 5261 ms (±21.3) | 0.65 × (0.65–0.73) **Infinite** | 0.37 × (0.35–0.42) **Infinite** | 0.48 × (0.45–0.54) **Infinite** | 0.81 × (0.81–0.91) **Infinite** |
| Main thread: layout (lower is better) | 17.6 ms (±6.42) | 38.9 ms (±5.36) | 16.2 ms (±3.09) | 6.52 ms (±15.3) | 19.2 ms (±0.39) | 0.45 × (0.35–0.80) **Infinite** | 1.09 × (0.76–1.93) ≈ | 2.70 × (0.43–4.79) ≈ | 0.92 × (0.81–1.62) ≈ |
| Main thread: style recalc (lower is better) | 0.28 ms (±0.06) | 23.5 ms (±0.86) | 0.04 ms (±0.00) | 0.00 ms (±0.00) | 9.59 ms (±0.67) | 0.01 × (0.01–0.02) **Infinite** | 6.51 × (4.90–8.56) **AG Grid** | +0.28 (+0.23 to +0.37) **TanStack** | 0.03 × (0.02–0.04) **Infinite** |
| Main thread: all tasks (lower is better) | 4847 ms (±290) | 6869 ms (±25.7) | 11543 ms (±321) | 8959 ms (±310) | 5527 ms (±20.0) | 0.71 × (0.70–0.79) **Infinite** | 0.42 × (0.40–0.47) **Infinite** | 0.54 × (0.50–0.61) **Infinite** | 0.88 × (0.87–0.98) **Infinite** |

## updates-high-filtered - 1,000,000 rows

Live updates, high frequency. The grid shows filtered to a salary of at least 115,000 (about half of the rows) - the updates change the salaries, so rows go in and out of the filter. A feed of 50 updates a second, of 100 random rows each, for 4 s (200 updates). An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. The page hands the grid the updates once per animation frame: all the ones that arrived since the previous frame, as one update - so a grid that keeps the main thread busy gets them later, and more at once. "Lag at the end" = from the arrival of the last update to the end of the first frame committed with the viewport showing it. "Update delay" = from the arrival of an update to the frame that hands it to the grid. Frames, gaps and blocking time come from the trace, from the first update until the last one is painted: the frames the main thread committed, and the part over 50 ms of every task.

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Lag at the end: last update to painted (lower is better) | 359 ms (±58.1) | 160 ms (±32.5) | 526 ms (±105) | 2893 ms (±97.1) | 80.2 ms (±10.5) | 2.24 × (1.98–3.56) **PrimeNG** | 0.68 × (0.57–1.07) ≈ | 0.12 × (0.12–0.17) **Infinite** | 4.48 × (3.73–6.09) **NG-ZORRO** |
| Update delay, p95 (lower is better) | 342 ms (±5.41) | 92.6 ms (±2.97) | 335 ms (±9.28) | 1905 ms (±35.0) | 57.2 ms (±1.45) | 3.69 × (3.65–3.93) **PrimeNG** | 1.02 × (0.99–1.07) ≈ | 0.18 × (0.17–0.19) **Infinite** | 5.98 × (5.73–6.20) **NG-ZORRO** |
| Frames committed per second (higher is better) | 3.00 fps (±0.04) | 10.6 fps (±0.05) | 2.62 fps (±0.08) | 0.58 fps (±0.01) | 16.7 fps (±0.17) | 0.28 × (0.27–0.28) **PrimeNG** | 1.14 × (1.10–1.19) **Infinite** | 5.15 × (5.00–5.29) **Infinite** | 0.18 × (0.17–0.18) **NG-ZORRO** |
| Gap between frames, p95 (lower is better) | 460 ms (±7.34) | 107 ms (±3.27) | 587 ms (±27.4) | 2053 ms (±38.9) | 67.8 ms (±3.89) | 4.30 × (4.17–4.53) **PrimeNG** | 0.78 × (0.73–0.83) **Infinite** | 0.22 × (0.22–0.23) **Infinite** | 6.79 × (6.11–6.99) **NG-ZORRO** |
| Longest gap between frames (lower is better) | 500 ms (±17.3) | 165 ms (±6.31) | 865 ms (±31.3) | 2064 ms (±42.6) | 112 ms (±2.08) | 3.04 × (2.90–3.26) **PrimeNG** | 0.58 × (0.55–0.62) **Infinite** | 0.24 × (0.23–0.26) **Infinite** | 4.45 × (4.30–4.76) **NG-ZORRO** |
| Long tasks: total blocking time (lower is better) | 3423 ms (±56.6) | 1168 ms (±12.9) | 3853 ms (±91.9) | 6629 ms (±97.0) | 248 ms (±30.1) | 2.93 × (2.90–3.02) **PrimeNG** | 0.89 × (0.87–0.92) **Infinite** | 0.52 × (0.50–0.53) **Infinite** | 13.8 × (11.8–15.8) **NG-ZORRO** |
| Main thread: layout (lower is better) | 11.5 ms (±0.23) | 266 ms (±7.90) | 14.8 ms (±0.74) | 5.32 ms (±0.23) | 113 ms (±1.60) | 0.04 × (0.04–0.05) **Infinite** | 0.77 × (0.75–0.85) **Infinite** | 2.16 × (2.08–2.35) **TanStack** | 0.10 × (0.10–0.11) **Infinite** |
| Main thread: style recalc (lower is better) | 0.72 ms (±0.03) | 132 ms (±9.91) | 1.33 ms (±0.10) | 0.53 ms (±0.05) | 1.79 ms (±0.10) | 0.01 × (0.00–0.01) **Infinite** | 0.54 × (0.48–0.59) **Infinite** | 1.36 × (1.15–1.41) **TanStack** | 0.40 × (0.36–0.43) **Infinite** |
| Main thread: all tasks (lower is better) | 4343 ms (±58.2) | 4155 ms (±29.5) | 4507 ms (±105) | 6875 ms (±97.1) | 4058 ms (±10.6) | 1.05 × (1.04–1.08) **PrimeNG** | 0.96 × (0.94–1.01) ≈ | 0.63 × (0.61–0.65) **Infinite** | 1.07 × (1.07–1.10) **NG-ZORRO** |

## updates-high-grouped - 1,000,000 rows

Live updates, high frequency. The grid shows grouped by department (10 collapsed groups), with the sum of the salaries of each group - the updates change the salaries, so the sums change. A feed of 50 updates a second, of 100 random rows each, for 4 s (200 updates). An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. The page hands the grid the updates once per animation frame: all the ones that arrived since the previous frame, as one update - so a grid that keeps the main thread busy gets them later, and more at once. "Lag at the end" = from the arrival of the last update to the end of the first frame committed with the viewport showing it. "Update delay" = from the arrival of an update to the frame that hands it to the grid. Frames, gaps and blocking time come from the trace, from the first update until the last one is painted: the frames the main thread committed, and the part over 50 ms of every task.

| Metric | Infinite median (sd) | TanStack median (sd) | Infinite vs TanStack |
|---|---:|---:|---:|
| Lag at the end: last update to painted (lower is better) | 1667 ms (±56.4) | 2415 ms (±27.6) | 0.69 × (0.67–0.73) **Infinite** |
| Update delay, p95 (lower is better) | 1080 ms (±11.2) | 2215 ms (±21.5) | 0.49 × (0.48–0.50) **Infinite** |
| Frames committed per second (higher is better) | 0.89 fps (±0.01) | 0.47 fps (±0.00) | 1.89 × (1.85–1.90) **Infinite** |
| Gap between frames, p95 (lower is better) | 1262 ms (±20.8) | 2392 ms (±19.3) | 0.53 × (0.51–0.54) **Infinite** |
| Longest gap between frames (lower is better) | 1299 ms (±24.5) | 2439 ms (±21.7) | 0.53 × (0.52–0.54) **Infinite** |
| Long tasks: total blocking time (lower is better) | 5305 ms (±52.9) | 6230 ms (±28.1) | 0.85 × (0.84–0.86) **Infinite** |
| Main thread: layout (lower is better) | 1.40 ms (±0.09) | 1.34 ms (±0.10) | 1.04 × (0.86–1.10) ≈ |
| Main thread: style recalc (lower is better) | 0.27 ms (±0.05) | 0.00 ms (±0.00) | +0.27 (+0.22 to +0.34) **TanStack** |
| Main thread: all tasks (lower is better) | 5711 ms (±132) | 6396 ms (±27.6) | 0.89 × (0.88–0.93) **Infinite** |
