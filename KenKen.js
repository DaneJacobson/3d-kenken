class KenKen {
    constructor(n = 3, max_cage_size = 4) {
        const self = this;
        self.n = n;
        self.max_cage_size = max_cage_size;
        self.mst = Array(self.n).fill().map((v, i) => i + 1);
        self.cube = Array(self.n).fill().map(() => Array(self.n).fill().map(() => Array(self.n).fill(0)));
        self.cubeInfo = {}
        self.cageInfo = {}

        if (self.createLatinCube(0, 0, 0)) {
            console.table(self.cube.map(layer => layer.map(row => row.join(' ')).join('   ')));
        }

        self.createKenKen();
        console.log(self.cubeInfo);
        console.log(self.cageInfo);
    }
  
    createLatinCube(x, y, z) {
        const self = this;
        const d = [...self.mst];
        let s;
        while (true) {
            do {
                s = d.splice(Math.floor(Math.random() * d.length), 1)[0];
                if (!s) return false;
            } while (self.check(s, x, y, z));

            self.cube[x][y][z] = s;
            if (++x >= self.n) {
                x = 0;
                if (++y >= self.n) {
                    y = 0;
                    if (++z >= self.n) return true;
                }
            }
            if (self.createLatinCube(x, y, z)) return true;
            if (--x < 0) {
                x = self.n - 1;
                if (--y < 0) {
                    y = self.n - 1;
                    if (--z < 0) return false;
                }
            }
        }
    }
  
    check(d, x, y, z) {
        const self = this;
        for (let a = 0; a < self.n; a++) {
            if ((x - a > -1) && (self.cube[x - a][y][z] === d)) return true;
            if ((y - a > -1) && (self.cube[x][y - a][z] === d)) return true;
            if ((z - a > -1) && (self.cube[x][y][z - a] === d)) return true;
        }
        return false;
    }

    createKenKen() {
        const self = this;
        let cages = [];
        let visited = Array(self.n).fill().map(() => Array(self.n).fill().map(() => Array(self.n).fill(false)));

        // Function to create a random cage starting from (x, y, z)
        function formCage(x, y, z) {
            let cage = [];
            let stack = [[x, y, z]];
            let cage_size = Math.ceil(Math.random() * self.max_cage_size);

            while (stack.length > 0 && cage.length < cage_size) {
                let [cx, cy, cz] = stack.pop();
                if (!visited[cx][cy][cz]) {
                    visited[cx][cy][cz] = true;
                    cage.push([cx, cy, cz]);

                    // Add adjacent cells to stack (check bounds and visited)
                    [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach(([dx, dy, dz]) => {
                        let nx = cx + dx, ny = cy + dy, nz = cz + dz;
                        if (nx < self.n && ny < self.n && nz < self.n && !visited[nx][ny][nz]) {
                            stack.push([nx, ny, nz]);
                        }
                    });
                }
            }
            return cage;
        }

        // Iterate over the cube to form cages
        for (let x = 0; x < self.n; x++) {
            for (let y = 0; y < self.n; y++) {
                for (let z = 0; z < self.n; z++) {
                    if (!visited[x][y][z]) {
                        cages.push(formCage(x, y, z));
                    }
                }
            }
        }

        // Assign operators and calculate results for each cage
        let cageNumber = 0;
        cages = cages.forEach(cage => {
            cageNumber++;
            let operator;
            let result;

            // Try to use division if possible
            operator = '+';
            result = cage.reduce((sum, cell) => sum + self.cube[cell[0]][cell[1]][cell[2]], 0);
            // console.log(cage);
            // console.log(operator);
            // console.log(result);
            // if (cage.length === 2 && cage[0] % cage[1] === 0) {
            //     operator = '/';
            //     result = cage[0] / cage[1];
            // } else if (cage.length === 2 && cage[0] - cage[1] > 0) {
            //     operator = '-';
            //     result = cage[0] = cage[1];
            // } else {
            //     // Fallback to other operators
            //     operator = '+';
            //     result = cage.reduce((acc, val) => acc + val, 0);
            // }

            // Set cubeInfo
            cage.forEach(cell => {
                const [x, y, z] = cell;
                self.cubeInfo[`${x}-${y}-${z}`] = {
                    value: '', 
                    cageNumber: cageNumber, 
                    cubeGroupReference: null
                };
            });

            // Find the top corner of the cage and mark it
            cage.sort((a, b) => {
                if (a[2] !== b[2]) {
                    return b[2] - a[2]; // max z (blue)
                } else if (a[1] !== b[1]) {
                    return b[1] - a[1]; // max y (green)
                } else {
                    return a[0] - b[0]; // min x (orange)
                }
            });
            self.cubeInfo[`${cage[0][0]}-${cage[0][1]}-${cage[0][2]}`].topCorner = true;
            for (let i = 1; i < cage.length; i++) {
                self.cubeInfo[`${cage[i][0]}-${cage[i][1]}-${cage[i][2]}`].topCorner = false;
            }

            // Set cageInfo
            self.cageInfo[`${cageNumber}`] = {operator: operator, result: result, color: ''};
        });

        // Find minimum k-coloring to assign coloring

    }
}

// // Function to check if two cells are adjacent
// function isAdjacent(cell1, cell2) {
//     for (let i = 0; i < 3; i++) {
//         if (Math.abs(cell1[i] - cell2[i]) <= 1 && cell1[(i + 1) % 3] === cell2[(i + 1) % 3] && cell1[(i + 2) % 3] === cell2[(i + 2) % 3]) {
//             return true;
//         }
//     }
//     return false;
// }

// // Function to check if two cages are adjacent
// function areCagesAdjacent(cage1, cage2) {
//     for (const cell1 of cage1) {
//         for (const cell2 of cage2) {
//             if (isAdjacent(cell1, cell2)) {
//                 return true;
//             }
//         }
//     }
//     return false;
// }

// // Build the adjacency graph
// let graph = new Map();
// for (let i = 0; i < cages.length; i++) {
//     graph.set(i, []);
//     for (let j = 0; j < cages.length; j++) {
//         if (i !== j && areCagesAdjacent(cages[i], cages[j])) {
//             graph.get(i).push(j);
//         }
//     }
// }

// // Function to find minimum k-coloring
// function findMinimumKColoring(graph) {
//     let colors = new Map();
//     let maxColor = 0;
    
//     for (const [node, neighbors] of graph.entries()) {
//         let availableColors = new Set(Array.from({length: maxColor + 1}, (_, i) => i));
//         for (const neighbor of neighbors) {
//             if (colors.has(neighbor)) {
//                 availableColors.delete(colors.get(neighbor));
//             }
//         }
//         let chosenColor = availableColors.size > 0 ? Math.min(...availableColors) : maxColor + 1;
//         colors.set(node, chosenColor);
//         maxColor = Math.max(maxColor, chosenColor);
//     }

//     return colors;
// }

// // Assign colors to cages
// let coloring = findMinimumKColoring(graph);
// for (const [cageNumber, color] of coloring.entries()) {
//     self.cageInfo[`${cageNumber + 1}`].color = color; // Adjust index to match cage numbering
// }

// // Now you can use the `self.cageInfo` to access the color of each cage.


export { KenKen };