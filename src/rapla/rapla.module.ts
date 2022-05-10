import { Module } from '@nestjs/common';
import { RaplaService } from './rapla.service';
import { RaplaController } from './rapla.controller';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {compareLecture, Lecture} from "../entities/lecture.entity";
import {getStartOfDay} from "../utils/date.utils";
import { Cron } from "@nestjs/schedule";
import {LectureSyncInfo} from "../entities/lecture_sync_info.entity";
import {LectureChangeInfo} from "../entities/lecture_change_info.entity";
import {FieldChangeInfo} from "../entities/field_change_info.entity";
import {NewLecture, RemovedLecture, UpdatedLecture} from "../entities/archived_lecture.entity";
import { RequestLogService } from "../request-log/request-log.service";
import { RequestLog } from "../entities/request_log.entity";
import { RequestLogModule } from "../request-log/request-log.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Lecture, NewLecture, UpdatedLecture, RemovedLecture, LectureSyncInfo, LectureChangeInfo, FieldChangeInfo, RequestLog]),
    RequestLogModule
  ],
  providers: [RaplaService, RequestLogService],
  controllers: [RaplaController]
})
export class RaplaModule {

  constructor(private readonly raplaService : RaplaService) {
  }

  onModuleInit() {
    this.updateCourses();
  }

  @Cron("0 6-20/1 * * 6-7", {name: "rapla_sync_weekend"})
  private async updateCourses() {
    await this.raplaService.updateCourses();
  }

  @Cron("0,20,40 6-20/1 * * 1-5", {name: "rapla_sync_weekdays"})
  private async updateCoursesWeekend() {
    await this.raplaService.updateCourses();
  }

}
