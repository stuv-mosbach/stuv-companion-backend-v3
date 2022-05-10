import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { RequestLog } from "../entities/request_log.entity";
import { Repository } from "typeorm";
import { Request } from "express";

@Injectable()
export class RequestLogService {

  constructor(@InjectRepository(RequestLog) private logRepo : Repository<RequestLog>) {}

  createCourseLog(course : string) {
    const log = new RequestLog("COURSE", course);
    this.logRepo.save(log);
  }

  createLecturerLog(lecturer : string) {
    const log = new RequestLog("LECTURER", lecturer);
    this.logRepo.save(log);
  }

  createCourseListLog() {
    const log = new RequestLog("COURSE_LIST");
    this.logRepo.save(log);
  }

  async getCourseStats() {
    return this.logRepo.createQueryBuilder("requestlog")
      .select("RequestLog.details, count(*) as counter")
      .where("RequestLog.type = 'COURSE'")
      .groupBy("RequestLog.details")
      .orderBy("counter", "DESC")
      .getRawMany();
  }

}
