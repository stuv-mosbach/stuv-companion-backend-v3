import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {classToPlain, Exclude} from "class-transformer";
import {Lecture} from "./lecture.entity";
import {LectureChangeInfo} from "./lecture_change_info.entity";

export type changeFieldType = "string" | "array" | "date" | "number";

@Entity()
export class FieldChangeInfo {

  @PrimaryGeneratedColumn()
  @Exclude()
  id!: number;

  @ManyToOne(() => LectureChangeInfo)
  lectureChangeInfo!: LectureChangeInfo;

  @Column()
  fieldName!: string;

  @Column()
  fieldType!: changeFieldType;

  @Column()
  previousValue!: string;

  @Column()
  value!: string;

  constructor(fieldName: string, fieldType: changeFieldType, previousValue: string, value: string) {
    this.fieldName = fieldName;
    this.fieldType = fieldType;
    this.previousValue = previousValue;
    this.value = value;
  }
}

export const getChangeSet = (oldLecture: Lecture, newLecture: Lecture) : FieldChangeInfo[] => {
  const changes: FieldChangeInfo[] = [];
  if (oldLecture.startTime.valueOf() !== newLecture.startTime.valueOf()) {
    changes.push(new FieldChangeInfo(
      "startTime",
      "date",
      oldLecture.startTime.toISOString(),
      newLecture.startTime.toISOString()
    ))
  }

  if (oldLecture.endTime.valueOf() !== newLecture.endTime.valueOf()) {
    changes.push(new FieldChangeInfo(
      "endTime",
      "date",
      oldLecture.endTime.toISOString(),
      newLecture.endTime.toISOString()
    ))
  }

  if (oldLecture.name !== newLecture.name) {
    changes.push(new FieldChangeInfo(
      "name",
      "string",
      oldLecture.name,
      newLecture.name
    ))
  }

  if (oldLecture.type !== newLecture.type) {
    changes.push(new FieldChangeInfo(
      "type",
      "string",
      oldLecture.type,
      newLecture.type
    ))
  }

  if (oldLecture.lecturer !== newLecture.lecturer) {
    changes.push(new FieldChangeInfo(
      "lecturer",
      "string",
      oldLecture.lecturer,
      newLecture.lecturer
    ))
  }

  if (oldLecture.rooms.sort().join(",") !== newLecture.rooms.sort().join(",")) {
    changes.push(new FieldChangeInfo(
      "rooms",
      "array",
      oldLecture.rooms.join(","),
      newLecture.rooms.join(",")
    ))
  }

  if (oldLecture.course !== newLecture.course) {
    changes.push(new FieldChangeInfo(
      "course",
      "string",
      oldLecture.course,
      newLecture.course
    ))
  }

  return changes;
}

export const fieldChangeInfoToPlain = (entity: FieldChangeInfo) => {
  return {
    ...classToPlain<FieldChangeInfo>(entity)
  };
}
