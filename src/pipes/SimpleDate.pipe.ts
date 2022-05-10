import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class SimpleDatePipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata) {

    const simpleDateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(\d{4})$/;

    if (!simpleDateRegex.test(value)) {
      throw new BadRequestException("The Date format is invalid, it should be 'DD-MM-YYYY'");
    }

    let m;
    const date = new Date();
    const parts : number[] = [];

    if ((m = simpleDateRegex.exec(value)) !== null) {
      // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        parts.push(match);
      });
    }
    parts.shift();
    parts.map(p => parseInt(String(p)));
    date.setFullYear(parts[2], parts[1] - 1, parts[0]);
    date.setHours(0, 0, 0, 0);

    return date;
  }
}
