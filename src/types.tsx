export type LatinCube = number[][][];

export type Color = string;

export type Cage = { 
    cells: [number, number, number][], 
    operation: string, 
    result: number,
    color: Color
};

export const N: number = 4;

export type BoxProps = {
  position: [number, number, number];
  number: number;
  color: Color;
}