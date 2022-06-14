import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RaplaModule } from './rapla/rapla.module';
import {ConfigModule} from '@nestjs/config';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Lecture} from "./entities/lecture.entity";
import { ScheduleModule } from "@nestjs/schedule";
import {LectureSyncInfo} from "./entities/lecture_sync_info.entity";
import {LectureChangeInfo} from "./entities/lecture_change_info.entity";
import {FieldChangeInfo} from "./entities/field_change_info.entity";
import {NewLecture, RemovedLecture, UpdatedLecture} from "./entities/archived_lecture.entity";
import { SyncModule } from './sync/sync.module';
import { RequestLog } from "./entities/request_log.entity";
import { RequestLogController } from './request-log/request-log.controller';
import { RequestLogModule } from './request-log/request-log.module';
import { StatusModule } from './status/status.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
    envFilePath: ['.env', '.env.dev', '.env.dev.local', '.env.local']
    }),
    RequestLogModule,
    RaplaModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        entities: [Lecture, NewLecture, UpdatedLecture, RemovedLecture, LectureSyncInfo, LectureChangeInfo, FieldChangeInfo, RequestLog],
        // TODO: Don't use synchronize in production
        synchronize: true,
        poolErrorHandler: err => {
          console.log(err);
        }
      })
    }),
    SyncModule,
    StatusModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
/*  configure(consumer : MiddlewareConsumer) {
    consumer.apply(RequestLogMiddleware).forRoutes("*")
  }*/
 }
