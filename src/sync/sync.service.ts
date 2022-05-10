import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LectureSyncInfo } from "../entities/lecture_sync_info.entity";
import { LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";
import { getDayRage } from "../utils/date.utils";
import * as moment from "moment";

@Injectable()
export class SyncService {

  constructor(
    @InjectRepository(LectureSyncInfo) private readonly syncRepo: Repository<LectureSyncInfo>
  ) {
  }

  getSyncInfo(id: number) {
    return this.syncRepo.findOne({
        where: {
          id
        },
        relations: ["newLectures", "updatedLectures", "removedLectures", "updatedLectures.lecture", "updatedLectures.changeInfos"]
      }
    );
  }

  async getLatestSyncInfos(skip = 0, amount = 10) {
    const syncInfos : (LectureSyncInfo & {newCount? : number, updatedCount? : number, removedCount? : number, hasChanges?: boolean})[] = await this.syncRepo.find({
      skip: skip,
      take: amount,
      order: {
        startTime: "DESC"
      }
    });
    const newLectures = this.syncRepo.query(`
      SELECT t1."syncInfoId", COUNT(t1.id)
      from new_lecture as t1
      where t1."syncInfoId" IN (SELECT t2.id from lecture_sync_info as t2 order by t2."startTime" DESC limit ${amount} offset ${skip})
      GROUP BY t1."syncInfoId";
    `);
    const updatedLectures = this.syncRepo.query(`
      SELECT t1."syncInfoId", COUNT(t1.id)
      from lecture_change_info as t1
      where t1."syncInfoId" IN (SELECT t2.id from lecture_sync_info as t2 order by t2."startTime" DESC limit ${amount} offset ${skip})
      GROUP BY t1."syncInfoId";
    `);
    const removedLectures = this.syncRepo.query(`
      SELECT t1."syncInfoId", COUNT(t1.id)
      from removed_lecture as t1
      where t1."syncInfoId" IN (SELECT t2.id from lecture_sync_info as t2 order by t2."startTime" DESC limit ${amount} offset ${skip})
      GROUP BY t1."syncInfoId";
    `);
    await Promise.all([newLectures, updatedLectures, removedLectures]);

    const newL = await newLectures;
    newL.forEach(stats => {
      let {syncInfoId, count} = stats;
      count = parseInt(count);
      const si = syncInfos.find(si => si.id === syncInfoId);
      if (si) si.newCount = count;
    });

    const updatedL = await updatedLectures;
    updatedL.forEach(stats => {
      let {syncInfoId, count} = stats;
      count = parseInt(count);
      const si = syncInfos.find(si => si.id === syncInfoId);
      if (si) si.updatedCount = count;
    });

    const removedL = await removedLectures;
    removedL.forEach(stats => {
      let {syncInfoId, count} = stats;
      count = parseInt(count);
      const si = syncInfos.find(si => si.id === syncInfoId);
      if (si) si.removedCount = count;
    });

    syncInfos.forEach(si => {
      if (si.newCount === undefined) si.newCount = 0;
      if (si.updatedCount === undefined) si.updatedCount = 0;
      if (si.removedCount === undefined) si.removedCount = 0;

      si.hasChanges = !!(si.newCount | si.updatedCount | si.removedCount);
    })

    return syncInfos;
  }

  async getSyncInfosOfDay(date: Date) {
    const [startDate, endDate] = getDayRage(date);
    const startString = moment(startDate).format("YYYY-MM-DD HH:mm:ss");
    const endString = moment(endDate).format("YYYY-MM-DD HH:mm:ss");

    const syncInfos : (LectureSyncInfo & {newCount? : number, updatedCount? : number, removedCount? : number, hasChanges?: boolean})[] = await this.syncRepo.find({
      where: {
        startTime: MoreThanOrEqual(startDate),
        endTime: LessThanOrEqual(endDate)
      },
      order: {
        startTime: "DESC"
      }
    });
    const newLectures = this.syncRepo.query(`
      SELECT t1."syncInfoId", COUNT(t1.id)
      from new_lecture as t1
      where t1."syncInfoId" IN (SELECT t2.id from lecture_sync_info as t2 where t2."startTime" >= '${startString}' AND t2."startTime" <= '${endString}')
      GROUP BY t1."syncInfoId"
    `);
    const updatedLectures = this.syncRepo.query(`
      SELECT t1."syncInfoId", COUNT(t1.id)
      from lecture_change_info as t1
      where t1."syncInfoId" IN (SELECT t2.id from lecture_sync_info as t2 where t2."startTime" >= '${startString}' AND t2."startTime" <= '${endString}')
      GROUP BY t1."syncInfoId"
    `);
    const removedLectures = this.syncRepo.query(`
      SELECT t1."syncInfoId", COUNT(t1.id)
      from removed_lecture as t1
      where t1."syncInfoId" IN (SELECT t2.id from lecture_sync_info as t2 where t2."startTime" >= '${startString}' AND t2."startTime" <= '${endString}')
      GROUP BY t1."syncInfoId"
    `);
    await Promise.all([newLectures, updatedLectures, removedLectures]);

    const newL = await newLectures;
    newL.forEach(stats => {
      let {syncInfoId, count} = stats;
      count = parseInt(count);
      const si = syncInfos.find(si => si.id === syncInfoId);
      if (si) si.newCount = count;
    });

    const updatedL = await updatedLectures;
    updatedL.forEach(stats => {
      let {syncInfoId, count} = stats;
      count = parseInt(count);
      const si = syncInfos.find(si => si.id === syncInfoId);
      if (si) si.updatedCount = count;
    });

    const removedL = await removedLectures;
    removedL.forEach(stats => {
      let {syncInfoId, count} = stats;
      count = parseInt(count);
      const si = syncInfos.find(si => si.id === syncInfoId);
      if (si) si.removedCount = count;
    });

    syncInfos.forEach(si => {
      if (si.newCount === undefined) si.newCount = 0;
      if (si.updatedCount === undefined) si.updatedCount = 0;
      if (si.removedCount === undefined) si.removedCount = 0;

      si.hasChanges = !!(si.newCount | si.updatedCount | si.removedCount);
    })

    return syncInfos;
  }

}
