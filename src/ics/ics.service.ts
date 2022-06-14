import { Injectable } from '@nestjs/common';
import { RaplaService } from "../rapla/rapla.service";
import ical, { ICalCalendar } from "ical-generator";

@Injectable()
export class IcsService {

  constructor(private raplaService : RaplaService) {

  }

  generateIcs(courses: string[]) : Promise<ICalCalendar> {
    return new Promise<any>(async (resolve, reject) => {
      const lectures = await this.raplaService.getLectures(courses, true);

      const calendar = ical({
        name: `${courses.join(", ")} Vorlesungen | DHBW Mosbach`,
        url: ``,
      });

      lectures.forEach(l => {
        calendar.createEvent({
          id: l.id,
          start: l.startTime,
          end: l.endTime,
          summary: `${l.name}`,
          location: l.rooms.join(", ")
        })
      })

      resolve(calendar);

    });
  }

}
