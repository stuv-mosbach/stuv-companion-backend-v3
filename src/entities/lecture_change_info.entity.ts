import {
  Column,
  Entity, JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn
} from 'typeorm';
import {classToPlain, Exclude} from "class-transformer";
import {arrayCompare} from "../utils/array.utils";
import {NewLecture, UpdatedLecture} from "./archived_lecture.entity";
import {FieldChangeInfo} from "./field_change_info.entity";
import {LectureSyncInfo} from "./lecture_sync_info.entity";

@Entity()
export class LectureChangeInfo {

  @PrimaryGeneratedColumn()
  @Exclude()
  id!: number;

  @ManyToOne(() => LectureSyncInfo, lci => lci.updatedLectures)
  syncInfo!: LectureSyncInfo;

  @OneToOne(() => UpdatedLecture, {cascade: true})
  @JoinColumn()
  lecture!: UpdatedLecture;

  @OneToMany(() => FieldChangeInfo, fci => fci.lectureChangeInfo, {cascade: true})
  changeInfos!: FieldChangeInfo[];

  constructor(lecture: UpdatedLecture, changeInfos: FieldChangeInfo[]) {
    this.lecture = lecture;
    this.changeInfos = changeInfos;
  }
}

export const fieldChangeInfoToPlain = (entity : LectureChangeInfo) => {
  return {
    ...classToPlain<LectureChangeInfo>(entity)
  };
}
