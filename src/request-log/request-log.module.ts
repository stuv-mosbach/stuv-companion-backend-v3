import { Module } from '@nestjs/common';
import { RequestLogService } from './request-log.service';
import { RequestLogController } from './request-log.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { RequestLog } from "../entities/request_log.entity";

@Module({
  imports: [TypeOrmModule.forFeature([RequestLog])],
  providers: [RequestLogService],
  controllers: [RequestLogController]
})
export class RequestLogModule {}
