import { Module } from '@nestjs/common';
import { IcsController } from './ics.controller';
import { IcsService } from './ics.service';
import { RaplaService } from "../rapla/rapla.service";
import { RaplaModule } from "../rapla/rapla.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Lecture } from "../entities/lecture.entity";
import { NewLecture, RemovedLecture, UpdatedLecture } from "../entities/archived_lecture.entity";
import { LectureSyncInfo } from "../entities/lecture_sync_info.entity";
import { LectureChangeInfo } from "../entities/lecture_change_info.entity";
import { FieldChangeInfo } from "../entities/field_change_info.entity";
import { RequestLog } from "../entities/request_log.entity";

@Module({
  imports: [
    RaplaModule,
    TypeOrmModule.forFeature([Lecture, NewLecture, UpdatedLecture, RemovedLecture, LectureSyncInfo, LectureChangeInfo, FieldChangeInfo, RequestLog]),
  ],
  controllers: [IcsController],
  providers: [IcsService, RaplaService]
})
export class IcsModule {}
