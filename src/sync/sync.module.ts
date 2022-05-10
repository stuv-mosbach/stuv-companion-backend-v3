import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { LectureSyncInfo } from "../entities/lecture_sync_info.entity";

@Module({
  imports: [TypeOrmModule.forFeature([LectureSyncInfo])],
  providers: [SyncService],
  controllers: [SyncController]
})
export class SyncModule {}
