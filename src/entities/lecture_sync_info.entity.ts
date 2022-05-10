import {Column, Entity, ManyToMany, OneToMany, PrimaryColumn, PrimaryGeneratedColumn} from 'typeorm';
import {classToPlain, Exclude} from "class-transformer";
import {Lecture} from "./lecture.entity";
import {NewLecture, RemovedLecture} from "./archived_lecture.entity";
import {LectureChangeInfo} from "./lecture_change_info.entity";

export type statusType = "success" | "running" | "saving" | "failed";

@Entity()
export class LectureSyncInfo {

  @PrimaryGeneratedColumn()
  @Exclude()
  id!: number;

  @Column()
  status: statusType;

  @Column({type: 'timestamptz'})
  startTime!: Date;

  @Column({type: 'timestamptz'})
  endTime!: Date;

  @OneToMany(() => NewLecture, acl => acl.syncInfo ,{cascade: true})
  newLectures!: NewLecture[];

  @OneToMany(() => LectureChangeInfo, lci => lci.syncInfo, {cascade: true})
  updatedLectures!: LectureChangeInfo[];

  @OneToMany(() => RemovedLecture, rl => rl.syncInfo, {cascade: true})
  removedLectures!: RemovedLecture[];

  constructor(newLectures: NewLecture[], updatedLectures: LectureChangeInfo[], removedLectures: RemovedLecture[]) {
    this.startTime = new Date();
    this.endTime = new Date();
    this.status = "running";

    this.newLectures = newLectures;
    this.updatedLectures = updatedLectures;
    this.removedLectures = removedLectures;
  }
}

export const syncInfoToPlain = (entity : LectureSyncInfo) => {
  return {
    ...classToPlain<LectureSyncInfo>(entity)
  };
}
