import {Column, Entity, PrimaryColumn, PrimaryGeneratedColumn} from 'typeorm';
import {classToPlain, Exclude} from "class-transformer";
import {arrayCompare} from "../utils/array.utils";

export type lectureAttendType = "PRESENCE" | "ONLINE" | "HYBRID";

@Entity()
export class Lecture {

  @PrimaryGeneratedColumn()
  //@PrimaryColumn()
  @Exclude()
  id!: number;

  @Column({type: 'timestamptz'})
  date!: Date;

  @Column({type: 'timestamptz'})
  startTime!: Date;

  @Column({type: 'timestamptz'})
  endTime!: Date;

  @Column()
  name!: string;

  @Column()
  type!: lectureAttendType;

  @Column({})
  lecturer!: string;

  @Column({type: 'text', array: true})
  rooms!: string[];

  @Column()
  course!: string;

}

export const lectureToPlain = (entity : Lecture) => {
  return {
    ...classToPlain<Lecture>(entity)
  };
}

export const copyLecture = (lecture : Lecture, includeId = false) : Lecture => {
  const newLecture = {
    ...lecture,
    rooms: [...lecture.rooms]
  }
  if (!includeId) lecture.id = undefined;
  return newLecture;
}

export const compareLecture = (a : Lecture, b : Lecture) => {

  let similar = true;

  if (a.date.valueOf() !== b.date.valueOf()) similar = false;
  if (a.startTime.valueOf() !== b.startTime.valueOf()) similar = false;
  if (a.endTime.valueOf() !== b.endTime.valueOf()) similar = false;

  //if (!arrayCompare(a.course, b.course)) similar = false;
  if (a.course !== b.course) similar = false;
  if (a.name !== b.name) similar = false;
  //if (a.lecturer !== b.lecturer) similar = false;

  return similar;
}

export const hasLectureChanged = (old : Lecture, lc : Lecture) => {
  let changed = false;

  if (old.name !== lc.name) changed = true;
  if (old.date.valueOf() !== lc.date.valueOf()) changed = true;
  if (old.endTime.valueOf() !== lc.endTime.valueOf()) changed = true;
  if (old.endTime.valueOf() !== lc.endTime.valueOf()) changed = true;
  if (old.lecturer !== lc.lecturer) changed = true;
  if (old.course !== lc.course) changed = true;
  if (!arrayCompare(old.rooms, lc.rooms)) changed = true;

  return changed;
}
