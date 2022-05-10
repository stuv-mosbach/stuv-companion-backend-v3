import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {Exclude} from "class-transformer";

export type LogType = "COURSE_LIST" | "COURSE" | "LECTURER";

@Entity()
export class RequestLog {

  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @Column({type: 'timestamptz'})
  timestamp: Date;

  @Column()
  type: LogType;

  @Column({nullable: true})
  details: string;

  constructor(type: LogType, details?: string) {
    this.type = type;
    this.details = details;
    this.timestamp = new Date();
  }
}
