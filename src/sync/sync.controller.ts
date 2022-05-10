import { Controller, Get, Param, ParseIntPipe, Patch, Query } from "@nestjs/common";
import { SyncService } from "./sync.service";
import { DefaultIntPipe } from "../pipes/DefaultInt.pipe";
import { SimpleDatePipe } from "../pipes/SimpleDate.pipe";

@Controller('sync')
export class SyncController {

  constructor(private readonly syncService: SyncService) {
  }

  @Get("/latest")
  async getLatestSyncInfos(@Query("skip", new DefaultIntPipe(0)) skip : number,
                           @Query("amount", new DefaultIntPipe(10)) amount : number) {
    return this.syncService.getLatestSyncInfos(skip, amount)
  }


  @Get("/today")
  async getSyncInfoOfToday() {
    return this.syncService.getSyncInfosOfDay(new Date());
  }

  @Get("/date/:date")
  async getSyncInfoOfDate(@Param("date", SimpleDatePipe) date : Date) {
    return this.syncService.getSyncInfosOfDay(date);
  }

  @Get("/:id")
  async getSyncInfo(@Param("id", ParseIntPipe) id : number) {
    return this.syncService.getSyncInfo(id);
  }

}
