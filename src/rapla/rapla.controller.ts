import { Controller, Get, Param, ParseBoolPipe, Query, Req } from "@nestjs/common";
import { RaplaService } from "./rapla.service";
import { RequestLogService } from "../request-log/request-log.service";
import { Request } from "express";
import { DefaultIntPipe } from "../pipes/DefaultInt.pipe";
import { DefaultBooleanPipe } from "../pipes/DefaultBoolean.pipe";

@Controller('rapla')
export class RaplaController {

  constructor(
    private readonly raplaService: RaplaService,
    private readonly logService : RequestLogService
  ) {}

  @Get("/lectures/:course")
  async lectures(@Param("course") course : string, @Query("archived", new DefaultBooleanPipe(false)) archived : boolean) {
    this.logService.createCourseLog(course);
    return this.raplaService.getLectures(course.split(","), archived);
  }

  @Get("/lectures")
  async allLectures(@Query("archived", new DefaultBooleanPipe(false)) archived : boolean) {
    this.logService.createCourseLog("*ALL*");
    return this.raplaService.getAllLectures(archived);
  }

  @Get("/courses")
  async courses(@Req() request : Request) {
    this.logService.createCourseListLog();
    return this.raplaService.getCourses();
  }

  @Get("/courses/names")
  async coursesNames() {
    return this.raplaService.getCourseNames();
  }

  @Get("/lecturer/:lecturer")
  async lecturers(@Param("lecturer") lecturer : string) {
    this.logService.createLecturerLog(lecturer);
    return this.raplaService.getLecturesOfLecturer(lecturer);
  }


}
