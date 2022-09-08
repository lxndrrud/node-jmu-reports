import { DataSource } from "typeorm";
import { StudentGroup } from "../entities/students_groups";
import { StudentMark } from "../entities/students_marks";


export interface IMarksRepo {
    getMarksForGroup(idGroup: number, idSubjectControl: number): Promise<StudentGroup[]>
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

        return this.connection.createQueryBuilder(StudentGroup, 'sg')
            .innerJoinAndSelect('sg.student', 's')
            .leftJoinAndSelect('sg.marks', 'm')
            //.whereInIds(idsStudentGroups)
            .where('sg.id IN (:...idsStudentGroups)', { idsStudentGroups: idsStudentGroups.map(item => item.id) })
            .andWhere('m.id_subject_control = :idSubjectControl', { idSubjectControl })
            .andWhere('sg.status = :status', { status: 0 })
            .getMany()
    }
}