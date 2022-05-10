import { Injectable } from '@nestjs/common';
import axios from "axios";
import {convertToDay, getStartOfDay, parseDate} from "../utils/date.utils";
import {InjectRepository} from "@nestjs/typeorm";
import { ILike, In, MoreThanOrEqual, Repository } from "typeorm";
import {compareLecture, copyLecture, hasLectureChanged, Lecture, lectureAttendType} from "../entities/lecture.entity";
import {parse as htmlParser} from "node-html-parser"
import { serviceLoggerGroup } from "../utils/loggers";
import * as moment from "moment";
import {LectureSyncInfo} from "../entities/lecture_sync_info.entity";
import {LectureChangeInfo} from "../entities/lecture_change_info.entity";
import {FieldChangeInfo, getChangeSet} from "../entities/field_change_info.entity";
import {NewLecture, RemovedLecture, UpdatedLecture} from "../entities/archived_lecture.entity";

interface lectureType {
  id?: number,
  date: Date,
  startTime: Date,
  endTime: Date,
  name: string,
  type: lectureAttendType,
  lecturer: string,
  rooms: string[],
  course: string,
  used?: boolean,
}

interface courseInfo {
  name: string,
  lectureUrl: string,
}

interface updateInfo {
  new: lectureType[],
  updated: lectureType[],
  removed: lectureType[],
}

const logger = serviceLoggerGroup.createLogger("Course Sync", {color: "blueBright"});

@Injectable()
export class RaplaService {

  constructor(@InjectRepository(Lecture) private readonly lectureRepo : Repository<Lecture>,
              @InjectRepository(NewLecture) private readonly newLectureRepo : Repository<NewLecture>,
              @InjectRepository(UpdatedLecture) private readonly updatedLectureRepo : Repository<UpdatedLecture>,
              @InjectRepository(RemovedLecture) private readonly removedLectureRepo : Repository<RemovedLecture>,
              @InjectRepository(LectureSyncInfo) private readonly syncRepo : Repository<LectureSyncInfo>,
              @InjectRepository(LectureChangeInfo) private readonly changeRepo : Repository<LectureChangeInfo>,
              @InjectRepository(FieldChangeInfo) private readonly fieldRepo : Repository<FieldChangeInfo>,
              ) {
  }

  async getLectures(course : string[], history = false) : Promise<Lecture[]> {
    return new Promise<Lecture[]>((async resolve => {
      if (history) {
        const lectures = await this.lectureRepo.find({
          where: {
            course: In(course),
          },
          order: {
            startTime: "ASC"
          },
        });
        lectures.forEach(l => l.lecturer = "");
        resolve(lectures);
        return;
      }
      const lectures = await this.lectureRepo.find({
        where: {
          course: In(course),
          date: MoreThanOrEqual(getStartOfDay())
        },
        order: {
          startTime: "ASC"
        },
      });
      lectures.forEach(l => l.lecturer = "");
      resolve(lectures);
      return;
    }));
  }

  getAllLectures(history = false) : Promise<Lecture[]> {
    return new Promise<Lecture[]>((async resolve => {
      if (history) {
        const lectures = await this.lectureRepo.find({
          order: {
            startTime: "ASC"
          },
        });
        lectures.forEach(l => l.lecturer = "");
        resolve(lectures);
        return;
      }
      const lectures = await this.lectureRepo.find({
        where: {
          date: MoreThanOrEqual(getStartOfDay())
        },
        order: {
          startTime: "ASC"
        },
      });
      lectures.forEach(l => l.lecturer = "");
      resolve(lectures);
      return;
    }));
  }

  getCourses() : Promise<string[]> {
    return new Promise<string[]>(((resolve, reject) => {
      this.lectureRepo.createQueryBuilder().select("course").distinct(true).getRawMany().then(res => {
        resolve(res.map(c => c.course).sort());
      }).catch(reject);
    }));
  }

  getCourseNames() : Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      this.lectureRepo.createQueryBuilder().select("course").distinct(true).getRawMany().then(res => {
        const courses = res.map(c => c.course);
        const courseSet = new Set<string>();
        courses.forEach(c => {
          const s = c.split("-")[1];
          const regex = /(\D+)\w+$/gm;
          let m;

          while ((m = regex.exec(s)) !== null) {
            if (m.index === regex.lastIndex) {
              regex.lastIndex++;
            }

            m.forEach((match, groupIndex) => {
              if (groupIndex === 1) courseSet.add(match);
            });
          }
        })
        resolve([...courseSet.keys()]);
      }).catch(reject);
    });
  }

  getLecturers() : Promise<string[]> {
    return new Promise<string[]>(((resolve, reject) => {
      this.lectureRepo.createQueryBuilder().select("lecturer").distinct(true).getRawMany().then(res => {
        resolve(res.map(c => c.lecturer).sort());
      }).catch(reject);
    }));
  }

  getLecturesOfLecturer(lecturer : string) : Promise<Lecture[]> {
    return new Promise<Lecture[]>((async resolve => {
      const lectures = await this.lectureRepo.find({
        where: {
          lecturer: ILike(`%${lecturer}%`),
          date: MoreThanOrEqual(getStartOfDay())
        },
        order: {
          startTime: "ASC"
        }
      });
      lectures.forEach(l => l.lecturer = "");
      resolve(lectures);
    }));

  }

  updateCourses() : Promise<void> {
    return new Promise<void>(((resolve, reject) => {
      const time = moment().valueOf();
      logger.debug("Stating course update");
      this.fetchAllLectures(process.env.RAPLA_API_REQUEST_LECTURES).then(res => {
        logger.debug(`new: ${res.new.length} | update: ${res.updated.length} | remove: ${res.removed.length}`);
        logger.info(`course update successfully completed (${moment().diff(time, "second", true)} s).`);
      }).catch(err => {
        logger.error("course update failed");

        logger.error(err);
      });
    }));
  }

  updateCourses_old() : Promise<void> {
    return new Promise<void>((resolve, reject) => {
      logger.debug("Starting course update");
      this.fetchCourses().then(res => {

        const run = () => {
          const course = res.pop();
          if (course) {
            this.fetchLectures(course).then(() => {
              setTimeout(run, 500);
              //logger.debug(`Updated course '${course.name}'`);
            }).catch(err => {
              logger.error(`Failed to load lectures of '${course.name}'`);
            })
          } else {
            logger.debug("Finished updating courseList");
            resolve();
          }
        }

        run();

      }).catch(err => {
        reject(err);
      })
    });
  }

  private async getFutureLectures(course?: string) {
    if (course === undefined) {
      return await this.lectureRepo.find({
        where: {
          date: MoreThanOrEqual(getStartOfDay()),
        }
      });
    }
    return await this.lectureRepo.find({
      where: {
        date: MoreThanOrEqual(getStartOfDay()),
        course: course.toUpperCase()
      }
    });
  }

  private async findLatestSyncInfo() : Promise<LectureSyncInfo | undefined> {
    return this.syncRepo.createQueryBuilder().select("*").orderBy({
      "LectureSyncInfo.startTime": "DESC"
    }).limit(1).getRawOne();
  }

  private fetchAllLectures(url : string) : Promise<updateInfo> {
    return new Promise<updateInfo>(async (resolve, reject) => {
      try {

        const lastSync = await this.findLatestSyncInfo();
        if (lastSync) {
          if (lastSync.status === "running" && Math.abs(moment(lastSync.startTime).diff(moment(), "second")) < 60 ) {
            logger.warn("Concurrent Sync execution stopping sync");
            return;
          }
        }

        const lectureSyncInfo = new LectureSyncInfo([], [], []);
        await this.syncRepo.save(lectureSyncInfo);

        axios.get(url, { responseType: 'arraybuffer' }).then(async buffer => {

          const rawData = buffer.data.toString('latin1');
          const lectures : lectureType[] = [];

          rawData.split("\n").forEach((line, i) => {
            if (i !== 0) {
              const parts : string[] = line.split(";");

              if (parts[1] && parts[2]) {

                const startTime = parseDate(parts[1]);
                const endTime = parseDate(parts[2]);

                const courses = parts[3] ? parts[3].split(",") : []
                const rooms = parts[5] ? parts[5].split(", ").map(r => r.trim()).sort() : [];
                const containsOnline = rooms.findIndex(s => s.toLowerCase().includes("online")) !== -1;
                const type : lectureAttendType = containsOnline ? rooms.length > 1 ? "HYBRID" : "ONLINE" : "PRESENCE";

                courses.forEach(course => {
                  const lecture: lectureType = {
                    date: convertToDay(startTime),
                    startTime,
                    endTime,
                    name: parts[0],
                    type,
                    lecturer: parts[4],
                    rooms,
                    course: course.toUpperCase().trim()
                  }
                  lectures.push(lecture);
                });

              }
            }
          });

          const tempLectures : lectureType[] = [];

          lectures
            .forEach((lc, i) => {
              if (!lc.used) {
                const similar = lectures.filter(llc => compareLecture(lc as Lecture, llc as Lecture));
                if (similar.length > 1) {
                  lc.rooms = lc.rooms = similar.flatMap(s => s.rooms.map(r => r.trim())).sort().filter(s => s.trim().length > 0);
                  lc.lecturer = lc.lecturer = similar.map(s => s.lecturer.trim()).sort().filter(s => s.trim().length > 0).join(", ");

                  similar.forEach(s => {
                    s.used = true;
                  });

                  tempLectures.push(lc);
                } else {
                  tempLectures.push(lc);
                }
              }
            });

          const oldLectures = await this.getFutureLectures();

          const toRemove : Set<Lecture> = new Set<Lecture>();
          const toAdd : Set<lectureType> = new Set<lectureType>();
          const toUpdate : Set<lectureType> = new Set<lectureType>();

          if (oldLectures.length > 0) {
            tempLectures.filter(l => l.date >= getStartOfDay())
              .filter(l => l.course.length > 0)
              .forEach((lc, i) => {
                const oldLecture = oldLectures.find(olc => compareLecture(olc, lc as Lecture));
                if (oldLecture) {
                  if (hasLectureChanged(oldLecture, lc as Lecture)) {

                    const archivedLecture = new NewLecture(oldLecture.date, oldLecture.startTime, oldLecture.endTime, oldLecture.name, oldLecture.type, oldLecture.lecturer, [...oldLecture.rooms], oldLecture.course);
                    const updateInfo = new LectureChangeInfo(archivedLecture, getChangeSet(oldLecture, lc as Lecture));

                    lectureSyncInfo.updatedLectures.push(updateInfo);
                    lc.id = oldLecture.id;
                    toUpdate.add(lc);

                    //logger.debug("----Updating----")
                    //logger.debug(oldLecture);
                    //logger.debug(lc);
                    //logger.debug("-------")
                  }
                } else {
                  toAdd.add(lc);
                }
              });

            oldLectures.forEach(ol => {
              const newLecture = tempLectures.find(olc => compareLecture(ol, olc as Lecture));
              if (!newLecture) {
                toRemove.add(ol);
              }
            });

            const updateInfo : updateInfo = {
              new: Array.from(toAdd),
              updated: Array.from(toUpdate),
              removed: Array.from(toRemove)
            }

            lectureSyncInfo.newLectures =     Array.from(toAdd   ).map(l => new NewLecture(l.date, l.startTime, l.endTime, l.name, l.type, l.lecturer, [...l.rooms], l.course));
            lectureSyncInfo.removedLectures = Array.from(toRemove).map(l => new RemovedLecture(l.date, l.startTime, l.endTime, l.name, l.type, l.lecturer, [...l.rooms], l.course));

            //logger.debug(`new: ${toAdd.size} | update: ${toUpdate.size} | remove: ${toRemove.size}`);

            try {
              await this.lectureRepo.remove(Array.from(toRemove), {chunk: 1000});
            } catch (e) {
              logger.error("Failed to remove Lectures.");
            }

            try {
              await this.lectureRepo.save(Array.from(toUpdate), {chunk: 1000});
            } catch (e) {
              logger.error("Failed to update Lectures.");
            }

            try {
              await this.lectureRepo.save(Array.from(toAdd), {chunk: 1000});
            } catch (e) {
              logger.error("Failed to save Lectures.");
            }

            lectureSyncInfo.endTime = new Date();
            this.saveLectureSyncInfo(lectureSyncInfo);

            resolve(updateInfo);

          } else {
            this.lectureRepo.save(tempLectures, {chunk: 1000}).then(newLectures => {
              //logger.info(`${courseInfo.name} Created ${newLectures.length} new lectures.`);
              //logger.debug(`new: ${tempLectures.length} | update: ${toUpdate.size} | remove: ${toRemove.size}`);

              lectureSyncInfo.endTime = new Date();
              this.saveLectureSyncInfo(lectureSyncInfo);

              resolve({
                new: tempLectures,
                updated: [],
                removed: []
              });
            }).catch(err => {
              logger.error("Failed to create new lectures");
              reject(err);
            })
          }

        });

      } catch (e) {
        reject(e);
      }
    });
  }

  private async saveLectureSyncInfo(syncInfo : LectureSyncInfo) {
    syncInfo.status = "saving";
    logger.debug(`Saving LectureSync Info`);
    const promises : Promise<any>[] = [];
    const ps2 : Promise<any>[] = [];

    if (syncInfo.removedLectures.length > 0) promises.push(this.removedLectureRepo.save(syncInfo.removedLectures, {chunk: 1000}));
    if (syncInfo.newLectures.length > 0) promises.push(this.newLectureRepo.save(syncInfo.newLectures, {chunk: 1000}));

    if (syncInfo.updatedLectures.length > 0) {
      ps2.push(this.updatedLectureRepo.save(syncInfo.updatedLectures.map(ul => ul.lecture), {chunk: 1000}));
      ps2.push(this.fieldRepo.save(syncInfo.updatedLectures.flatMap(ul => ul.changeInfos), {chunk: 1000}));
      await Promise.all(ps2);
      promises.push(this.changeRepo.save(syncInfo.updatedLectures, {chunk: 1000}));
    }
    await Promise.all(promises);
    syncInfo.status = "success";
    syncInfo.endTime = new Date();
    await this.syncRepo.save(syncInfo);
    logger.debug(`Saved sync info ${syncInfo.id}`);
  }

  private fetchLectures(courseInfo : courseInfo) : Promise<void> {

    return new Promise<void>(((resolve, reject) => {
      try {

        axios.get(courseInfo.lectureUrl, { responseType: 'arraybuffer' }).then(async buffer => {

          const rawData = buffer.data.toString('latin1');
          const lectures : lectureType[] = [];

          rawData.split("\n").forEach((line, i) => {
            if (i !== 0) {
              const parts : string[] = line.split(";");

              if (parts[1] && parts[2]) {

                const startTime = parseDate(parts[1]);
                const endTime = parseDate(parts[2]);

                const courses = parts[3] ? parts[3].split(",") : []
                const rooms = parts[5] ? parts[5].split(", ").map(r => r.trim()).sort() : [];
                const containsOnline = rooms.findIndex(s => s.toLowerCase().includes("online")) !== -1;
                const type : lectureAttendType = containsOnline ? rooms.length > 1 ? "HYBRID" : "ONLINE" : "PRESENCE";

                courses.forEach(course => {
                  const lecture: lectureType = {
                    date: convertToDay(startTime),
                    startTime,
                    endTime,
                    name: parts[0],
                    type,
                    lecturer: parts[4],
                    rooms,
                    course: course.toUpperCase().trim()
                  }
                  lectures.push(lecture);
                });

              }
            }
          });

          const tempLectures = [];

          lectures
            .filter(lc => lc.course === courseInfo.name.toUpperCase())
            .forEach(lc => {
            if (tempLectures.findIndex(l => compareLecture(l as Lecture, lc as Lecture)) === -1) {
              const similar = lectures.filter(llc => compareLecture(lc as Lecture, llc as Lecture));
              lc.rooms = lc.rooms = similar.flatMap(s => s.rooms);
              lc.lecturer = lc.lecturer = similar.map(s => s.lecturer).join(" , ");

              tempLectures.push(lc);
            }
          });

          const oldLectures = await this.getFutureLectures(courseInfo.name);

          const toRemove : Set<Lecture> = new Set<Lecture>();
          const toAdd : Set<lectureType> = new Set<lectureType>();
          const toUpdate : Set<lectureType> = new Set<lectureType>();

          if (oldLectures.length > 0) {
            tempLectures.filter(l => l.date.valueOf() >= getStartOfDay().valueOf())
              .filter(l => l.course.length > 0)
              .forEach((lc, i) => {
                const oldLecture = oldLectures.find(olc => compareLecture(olc, lc as Lecture));
                if (oldLecture) {
                  if (hasLectureChanged(oldLecture, lc as Lecture)) {
                    lc.id = oldLecture.id;
                    toUpdate.add(lc);
                    console.log("----Updating----")
                    console.log(oldLecture);
                    console.log(lc);
                    console.log("-------")
                  }
                } else {
                  toAdd.add(lc);
                }
              });

            oldLectures.forEach(ol => {
              const newLecture = tempLectures.find(olc => compareLecture(ol, olc as Lecture));
              if (!newLecture) {
                toRemove.add(ol);
              }
            });

            logger.debug(`${courseInfo.name} \t new: ${toAdd.size} | update: ${toUpdate.size} | remove: ${toRemove.size}`);

            try {
              await this.lectureRepo.remove(Array.from(toRemove));
            } catch (e) {
              logger.error("Failed to remove Lectures.");
            }

            try {
              await this.lectureRepo.save(Array.from(toUpdate));
            } catch (e) {
              logger.error("Failed to update Lectures.");
            }

            try {
              await this.lectureRepo.save(Array.from(toAdd));
            } catch (e) {
              logger.error("Failed to save Lectures.");
            }

            resolve();

          } else {
            this.lectureRepo.save(tempLectures).then(newLectures => {
              //logger.info(`${courseInfo.name} Created ${newLectures.length} new lectures.`);
              logger.debug(`${courseInfo.name} \t new: ${tempLectures.length} | update: ${toUpdate.size} | remove: ${toRemove.size}`);
              resolve();
            }).catch(err => {
              logger.error("Failed to create new lectures");
              reject(err);
            })
          }

        });

      } catch (e) {
        reject(e);
      }
    }));

  }

  private fetchCourses() : Promise<courseInfo[]> {
    return new Promise<courseInfo[]>(async (resolve, reject) => {
      logger.debug("Fetching Courses");
      try {
        const domRoot = htmlParser((await axios.get(process.env.RAPLA_API_REQUEST_COURSE_LIST, { responseType: 'text' })).data);
        const htmlDOMtr = (domRoot.querySelectorAll('table'))[1].querySelectorAll('tr');

        const courseInfos : courseInfo[] = [];

        htmlDOMtr.forEach(element => {

          const tdArray = element.querySelectorAll('td');
          const courseObject : courseInfo = {
            name: tdArray[0].innerText,
            lectureUrl: tdArray[2].querySelector("a").getAttribute("href")
          }

          courseInfos.push(courseObject);
        });

        logger.debug(`Found ${courseInfos.length} courses.`);

        resolve(courseInfos);
      } catch (e) {
        reject(e);
      }
    });
  }

}
