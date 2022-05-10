import {Column, Entity, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn} from 'typeorm';
import {classToPlain, Exclude} from "class-transformer";
import {arrayCompare} from "../utils/array.utils";
import {Lecture} from "./lecture.entity";
import {LectureSyncInfo} from "./lecture_sync_info.entity";
import {LectureChangeInfo} from "./lecture_change_info.entity";

export type lectureAttendType = "PRESENCE" | "ONLINE" | "HYBRID";

@Entity()
export class NewLecture extends Lecture {

  @ManyToOne(() => LectureSyncInfo, lci => lci.newLectures)
  syncInfo!: number;

  constructor(date: Date, startTime: Date, endTime: Date, name: string, type: lectureAttendType, lecturer: string, rooms: string[], course: string) {
    super();
    this.date = date;
    this.startTime = startTime;
    this.endTime = endTime;
    this.name = name;
    this.type = type;
    this.lecturer = lecturer;
    this.rooms = rooms;
    this.course = course;
  }
}

@Entity()
export class RemovedLecture extends Lecture {

  @ManyToOne(() => LectureSyncInfo, lci => lci.removedLectures)
  syncInfo!: number;

  constructor(date: Date, startTime: Date, endTime: Date, name: string, type: lectureAttendType, lecturer: string, rooms: string[], course: string) {
    super();
    this.date = date;
    this.startTime = startTime;
    this.endTime = endTime;
    this.name = name;
    this.type = type;
    this.lecturer = lecturer;
    this.rooms = rooms;
    this.course = course;
  }
}

@Entity()
export class UpdatedLecture extends Lecture {

  @OneToOne(() => LectureChangeInfo, lci => lci.lecture)
  syncInfo!: number;

  constructor(date: Date, startTime: Date, endTime: Date, name: string, type: lectureAttendType, lecturer: string, rooms: string[], course: string) {
    super();
    this.date = date;
    this.startTime = startTime;
    this.endTime = endTime;
    this.name = name;
    this.type = type;
    this.lecturer = lecturer;
    this.rooms = rooms;
    this.course = course;
  }
}

