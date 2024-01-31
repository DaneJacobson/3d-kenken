# 3d kenken

TODO:
- need directionality to work regardless of camera angle
- minimum k-coloring (it's random right now)
    - construct the graph
    - solve for the colors and make sure each color is mapped to a cage
- make the thing pretty (balance colors, figure out edges)
- explode the cages for easy access
- determine unique solution (for completeness)
- click on a box and set the pointer to that
- randomize the direction construction of the boxes

- balance out the operations/cage sizes
- add correct operation processing to evaluatePuzzle()

- random directions when cages are being built, biased right now

- ship somehwere online (maybe Vercel?)

- add a key so people know the controls lol

- timer

Speedups
- 6x6x6 fails to generate, need to figure out why and optimize generation algorithms
- Wiping colors is tough, I think it might be necessary to add cubes to the cageInfo for quick retrieval
- 0+ bug somewhere