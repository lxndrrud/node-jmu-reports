export type StudentMarkResponse = {
    id_students_groups: number;
    firstname: string;
    middlename: string;
    lastname: string;
    id_mark: number | null;
    ball_5: string | null;
    ball_100: number | null;
    ball_ects: BallECTS | null;
}

export type MarkWithSubjectResponse = {
    id_subject_control: number;
    subject_name: string;
    creditUnits: string;
    hours: string;
    form_control_name: string;
    lecturer: any;
    date_exam: string;
    ball_5: number | null;
    ball_100: number | null;
    ball_ects: BallECTS | null;
}

export type BallECTS = 'A' | 'B' | 'C' | 'D' | 'E' | 'FX' | 'F'