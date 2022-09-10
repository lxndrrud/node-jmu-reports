import { DataSource } from "typeorm";
import { StudentGroup } from "../entities/students_groups";
import { BallECTS, StudentMarkResponse } from "../types/studentMark.type";


export interface IMarksRepo {
    getMarksForGroup(idGroup: number, idSubjectControl: number): Promise<StudentMarkResponse[]>
    fillMarkInfo(students: StudentMarkResponse[], marks: StudentMarkResponse[]): StudentMarkResponse[]
}

export class MarksRepo implements IMarksRepo {
    private connection

    constructor(
        connectionInstance: DataSource
    ) {
        this.connection = connectionInstance
    }

    public async getMarksForGroup(idGroup: number, idSubjectControl: number) {
        const idsStudentGroups = await this.connection.getRepository(StudentGroup).find({
            select: {
                id: true
            },
            where: {
                idGroup: idGroup
            }
        })

        let marks = await  this.connection.createQueryBuilder(StudentGroup, 'sg')
            .innerJoinAndSelect('sg.student', 's')
            .leftJoinAndSelect('sg.marks', 'm')
            //.whereInIds(idsStudentGroups)
            .where('sg.id IN (:...idsStudentGroups)', { idsStudentGroups: idsStudentGroups.map(item => item.id) })
            .andWhere('m.id_subject_control = :idSubjectControl', { idSubjectControl })
            .andWhere('sg.status = :status', { status: 0 })
            .getMany()

        return this.prepareMarks(marks)
    }

    private unbalancing(key: 'A' | 'B' | 'C' | 'D' | 'E' | 'FX' | 'F') {
        const marksMap = {
            A: 'отлично',
            B: 'хорошо',
            C: 'хорошо',
            D: 'удовлетворительно',
            E: 'удовлетворительно',
            FX: 'неудовлетворительно',
            F: 'неудовлетворительно',
        };
        return marksMap[key]
    }

    private prepareMarks(studentGroups: StudentGroup[]) {
        /*
.select(
      's.id as id_student',
      's.firstname as student_firstname',
      's.middlename as student_middlename',
      's.lastname as student_lastname',
      'm.id as id_mark',
      'm.id_subject_control',
      'm.ball_100',
      'm.ball_5',
      'm.ball_ects',
      'm.created_at',
      'm.id_user',
      'm.ip_address_user',
      'm.id_students_groups',
    )

        */
        let result: StudentMarkResponse[] = []
        for (let studGroup of studentGroups) {
            console.log(studGroup.marks[0])
            result.push({
                id_students_groups: studGroup.id,
                firstname: studGroup.student.firstname,
                middlename: studGroup.student.middlename,
                lastname: studGroup.student.lastname,
                id_mark: studGroup.marks[0].id,
                ball_5: this.unbalancing(studGroup.marks[0].ballECTS as BallECTS),
                ball_100: studGroup.marks[0].ball100,
                ball_ects: studGroup.marks[0].ballECTS as BallECTS,
            })
        }
        return result
    }

    public fillMarkInfo(students: StudentMarkResponse[], marks: StudentMarkResponse[]) {
        return students.map((student) => {
            marks.forEach((mark) => {
                if (mark.id_students_groups === student.id_students_groups) {
                    student.id_mark = mark.id_mark
                    student.ball_5 = this.unbalancing(mark.ball_ects as BallECTS)
                    student.ball_100 = mark.ball_100
                    student.ball_ects = mark.ball_ects
                }
            });
            return student;
        });
    }
}