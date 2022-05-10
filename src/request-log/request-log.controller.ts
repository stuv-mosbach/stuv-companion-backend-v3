import { Controller, Get } from "@nestjs/common";
import { RequestLogService } from "./request-log.service";

@Controller('request-log')
export class RequestLogController {

  constructor(private readonly logService : RequestLogService) {}

  @Get("/coursestats")
  async getCourseStats(){
    return this.logService.getCourseStats();

  }

}
