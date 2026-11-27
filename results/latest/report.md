# Infinite Table vs PrimeNG Table vs AG Grid vs TanStack Table vs NG-ZORRO Table — benchmark report

- Run: `ci` · 2026-11-27T16:52:57.882Z
- Infinite Table 11.0.1 · PrimeNG Table 21.1.10 · AG Grid 36.3.0 · TanStack Table 9.3.2 · NG-ZORRO Table 22.2.1
- 1,000,000 rows (data checksum `1000000:19e5eebe`) × 20 columns, identical data for every grid
- Chrome 136.0.7103.25 · headless · CPU throttling 1× · viewport 1400×1000
- 5 measured runs per grid per scenario (+1 warmup, discarded), interleaved, fresh browser context per run
- Linux 7.0.0-1018-aws x64 · Intel(R) Xeon(R) 6975P-C × 4
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
| Time to first rows painted (lower is better) | 538 ms (±27.2) | 88.3 ms (±2.67) | 805 ms (±14.0) | 673 ms (±13.7) | 89.6 ms (±3.07) | 6.09 × (5.89–6.71) **PrimeNG** | 0.67 × (0.66–0.74) **Infinite** | 0.80 × (0.78–0.89) **Infinite** | 6.00 × (5.76–6.62) **NG-ZORRO** |
| Time until settled (lower is better) | 564 ms (±27.8) | 88.3 ms (±2.67) | 909 ms (±14.2) | 673 ms (±13.7) | 116 ms (±3.77) | 6.38 × (6.18–7.02) **PrimeNG** | 0.62 × (0.61–0.68) **Infinite** | 0.84 × (0.82–0.93) **Infinite** | 4.84 × (4.62–5.32) **NG-ZORRO** |
| Main thread: layout (lower is better) | 3.24 ms (±0.07) | 8.65 ms (±0.26) | 8.05 ms (±0.52) | 3.75 ms (±0.08) | 7.73 ms (±0.70) | 0.37 × (0.36–0.39) **Infinite** | 0.40 × (0.37–0.42) **Infinite** | 0.87 × (0.84–0.91) **Infinite** | 0.42 × (0.36–0.44) **Infinite** |
| Main thread: style recalc (lower is better) | 6.44 ms (±0.36) | 5.10 ms (±0.06) | 10.8 ms (±0.17) | 1.56 ms (±0.31) | 7.63 ms (±0.28) | 1.26 × (1.17–1.32) **PrimeNG** | 0.60 × (0.55–0.63) **Infinite** | 4.14 × (3.02–4.71) **TanStack** | 0.85 × (0.78–0.93) **Infinite** |
| Main thread: all tasks (lower is better) | 583 ms (±27.5) | 90.3 ms (±2.53) | 815 ms (±12.9) | 675 ms (±13.3) | 219 ms (±5.12) | 6.46 × (6.27–7.05) **PrimeNG** | 0.72 × (0.70–0.78) **Infinite** | 0.86 × (0.84–0.95) **Infinite** | 2.67 × (2.57–2.97) **NG-ZORRO** |
| JS heap retained by grid (lower is better) | 90.7 MB (±0.04) | 2.15 MB (±0.00) | 212 MB (±0.00) | 288 MB (±0.00) | 14.2 MB (±0.00) | 42.1 × (42.0–42.1) **PrimeNG** | 0.43 × (0.43–0.43) **Infinite** | 0.31 × (0.31–0.31) **Infinite** | 6.39 × (6.38–6.39) **NG-ZORRO** |
| DOM elements in grid (lower is better) | 609 (±0.00) | 1068 (±0.00) | 637 (±0.00) | 352 (±0.00) | 797 (±0.00) | 0.57 × (0.57–0.57) **Infinite** | 0.96 × (0.96–0.96) **Infinite** | 1.73 × (1.73–1.73) **TanStack** | 0.76 × (0.76–0.76) **Infinite** |

## sort-string - 1,000,000 rows

Click the "code" column header (string column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Ascending: click to sorted rows painted (lower is better) | 1516 ms (±70.7) | 1455 ms (±57.3) | 3522 ms (±92.5) | 4137 ms (±211) | 1219 ms (±38.1) | 1.04 × (0.95–1.09) ≈ | 0.43 × (0.40–0.45) **Infinite** | 0.37 × (0.34–0.38) **Infinite** | 1.24 × (1.16–1.31) **NG-ZORRO** |
| Ascending: click to settled (lower is better) | 1518 ms (±70.9) | 1455 ms (±57.3) | 3522 ms (±92.5) | 4137 ms (±211) | 1219 ms (±38.1) | 1.04 × (0.95–1.10) ≈ | 0.43 × (0.40–0.45) **Infinite** | 0.37 × (0.34–0.39) **Infinite** | 1.25 × (1.16–1.31) **NG-ZORRO** |
| Descending: click to sorted rows painted (lower is better) | 1605 ms (±96.7) | 289 ms (±3.98) | 3586 ms (±79.4) | 4041 ms (±213) | 1240 ms (±61.6) | 5.55 × (5.13–5.99) **PrimeNG** | 0.45 × (0.41–0.47) **Infinite** | 0.40 × (0.35–0.43) **Infinite** | 1.29 × (1.13–1.40) **NG-ZORRO** |
| Descending: click to settled (lower is better) | 1605 ms (±96.7) | 289 ms (±3.98) | 3586 ms (±79.4) | 4041 ms (±213) | 1240 ms (±61.6) | 5.55 × (5.13–5.99) **PrimeNG** | 0.45 × (0.41–0.47) **Infinite** | 0.40 × (0.35–0.43) **Infinite** | 1.29 × (1.13–1.40) **NG-ZORRO** |
| Ascending: main thread, all tasks (lower is better) | 1555 ms (±74.1) | 1648 ms (±52.2) | 3832 ms (±98.4) | 4139 ms (±211) | 1280 ms (±76.0) | 0.94 × (0.88–1.00) **Infinite** | 0.41 × (0.38–0.43) **Infinite** | 0.38 × (0.34–0.39) **Infinite** | 1.21 × (1.12–1.33) **NG-ZORRO** |
| Descending: main thread, all tasks (lower is better) | 1614 ms (±98.3) | 288 ms (±4.30) | 3589 ms (±79.5) | 4041 ms (±213) | 1241 ms (±61.7) | 5.61 × (5.15–6.06) **PrimeNG** | 0.45 × (0.41–0.48) **Infinite** | 0.40 × (0.35–0.43) **Infinite** | 1.30 × (1.14–1.40) **NG-ZORRO** |

## sort-number - 1,000,000 rows

Click the "salary" column header (number column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Ascending: click to sorted rows painted (lower is better) | 562 ms (±16.9) | 1148 ms (±39.5) | 3213 ms (±128) | 3232 ms (±187) | 868 ms (±20.4) | 0.49 × (0.46–0.52) **Infinite** | 0.17 × (0.16–0.18) **Infinite** | 0.17 × (0.16–0.18) **Infinite** | 0.65 × (0.60–0.66) **Infinite** |
| Ascending: click to settled (lower is better) | 564 ms (±16.9) | 1148 ms (±39.5) | 3213 ms (±128) | 3232 ms (±187) | 868 ms (±20.4) | 0.49 × (0.46–0.53) **Infinite** | 0.18 × (0.17–0.19) **Infinite** | 0.17 × (0.16–0.18) **Infinite** | 0.65 × (0.60–0.66) **Infinite** |
| Descending: click to sorted rows painted (lower is better) | 519 ms (±7.45) | 443 ms (±0.86) | 3291 ms (±135) | 3135 ms (±140) | 901 ms (±23.0) | 1.17 × (1.16–1.20) **PrimeNG** | 0.16 × (0.15–0.17) **Infinite** | 0.17 × (0.15–0.17) **Infinite** | 0.58 × (0.56–0.60) **Infinite** |
| Descending: click to settled (lower is better) | 519 ms (±7.45) | 443 ms (±0.86) | 3291 ms (±135) | 3135 ms (±140) | 901 ms (±23.0) | 1.17 × (1.16–1.20) **PrimeNG** | 0.16 × (0.15–0.17) **Infinite** | 0.17 × (0.15–0.17) **Infinite** | 0.58 × (0.56–0.60) **Infinite** |
| Ascending: main thread, all tasks (lower is better) | 590 ms (±16.2) | 1268 ms (±49.9) | 3470 ms (±152) | 3643 ms (±334) | 996 ms (±18.2) | 0.47 × (0.44–0.50) **Infinite** | 0.17 × (0.16–0.18) **Infinite** | 0.16 × (0.15–0.19) **Infinite** | 0.59 × (0.56–0.61) **Infinite** |
| Descending: main thread, all tasks (lower is better) | 528 ms (±8.02) | 562 ms (±42.8) | 3509 ms (±158) | 3136 ms (±140) | 1032 ms (±26.0) | 0.94 × (0.81–0.97) **Infinite** | 0.15 × (0.14–0.16) **Infinite** | 0.17 × (0.16–0.17) **Infinite** | 0.51 × (0.49–0.53) **Infinite** |

## scroll-jump - 1,000,000 rows

Programmatic jumps to 10 far-away scroll positions (like dragging the scrollbar thumb). Measured from setting scrollTop to the end of the first frame committed with the first and last visible rows showing the right content, at the right position.

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Jump to rows painted (median of jumps) (lower is better) | 28.8 ms (±0.65) | 36.7 ms (±1.04) | 24.2 ms (±0.22) | 19.3 ms (±0.59) | 17.9 ms (±1.09) | 0.78 × (0.77–0.84) **Infinite** | 1.19 × (1.18–1.25) **AG Grid** | 1.49 × (1.46–1.62) **TanStack** | 1.61 × (1.47–1.68) **NG-ZORRO** |
| Jump to rows painted (worst jump) (lower is better) | 44.1 ms (±7.77) | 48.0 ms (±1.42) | 55.5 ms (±2.60) | 46.8 ms (±1.89) | 24.9 ms (±1.57) | 0.92 × (0.86–1.26) ≈ | 0.79 × (0.73–1.09) ≈ | 0.94 × (0.87–1.29) ≈ | 1.77 × (1.55–2.43) **NG-ZORRO** |
| Jump to settled (median of jumps) (lower is better) | 28.8 ms (±0.65) | 36.7 ms (±1.04) | 24.2 ms (±0.22) | 19.3 ms (±0.59) | 17.9 ms (±1.09) | 0.78 × (0.77–0.84) **Infinite** | 1.19 × (1.18–1.25) **AG Grid** | 1.49 × (1.46–1.62) **TanStack** | 1.61 × (1.47–1.68) **NG-ZORRO** |
| Main thread, all tasks (all jumps) (lower is better) | 422 ms (±7.55) | 467 ms (±7.30) | 440 ms (±7.24) | 453 ms (±9.71) | 278 ms (±3.13) | 0.90 × (0.88–0.93) **Infinite** | 0.96 × (0.93–0.98) **Infinite** | 0.93 × (0.90–0.95) **Infinite** | 1.52 × (1.47–1.55) **NG-ZORRO** |

## scroll-vertical - 1,000,000 rows

Wheel-scroll down 24000px at 8000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for every grid). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Frames fully presented (higher is better) | 64.9 % (±6.05) | 59.5 % (±0.37) | 56.4 % (±3.64) | 62.0 % (±0.11) | 51.0 % (±1.32) | 1.09 × (1.06–1.31) **Infinite** | 1.15 × (1.12–1.38) **Infinite** | 1.05 × (1.02–1.26) **Infinite** | 1.27 × (1.20–1.53) **Infinite** |
| Frames presented without main-thread update (lower is better) | 35.1 % (±6.05) | 40.5 % (±0.37) | 43.3 % (±3.66) | 37.6 % (±0.12) | 49.0 % (±1.32) | 0.87 × (0.55–0.91) **Infinite** | 0.81 × (0.51–0.85) **Infinite** | 0.93 × (0.59–0.98) **Infinite** | 0.72 × (0.45–0.76) **Infinite** |
| Frames dropped (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.31 % (±0.02) | 0.34 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 (0.00 to 0.00) ≈ |
| Main thread frame rate (rAF) (higher is better) | 55.8 fps (±1.11) | 43.3 fps (±0.21) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 60.0 fps (±0.18) | 1.29 × (1.27–1.34) **Infinite** | 0.93 × (0.92–0.97) **AG Grid** | 0.93 × (0.92–0.97) **TanStack** | 0.93 × (0.92–0.97) **NG-ZORRO** |
| p95 rAF frame interval (lower is better) | 16.8 ms (±0.00) | 33.4 ms (±0.00) | 16.7 ms (±0.05) | 16.7 ms (±0.00) | 16.7 ms (±0.05) | 0.50 × (0.50–0.50) **Infinite** | 1.01 × (1.00–1.01) **AG Grid** | 1.01 × (1.01–1.01) **TanStack** | 1.01 × (1.00–1.01) **NG-ZORRO** |
| Worst rAF frame interval (lower is better) | 117 ms (±28.9) | 99.9 ms (±9.12) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 16.8 ms (±9.04) | 1.17 × (0.50–1.40) ≈ | 6.95 × (2.98–6.95) **AG Grid** | 6.95 × (2.98–6.95) **TanStack** | 6.95 × (2.98–6.95) **NG-ZORRO** |
| rAF intervals > 25ms (lower is better) | 2.89 % (±0.83) | 34.8 % (±0.41) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.30) | 0.08 × (0.08–0.14) **Infinite** | +2.89 (+2.78 to +4.71) **AG Grid** | +2.89 (+2.78 to +4.71) **TanStack** | +2.89 (+2.33 to +4.71) **NG-ZORRO** |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Main thread: layout (lower is better) | 69.6 ms (±2.66) | 121 ms (±1.02) | 346 ms (±4.67) | 74.2 ms (±2.89) | 160 ms (±3.17) | 0.58 × (0.57–0.62) **Infinite** | 0.20 × (0.20–0.22) **Infinite** | 0.94 × (0.90–1.03) ≈ | 0.43 × (0.43–0.47) **Infinite** |
| Main thread: style recalc (lower is better) | 212 ms (±6.45) | 161 ms (±2.65) | 110 ms (±3.75) | 36.8 ms (±1.60) | 201 ms (±3.68) | 1.32 × (1.27–1.38) **PrimeNG** | 1.92 × (1.82–2.01) **AG Grid** | 5.76 × (5.35–6.02) **TanStack** | 1.05 × (1.01–1.10) **NG-ZORRO** |
| Main thread: all tasks (lower is better) | 1420 ms (±40.2) | 1295 ms (±12.8) | 1418 ms (±32.5) | 972 ms (±23.4) | 1313 ms (±30.8) | 1.10 × (1.06–1.14) **PrimeNG** | 1.00 × (0.96–1.05) ≈ | 1.46 × (1.41–1.53) **TanStack** | 1.08 × (1.05–1.14) **NG-ZORRO** |

## scroll-horizontal - 1,000,000 rows

Wheel-scroll right/left over all columns, 4 sweeps at 4000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for every grid). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Frames fully presented (higher is better) | 89.0 % (±4.00) | 96.8 % (±0.33) | 100 % (±0.00) | 100 % (±0.00) | 81.8 % (±6.52) | 0.92 × (0.87–0.98) **PrimeNG** | 0.89 × (0.84–0.95) **AG Grid** | 0.89 × (0.84–0.95) **TanStack** | 1.09 × (1.02–1.27) **Infinite** |
| Frames presented without main-thread update (lower is better) | 11.0 % (±4.00) | 3.23 % (±0.33) | 0.00 % (±0.00) | 0.00 % (±0.00) | 18.2 % (±6.52) | 3.40 × (1.52–5.02) **PrimeNG** | +11.0 (+4.90 to +16.2) **AG Grid** | +11.0 (+4.90 to +16.2) **TanStack** | 0.60 × (0.27–0.89) **Infinite** |
| Frames dropped (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Main thread frame rate (rAF) (higher is better) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ |
| p95 rAF frame interval (lower is better) | 16.7 ms (±0.00) | 16.8 ms (±0.04) | 16.7 ms (±0.00) | 16.7 ms (±0.05) | 16.8 ms (±0.05) | 1.00 × (0.99–1.00) ≈ | 1.00 × (1.00–1.00) ≈ | 1.00 × (0.99–1.00) ≈ | 0.99 × (0.99–1.00) ≈ |
| Worst rAF frame interval (lower is better) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ |
| rAF intervals > 25ms (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Main thread: layout (lower is better) | 10.2 ms (±0.51) | 0.00 ms (±0.00) | 57.4 ms (±3.67) | 38.4 ms (±3.78) | 0.00 ms (±0.00) | +10.2 (+9.37 to +10.8) **PrimeNG** | 0.18 × (0.16–0.19) **Infinite** | 0.27 × (0.23–0.29) **Infinite** | +10.2 (+9.37 to +10.8) **NG-ZORRO** |
| Main thread: style recalc (lower is better) | 23.1 ms (±1.30) | 0.00 ms (±0.00) | 30.4 ms (±1.08) | 12.4 ms (±1.21) | 3.49 ms (±0.46) | +23.1 (+21.5 to +25.1) **PrimeNG** | 0.76 × (0.71–0.83) **Infinite** | 1.86 × (1.57–2.02) **TanStack** | 6.61 × (5.45–7.45) **NG-ZORRO** |
| Main thread: all tasks (lower is better) | 288 ms (±13.4) | 200 ms (±12.8) | 379 ms (±19.3) | 365 ms (±20.3) | 166 ms (±10.8) | 1.44 × (1.28–1.55) **PrimeNG** | 0.76 × (0.69–0.82) **Infinite** | 0.79 × (0.71–0.85) **Infinite** | 1.74 × (1.61–1.88) **NG-ZORRO** |

## correctness-vertical - 1,000,000 rows

Same kind of vertical wheel gesture, faster (20000px/s). After every painted frame, samples points across the body and checks the cell there is the one that should be there for the current scroll position: "blank" = no cell, "wrong" = a cell for another row/column (stale content, or position lagging behind the scroll). This is the main thread's view of the frame; it reads layout, so it is never combined with the timing passes.

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Blank samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 2.11 % (±0.29) | 2.31 % (±0.61) | 14.8 % (±0.47) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Wrong/stale samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Frames with any blank/wrong sample (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 10.5 % (±1.47) | 11.5 % (±3.06) | 90.7 % (±0.52) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Worst frame: correct samples (higher is better) | 100 % (±0.00) | 100 % (±0.00) | 80.0 % (±0.00) | 80.0 % (±0.00) | 0.00 % (±25.9) | 1.00 × (1.00–1.00) ≈ | 1.25 × (1.25–1.25) **Infinite** | 1.25 × (1.25–1.25) **Infinite** | +100 (+42.1 to +100) **Infinite** |

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
| Captured frames with blank rows (lower is better) | 0.00 % (±0.00) | 85.1 % (±2.01) | 11.5 % (±1.06) | 18.3 % (±1.88) | 95.9 % (±1.20) | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Blank body area (avg over frames) (lower is better) | 0.00 % (±0.00) | 59.1 % (±1.20) | 4.94 % (±2.61) | 8.11 % (±0.53) | 59.6 % (±0.52) | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Worst frame: blank rows (lower is better) | 0.00 rows (±0.00) | 18.0 rows (±0.00) | 17.0 rows (±4.09) | 17.0 rows (±1.00) | 18.0 rows (±0.00) | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Captured frames (higher is better) | 72.0 (±1.00) | 75.0 (±0.89) | 61.0 (±2.41) | 60.0 (±0.84) | 74.0 (±0.45) | 0.96 × (0.95–0.99) **PrimeNG** | 1.18 × (1.11–1.22) **Infinite** | 1.20 × (1.16–1.22) **Infinite** | 0.97 × (0.96–0.99) **NG-ZORRO** |

## updates-low - 1,000,000 rows

Live updates, low frequency. The grid shows the rows in the order of the data. 5 updates of 1,000 random rows each, one at a time: each update is sent 500 ms after the previous one is painted. An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. Measured from sending the update to the end of the first frame committed with the viewport showing it (the right rows, with the new values, in the right order).

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Update to rows painted (median of updates) (lower is better) | 428 ms (±16.9) | 22.3 ms (±0.73) | 130 ms (±2.07) | 500 ms (±7.62) | 27.6 ms (±0.52) | 19.2 × (17.9–20.0) **PrimeNG** | 3.31 × (3.08–3.43) **AG Grid** | 0.86 × (0.80–0.89) **Infinite** | 15.5 × (14.7–16.1) **NG-ZORRO** |
| Update to rows painted (worst update) (lower is better) | 489 ms (±13.7) | 30.3 ms (±1.06) | 140 ms (±0.84) | 686 ms (±14.1) | 31.9 ms (±2.63) | 16.1 × (15.1–16.7) **PrimeNG** | 3.49 × (3.37–3.62) **AG Grid** | 0.71 × (0.69–0.74) **Infinite** | 15.3 × (13.0–16.0) **NG-ZORRO** |
| Update to settled (median of updates) (lower is better) | 428 ms (±16.9) | 22.3 ms (±0.73) | 130 ms (±2.07) | 500 ms (±7.62) | 27.6 ms (±0.52) | 19.2 × (17.9–20.0) **PrimeNG** | 3.31 × (3.08–3.43) **AG Grid** | 0.86 × (0.80–0.89) **Infinite** | 15.5 × (14.7–16.1) **NG-ZORRO** |
| Main thread: layout (all updates) (lower is better) | 2.38 ms (±0.08) | 20.3 ms (±0.30) | 2.84 ms (±0.27) | 4.19 ms (±0.24) | 8.07 ms (±2.24) | 0.12 × (0.11–0.12) **Infinite** | 0.84 × (0.78–1.01) ≈ | 0.57 × (0.53–0.63) **Infinite** | 0.29 × (0.20–0.37) **Infinite** |
| Main thread: style recalc (all updates) (lower is better) | 0.37 ms (±0.02) | 9.64 ms (±0.85) | 1.46 ms (±0.09) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.04 × (0.03–0.04) **Infinite** | 0.26 × (0.23–0.27) **Infinite** | +0.37 (+0.36 to +0.39) **TanStack** | +0.37 (+0.36 to +0.39) **NG-ZORRO** |
| Main thread: all tasks (all updates) (lower is better) | 2180 ms (±66.0) | 207 ms (±2.68) | 796 ms (±5.35) | 2738 ms (±21.4) | 247 ms (±10.7) | 10.5 × (9.93–10.9) **PrimeNG** | 2.74 × (2.59–2.81) **AG Grid** | 0.80 × (0.75–0.82) **Infinite** | 8.82 × (8.20–9.32) **NG-ZORRO** |

## updates-low-sorted - 1,000,000 rows

Live updates, low frequency. The grid shows sorted by salary, highest first - the updates change the salaries, so rows move. 5 updates of 1,000 random rows each, one at a time: each update is sent 500 ms after the previous one is painted. An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. Measured from sending the update to the end of the first frame committed with the viewport showing it (the right rows, with the new values, in the right order).

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Update to rows painted (median of updates) (lower is better) | 548 ms (±9.54) | 1501 ms (±76.2) | 4149 ms (±205) | 4069 ms (±183) | 1130 ms (±39.1) | 0.37 × (0.35–0.40) **Infinite** | 0.13 × (0.12–0.14) **Infinite** | 0.13 × (0.13–0.15) **Infinite** | 0.49 × (0.45–0.50) **Infinite** |
| Update to rows painted (worst update) (lower is better) | 700 ms (±37.0) | 1550 ms (±41.7) | 4191 ms (±217) | 4692 ms (±287) | 1180 ms (±40.0) | 0.45 × (0.42–0.49) **Infinite** | 0.17 × (0.15–0.18) **Infinite** | 0.15 × (0.14–0.17) **Infinite** | 0.59 × (0.55–0.64) **Infinite** |
| Update to settled (median of updates) (lower is better) | 548 ms (±9.54) | 1501 ms (±76.2) | 4149 ms (±205) | 4069 ms (±183) | 1130 ms (±39.1) | 0.37 × (0.35–0.40) **Infinite** | 0.13 × (0.12–0.14) **Infinite** | 0.13 × (0.13–0.15) **Infinite** | 0.49 × (0.45–0.50) **Infinite** |
| Main thread: layout (all updates) (lower is better) | 10.3 ms (±0.49) | 21.5 ms (±0.42) | 14.6 ms (±0.70) | 11.1 ms (±0.71) | 12.4 ms (±0.05) | 0.48 × (0.45–0.51) **Infinite** | 0.70 × (0.65–0.75) **Infinite** | 0.93 × (0.87–1.04) ≈ | 0.83 × (0.79–0.88) **Infinite** |
| Main thread: style recalc (all updates) (lower is better) | 0.44 ms (±0.02) | 16.9 ms (±1.89) | 0.16 ms (±0.01) | 0.00 ms (±0.00) | 6.75 ms (±0.71) | 0.03 × (0.02–0.03) **Infinite** | 2.74 × (2.45–2.98) **AG Grid** | +0.44 (+0.42 to +0.48) **TanStack** | 0.07 × (0.06–0.08) **Infinite** |
| Main thread: all tasks (all updates) (lower is better) | 2899 ms (±38.0) | 7821 ms (±327) | 20718 ms (±1169) | 20742 ms (±1237) | 6036 ms (±135) | 0.37 × (0.36–0.40) **Infinite** | 0.14 × (0.13–0.15) **Infinite** | 0.14 × (0.13–0.15) **Infinite** | 0.48 × (0.46–0.49) **Infinite** |

## updates-low-filtered - 1,000,000 rows

Live updates, low frequency. The grid shows filtered to a salary of at least 115,000 (about half of the rows) - the updates change the salaries, so rows go in and out of the filter. 5 updates of 1,000 random rows each, one at a time: each update is sent 500 ms after the previous one is painted. An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. Measured from sending the update to the end of the first frame committed with the viewport showing it (the right rows, with the new values, in the right order).

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Update to rows painted (median of updates) (lower is better) | 300 ms (±9.04) | 71.9 ms (±0.92) | 257 ms (±6.18) | 1438 ms (±19.2) | 53.9 ms (±1.54) | 4.17 × (4.03–4.33) **PrimeNG** | 1.16 × (1.12–1.23) **AG Grid** | 0.21 × (0.20–0.22) **Infinite** | 5.56 × (5.28–5.84) **NG-ZORRO** |
| Update to rows painted (worst update) (lower is better) | 372 ms (±7.94) | 103 ms (±1.14) | 291 ms (±3.70) | 1607 ms (±27.4) | 58.4 ms (±1.03) | 3.61 × (3.48–3.68) **PrimeNG** | 1.28 × (1.24–1.32) **AG Grid** | 0.23 × (0.22–0.24) **Infinite** | 6.38 × (6.12–6.58) **NG-ZORRO** |
| Update to settled (median of updates) (lower is better) | 301 ms (±7.23) | 78.4 ms (±0.65) | 257 ms (±6.18) | 1438 ms (±19.2) | 53.9 ms (±1.54) | 3.84 × (3.75–3.99) **PrimeNG** | 1.17 × (1.14–1.23) **AG Grid** | 0.21 × (0.20–0.22) **Infinite** | 5.59 × (5.39–5.85) **NG-ZORRO** |
| Main thread: layout (all updates) (lower is better) | 4.24 ms (±0.19) | 23.8 ms (±0.41) | 5.87 ms (±1.19) | 5.53 ms (±0.26) | 6.97 ms (±0.99) | 0.18 × (0.16–0.18) **Infinite** | 0.72 × (0.50–0.75) **Infinite** | 0.77 × (0.69–0.83) **Infinite** | 0.61 × (0.47–0.65) **Infinite** |
| Main thread: style recalc (all updates) (lower is better) | 0.60 ms (±0.07) | 16.5 ms (±0.62) | 0.70 ms (±0.05) | 0.72 ms (±0.03) | 0.56 ms (±0.02) | 0.04 × (0.03–0.04) **Infinite** | 0.86 × (0.65–0.92) **Infinite** | 0.84 × (0.64–0.86) **Infinite** | 1.08 × (0.84–1.16) ≈ |
| Main thread: all tasks (all updates) (lower is better) | 1590 ms (±50.5) | 467 ms (±4.48) | 1418 ms (±21.4) | 6735 ms (±113) | 477 ms (±12.2) | 3.41 × (3.25–3.51) **PrimeNG** | 1.12 × (1.07–1.17) **AG Grid** | 0.24 × (0.23–0.24) **Infinite** | 3.33 × (3.15–3.48) **NG-ZORRO** |

## updates-low-grouped - 1,000,000 rows

Live updates, low frequency. The grid shows grouped by department (10 collapsed groups), with the sum of the salaries of each group - the updates change the salaries, so the sums change. 5 updates of 1,000 random rows each, one at a time: each update is sent 500 ms after the previous one is painted. An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. Measured from sending the update to the end of the first frame committed with the viewport showing it (the right rows, with the new values, in the right order).

| Metric | Infinite median (sd) | TanStack median (sd) | Infinite vs TanStack |
|---|---:|---:|---:|
| Update to rows painted (median of updates) (lower is better) | 806 ms (±13.9) | 1806 ms (±91.3) | 0.45 × (0.42–0.47) **Infinite** |
| Update to rows painted (worst update) (lower is better) | 1000 ms (±64.4) | 2079 ms (±135) | 0.48 × (0.42–0.52) **Infinite** |
| Update to settled (median of updates) (lower is better) | 806 ms (±13.9) | 1806 ms (±91.3) | 0.45 × (0.42–0.47) **Infinite** |
| Main thread: layout (all updates) (lower is better) | 1.43 ms (±0.10) | 2.09 ms (±0.21) | 0.68 × (0.58–0.76) **Infinite** |
| Main thread: style recalc (all updates) (lower is better) | 0.49 ms (±0.02) | 0.00 ms (±0.00) | +0.49 (+0.45 to +0.50) **TanStack** |
| Main thread: all tasks (all updates) (lower is better) | 4243 ms (±152) | 9557 ms (±511) | 0.44 × (0.42–0.48) **Infinite** |

## updates-high - 1,000,000 rows

Live updates, high frequency. The grid shows the rows in the order of the data. A feed of 50 updates a second, of 100 random rows each, for 4 s (200 updates). An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. The page hands the grid the updates once per animation frame: all the ones that arrived since the previous frame, as one update - so a grid that keeps the main thread busy gets them later, and more at once. "Lag at the end" = from the arrival of the last update to the end of the first frame committed with the viewport showing it. "Update delay" = from the arrival of an update to the frame that hands it to the grid. Frames, gaps and blocking time come from the trace, from the first update until the last one is painted: the frames the main thread committed, and the part over 50 ms of every task.

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Lag at the end: last update to painted (lower is better) | 407 ms (±55.9) | 22.4 ms (±6.80) | 163 ms (±20.3) | 750 ms (±105) | 31.3 ms (±5.10) | 18.1 × (10.9–23.0) **PrimeNG** | 2.49 × (2.05–3.16) **AG Grid** | 0.54 × (0.49–0.78) **Infinite** | 13.0 × (10.3–17.0) **NG-ZORRO** |
| Update delay, p95 (lower is better) | 360 ms (±15.1) | 21.5 ms (±1.91) | 119 ms (±10.4) | 574 ms (±14.8) | 48.4 ms (±4.04) | 16.7 × (14.2–18.2) **PrimeNG** | 3.03 × (2.90–3.68) **AG Grid** | 0.63 × (0.59–0.67) **Infinite** | 7.44 × (6.70–8.50) **NG-ZORRO** |
| Frames committed per second (higher is better) | 2.67 fps (±0.11) | 49.4 fps (±1.75) | 7.75 fps (±0.84) | 1.90 fps (±0.04) | 43.6 fps (±0.67) | 0.05 × (0.05–0.06) **PrimeNG** | 0.34 × (0.28–0.35) **AG Grid** | 1.40 × (1.29–1.45) **Infinite** | 0.06 × (0.06–0.06) **NG-ZORRO** |
| Gap between frames, p95 (lower is better) | 455 ms (±12.9) | 31.1 ms (±1.26) | 154 ms (±18.9) | 692 ms (±11.6) | 32.4 ms (±3.12) | 14.6 × (13.8–15.4) **PrimeNG** | 2.95 × (2.72–3.87) **AG Grid** | 0.66 × (0.63–0.69) **Infinite** | 14.0 × (12.6–16.1) **NG-ZORRO** |
| Longest gap between frames (lower is better) | 497 ms (±13.3) | 54.5 ms (±10.9) | 268 ms (±12.2) | 701 ms (±17.0) | 107 ms (±5.74) | 9.13 × (6.30–9.57) **PrimeNG** | 1.86 × (1.82–2.05) **AG Grid** | 0.71 × (0.67–0.74) **Infinite** | 4.66 × (4.28–4.91) **NG-ZORRO** |
| Long tasks: total blocking time (lower is better) | 3662 ms (±49.4) | 0.00 ms (±5.14) | 2472 ms (±177) | 4238 ms (±106) | 88.8 ms (±30.8) | +3662 (+3582 to +3720) **PrimeNG** | 1.48 × (1.45–1.75) **AG Grid** | 0.86 × (0.85–0.90) **Infinite** | 41.2 × (27.1–54.3) **NG-ZORRO** |
| Main thread: layout (lower is better) | 6.09 ms (±0.37) | 575 ms (±5.04) | 17.2 ms (±1.97) | 6.41 ms (±0.24) | 188 ms (±13.1) | 0.01 × (0.01–0.01) **Infinite** | 0.35 × (0.29–0.37) **Infinite** | 0.95 × (0.84–1.01) ≈ | 0.03 × (0.03–0.04) **Infinite** |
| Main thread: style recalc (lower is better) | 0.41 ms (±0.02) | 280 ms (±4.21) | 9.18 ms (±0.86) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 × (0.00–0.00) **Infinite** | 0.04 × (0.04–0.05) **Infinite** | +0.41 (+0.39 to +0.44) **TanStack** | +0.41 (+0.39 to +0.44) **NG-ZORRO** |
| Main thread: all tasks (lower is better) | 4392 ms (±54.3) | 3940 ms (±23.9) | 4143 ms (±20.3) | 4732 ms (±105) | 4004 ms (±10.3) | 1.11 × (1.11–1.14) **PrimeNG** | 1.06 × (1.05–1.09) **AG Grid** | 0.93 × (0.92–0.97) **Infinite** | 1.10 × (1.09–1.12) **NG-ZORRO** |

## updates-high-sorted - 1,000,000 rows

Live updates, high frequency. The grid shows sorted by salary, highest first - the updates change the salaries, so rows move. A feed of 50 updates a second, of 100 random rows each, for 4 s (200 updates). An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. The page hands the grid the updates once per animation frame: all the ones that arrived since the previous frame, as one update - so a grid that keeps the main thread busy gets them later, and more at once. "Lag at the end" = from the arrival of the last update to the end of the first frame committed with the viewport showing it. "Update delay" = from the arrival of an update to the frame that hands it to the grid. Frames, gaps and blocking time come from the trace, from the first update until the last one is painted: the frames the main thread committed, and the part over 50 ms of every task.

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Lag at the end: last update to painted (lower is better) | 930 ms (±165) | 1899 ms (±229) | 7604 ms (±1364) | 7481 ms (±257) | 1834 ms (±113) | 0.49 × (0.42–0.71) **Infinite** | 0.12 × (0.11–0.18) **Infinite** | 0.12 × (0.12–0.17) **Infinite** | 0.51 × (0.47–0.69) **Infinite** |
| Update delay, p95 (lower is better) | 553 ms (±10.2) | 1405 ms (±69.7) | 3795 ms (±147) | 3679 ms (±73.1) | 1108 ms (±19.9) | 0.39 × (0.36–0.41) **Infinite** | 0.15 × (0.13–0.15) **Infinite** | 0.15 × (0.14–0.15) **Infinite** | 0.50 × (0.48–0.51) **Infinite** |
| Frames committed per second (higher is better) | 1.63 fps (±0.05) | 0.68 fps (±0.03) | 0.16 fps (±0.03) | 0.26 fps (±0.01) | 0.86 fps (±0.02) | 2.40 × (2.33–2.64) **Infinite** | 10.2 × (9.41–14.9) **Infinite** | 6.24 × (6.14–6.63) **Infinite** | 1.90 × (1.86–2.06) **Infinite** |
| Gap between frames, p95 (lower is better) | 706 ms (±39.9) | 1551 ms (±57.5) | 7875 ms (±698) | 3931 ms (±100) | 1217 ms (±21.4) | 0.46 × (0.42–0.50) **Infinite** | 0.09 × (0.08–0.10) **Infinite** | 0.18 × (0.17–0.20) **Infinite** | 0.58 × (0.55–0.63) **Infinite** |
| Longest gap between frames (lower is better) | 719 ms (±54.4) | 1567 ms (±57.9) | 8057 ms (±624) | 3939 ms (±104) | 1232 ms (±23.2) | 0.46 × (0.43–0.51) **Infinite** | 0.09 × (0.08–0.10) **Infinite** | 0.18 × (0.17–0.20) **Infinite** | 0.58 × (0.54–0.65) **Infinite** |
| Long tasks: total blocking time (lower is better) | 4332 ms (±132) | 5580 ms (±226) | 11431 ms (±1342) | 11286 ms (±257) | 5502 ms (±114) | 0.78 × (0.73–0.84) **Infinite** | 0.38 × (0.35–0.48) **Infinite** | 0.38 × (0.37–0.41) **Infinite** | 0.79 × (0.76–0.84) **Infinite** |
| Main thread: layout (lower is better) | 15.5 ms (±20.2) | 26.6 ms (±1.44) | 13.7 ms (±2.62) | 6.44 ms (±0.18) | 17.2 ms (±0.22) | 0.58 × (0.50–2.11) ≈ | 1.14 × (0.97–4.47) ≈ | 2.41 × (2.06–8.71) **TanStack** | 0.90 × (0.77–3.26) ≈ |
| Main thread: style recalc (lower is better) | 0.42 ms (±0.03) | 15.6 ms (±4.01) | 0.07 ms (±0.01) | 0.00 ms (±0.00) | 8.60 ms (±0.56) | 0.03 × (0.02–0.03) **Infinite** | 6.24 × (5.32–8.36) **AG Grid** | +0.42 (+0.36 to +0.44) **TanStack** | 0.05 × (0.04–0.05) **Infinite** |
| Main thread: all tasks (lower is better) | 4920 ms (±162) | 5880 ms (±229) | 11586 ms (±1294) | 11462 ms (±256) | 5816 ms (±113) | 0.84 × (0.79–0.91) **Infinite** | 0.42 × (0.39–0.53) **Infinite** | 0.43 × (0.41–0.46) **Infinite** | 0.85 × (0.82–0.90) **Infinite** |

## updates-high-filtered - 1,000,000 rows

Live updates, high frequency. The grid shows filtered to a salary of at least 115,000 (about half of the rows) - the updates change the salaries, so rows go in and out of the filter. A feed of 50 updates a second, of 100 random rows each, for 4 s (200 updates). An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. The page hands the grid the updates once per animation frame: all the ones that arrived since the previous frame, as one update - so a grid that keeps the main thread busy gets them later, and more at once. "Lag at the end" = from the arrival of the last update to the end of the first frame committed with the viewport showing it. "Update delay" = from the arrival of an update to the frame that hands it to the grid. Frames, gaps and blocking time come from the trace, from the first update until the last one is painted: the frames the main thread committed, and the part over 50 ms of every task.

| Metric | Infinite median (sd) | PrimeNG median (sd) | AG Grid median (sd) | TanStack median (sd) | NG-ZORRO median (sd) | Infinite vs PrimeNG | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs NG-ZORRO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Lag at the end: last update to painted (lower is better) | 426 ms (±85.4) | 113 ms (±26.2) | 387 ms (±76.8) | 1114 ms (±619) | 87.6 ms (±14.1) | 3.76 × (2.58–5.47) **PrimeNG** | 1.10 × (0.78–1.53) ≈ | 0.38 × (0.17–0.48) **Infinite** | 4.86 × (3.64–6.44) **NG-ZORRO** |
| Update delay, p95 (lower is better) | 298 ms (±6.09) | 68.2 ms (±1.59) | 244 ms (±6.17) | 1409 ms (±28.3) | 50.1 ms (±1.86) | 4.36 × (4.19–4.52) **PrimeNG** | 1.22 × (1.19–1.28) **AG Grid** | 0.21 × (0.21–0.22) **Infinite** | 5.94 × (5.85–6.48) **NG-ZORRO** |
| Frames committed per second (higher is better) | 3.22 fps (±0.07) | 14.0 fps (±0.18) | 3.66 fps (±0.06) | 0.79 fps (±0.01) | 19.4 fps (±0.48) | 0.23 × (0.22–0.24) **PrimeNG** | 0.88 × (0.85–0.91) **AG Grid** | 4.10 × (3.98–4.23) **Infinite** | 0.17 × (0.16–0.17) **NG-ZORRO** |
| Gap between frames, p95 (lower is better) | 388 ms (±6.28) | 78.9 ms (±2.03) | 361 ms (±5.25) | 1585 ms (±25.2) | 59.3 ms (±2.86) | 4.91 × (4.69–5.06) **PrimeNG** | 1.07 × (1.05–1.11) **AG Grid** | 0.24 × (0.24–0.25) **Infinite** | 6.54 × (6.42–7.35) **NG-ZORRO** |
| Longest gap between frames (lower is better) | 441 ms (±5.75) | 123 ms (±3.85) | 645 ms (±13.0) | 1614 ms (±36.6) | 81.9 ms (±3.21) | 3.58 × (3.38–3.68) **PrimeNG** | 0.68 × (0.66–0.70) **Infinite** | 0.27 × (0.27–0.29) **Infinite** | 5.39 × (4.99–5.53) **NG-ZORRO** |
| Long tasks: total blocking time (lower is better) | 3503 ms (±65.8) | 535 ms (±37.8) | 3514 ms (±76.8) | 4870 ms (±593) | 67.8 ms (±9.07) | 6.55 × (5.77–6.87) **PrimeNG** | 1.00 × (0.96–1.03) ≈ | 0.72 × (0.57–0.73) **Infinite** | 51.7 × (46.1–66.7) **NG-ZORRO** |
| Main thread: layout (lower is better) | 10.9 ms (±0.43) | 220 ms (±2.10) | 15.2 ms (±0.43) | 4.18 ms (±0.41) | 88.6 ms (±3.73) | 0.05 × (0.05–0.05) **Infinite** | 0.72 × (0.66–0.74) **Infinite** | 2.60 × (2.14–2.67) **TanStack** | 0.12 × (0.11–0.13) **Infinite** |
| Main thread: style recalc (lower is better) | 1.11 ms (±0.08) | 114 ms (±2.53) | 2.00 ms (±0.16) | 0.40 ms (±0.09) | 2.15 ms (±0.16) | 0.01 × (0.01–0.01) **Infinite** | 0.56 × (0.47–0.62) **Infinite** | 2.81 × (1.86–2.99) **TanStack** | 0.52 × (0.44–0.61) **Infinite** |
| Main thread: all tasks (lower is better) | 4412 ms (±84.9) | 4106 ms (±21.7) | 4368 ms (±76.9) | 5105 ms (±617) | 4067 ms (±14.2) | 1.07 × (1.05–1.10) **PrimeNG** | 1.01 × (0.98–1.04) ≈ | 0.86 × (0.68–0.89) **Infinite** | 1.08 × (1.06–1.11) **NG-ZORRO** |

## updates-high-grouped - 1,000,000 rows

Live updates, high frequency. The grid shows grouped by department (10 collapsed groups), with the sum of the salaries of each group - the updates change the salaries, so the sums change. A feed of 50 updates a second, of 100 random rows each, for 4 s (200 updates). An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. The page hands the grid the updates once per animation frame: all the ones that arrived since the previous frame, as one update - so a grid that keeps the main thread busy gets them later, and more at once. "Lag at the end" = from the arrival of the last update to the end of the first frame committed with the viewport showing it. "Update delay" = from the arrival of an update to the frame that hands it to the grid. Frames, gaps and blocking time come from the trace, from the first update until the last one is painted: the frames the main thread committed, and the part over 50 ms of every task.

| Metric | Infinite median (sd) | TanStack median (sd) | Infinite vs TanStack |
|---|---:|---:|---:|
| Lag at the end: last update to painted (lower is better) | 1511 ms (±126) | 2007 ms (±937) | 0.75 × (0.39–0.85) **Infinite** |
| Update delay, p95 (lower is better) | 835 ms (±17.6) | 1908 ms (±31.4) | 0.44 × (0.42–0.45) **Infinite** |
| Frames committed per second (higher is better) | 1.09 fps (±0.02) | 0.51 fps (±0.01) | 2.15 × (2.03–2.20) **Infinite** |
| Gap between frames, p95 (lower is better) | 1099 ms (±40.3) | 2108 ms (±34.3) | 0.52 × (0.49–0.54) **Infinite** |
| Longest gap between frames (lower is better) | 1134 ms (±53.4) | 2133 ms (±38.1) | 0.53 × (0.50–0.56) **Infinite** |
| Long tasks: total blocking time (lower is better) | 5110 ms (±129) | 5823 ms (±908) | 0.88 × (0.67–0.91) **Infinite** |
| Main thread: layout (lower is better) | 1.55 ms (±0.06) | 1.32 ms (±0.24) | 1.17 × (0.93–1.41) ≈ |
| Main thread: style recalc (lower is better) | 0.39 ms (±0.03) | 0.00 ms (±0.00) | +0.39 (+0.36 to +0.45) **TanStack** |
| Main thread: all tasks (lower is better) | 5501 ms (±124) | 5988 ms (±937) | 0.92 × (0.70–0.95) **Infinite** |
