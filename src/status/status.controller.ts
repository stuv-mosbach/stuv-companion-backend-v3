import { Controller, Get } from "@nestjs/common";

@Controller('status')
export class StatusController {

  @Get("/ping")
  ping() {
    return "pong"
  }

}
