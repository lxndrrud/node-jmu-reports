export type StudentWithMark = {
    id_students_groups: number;
    firstname: string;
    middlename: string;
    lastname: string;
    id_mark: number | null;
    ball_5: string | null;
    ball_100: number | null;
    ball_ects: BallECTS | null;
}

export type BallECTS = 'A' | 'B' | 'C' | 'D' | 'E' | 'FX' | 'F'