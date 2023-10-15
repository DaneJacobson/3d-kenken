type LatinCube = number[][][];

type Cage = { 
    cells: [number, number, number][], 
    operation: string, 
    result: number 
};

function generateLatinCube(n: number): LatinCube | null {
    let cube: LatinCube = Array.from(
        { length: n }, 
        () => Array.from({ length: n }, () => Array(n).fill(0))
    );

    function isSafe(x: number, y: number, z: number, num: number): boolean {
        for (let i = 0; i < n; i++) {
            // Check row, column, and depth for the number
            if (cube[x][y][i] === num || cube[x][i][z] === num || cube[i][y][z] === num) {
                return false;
            }
        }
        return true;
    }

    function solve(x = 0, y = 0, z = 0): boolean {
        // Skip the first dimension since that won't overlap
        if (x === n) {
            return true;
        }

        for (let num = 1; num <= n; num++) {
            if (isSafe(x, y, z, num)) {
                cube[x][y][z] = num;

                let nextX = x;
                let nextY = y;
                let nextZ = z + 1;

                if (nextZ === n) {
                    nextZ = 0;
                    nextY += 1;
                }

                if (nextY === n) {
                    nextY = 0;
                    nextX += 1;
                }

                if (solve(nextX, nextY, nextZ)) {
                    return true;
                }

                cube[x][y][z] = 0;  // Backtrack
            }
        }

        return false;
    }

    if (!solve()) {
        return null;
    }

    return cube;
}

function generateCagesForCube(cube: LatinCube): Cage[] {
    const cages: Cage[] = [];
    const n = cube.length;
    const used: boolean[][][] = Array.from({ length: n }, () => Array.from({ length: n }, () => Array(n).fill(false)));

    function getAdjacentCells(x: number, y: number, z: number): [number, number, number][] {
        const directions = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [-1, 0, 0], [0, -1, 0], [0, 0, -1]];
        const adjacentCells: [number, number, number][] = [];

        for (const dir of directions) {
            const adjX = x + dir[0];
            const adjY = y + dir[1];
            const adjZ = z + dir[2];

            if (adjX >= 0 && adjX < n && adjY >= 0 && adjY < n && adjZ >= 0 && adjZ < n && !used[adjX][adjY][adjZ]) {
                adjacentCells.push([adjX, adjY, adjZ]);
            }
        }

        return adjacentCells;
    }

    function *permute(array: number[], start: number = 0): IterableIterator<number[]> {
        if (start === array.length - 1) {
            yield array.slice();
        }
        for (let i = start; i < array.length; i++) {
            [array[start], array[i]] = [array[i], array[start]];
            yield* permute(array, start + 1);
            [array[start], array[i]] = [array[i], array[start]];
        }
    }

    function determineOperation(values: number[]): { operation: string, result: number } {
        if (values.length === 1) {
            return { operation: '=', result: values[0] };
        }

        const ops = ['+', '-', '*', '/'];
        let operation: string;
        let result: number;

        // Shuffle the operations for randomness
        for (let i = ops.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [ops[i], ops[j]] = [ops[j], ops[i]];
        }

        for (const op of ops) {
            if (op === '-') {
                for (const permutedValues of permute(values)) {
                    result = permutedValues.reduce((a, b) => a - b);
                    if (result >= 0) {
                        operation = '-';
                        return { operation, result };
                    }
                }
            } else if (op === '/') {
                for (const permutedValues of permute(values)) {
                    result = permutedValues.reduce((a, b) => a / b);
                    if (Number.isInteger(result) && result >= 1) {
                        operation = '/';
                        return { operation, result };
                    }
                }
            } else if (op === '+') {
                operation = '+';
                result = values.reduce((a, b) => a + b);
                return { operation, result };
            } else if (op === '*') {
                operation = '*';
                result = values.reduce((a, b) => a * b);
                return { operation, result };
            }
        }

        // Default fallback
        operation = '+';
        result = values.reduce((a, b) => a + b);
        return { operation, result };
    }
    
    // Generate the KenKen puzzle
    for (let x = 0; x < n; x++) {
        for (let y = 0; y < n; y++) {
            for (let z = 0; z < n; z++) {
                if (!used[x][y][z]) {
                    let cageCells: [number, number, number][] = [[x, y, z]];
                    const values = [cube[x][y][z]];

                    while (Math.random() < 0.75 && cageCells.length < 5) {  // Now grows up to size 5 with 75% probability
                        const possibleExtensions = cageCells.flatMap(
                            cell => getAdjacentCells(...cell)).filter(
                                adjCell => !used[adjCell[0]][adjCell[1]][adjCell[2]]
                            );
                        if (possibleExtensions.length === 0) {
                            break;
                        }

                        const randomExtension = possibleExtensions[
                            Math.floor(Math.random() * possibleExtensions.length)
                        ];
                        cageCells.push(randomExtension);
                        values.push(cube[randomExtension[0]][randomExtension[1]][randomExtension[2]]);
                    }

                    for (const cell of cageCells) {
                        used[cell[0]][cell[1]][cell[2]] = true;
                    }

                    const { operation, result } = determineOperation(values);
                    cages.push({ cells: cageCells, operation, result });
                }
            }
        }
    }

    return cages;
}

function generateCellToCageMap(cages: Cage[]): Map<string, number> {
    const cellToCageMap = new Map<string, number>();

    cages.forEach((cage, cageIndex) => {
        cage.cells.forEach(cell => {
            cellToCageMap.set(cell.toString(), cageIndex);
        });
    });

    return cellToCageMap;
}

function generate3DKenKen(n: number): { cube: LatinCube, cages: Cage[], cellToCageMap: Map<string, number> } | null {
    const cube = generateLatinCube(n);
    if (!cube) {
        return null;
    }

    const cages = generateCagesForCube(cube);
    const cellToCageMap = generateCellToCageMap(cages)
    return { cube, cages, cellToCageMap };
}

export default generate3DKenKen;