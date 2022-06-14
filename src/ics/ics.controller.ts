import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { IcsService } from "./ics.service";
import { Response } from "express";

@Controller("ics")
export class IcsController {

  constructor(private readonly icsService: IcsService) {
  }

  @Get(":course")
  async lectures(@Param("course") course: string, @Res() response: Response) {
    if (course.toLowerCase().endsWith(".ics")) course = course.replace(/\.[^/.]+$/, "");
    course = course.toUpperCase();
    this.icsService.generateIcs(course.split(",")).then(res => {
      res.serve(response);
    }).catch(err => {
      console.log(err);
    });
  }

}
