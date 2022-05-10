import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class DefaultBooleanPipe implements PipeTransform {

  constructor(private defaultValue : boolean) {
  }

  transform(value: any, metadata: ArgumentMetadata) {
    return this.parseBool(value);
  }

  parseBool = (string : string) => {
    if (!string) return this.defaultValue;
    switch(string.toLowerCase().trim()){
      case "true": case "yes": case "1": return true;
      case "false": case "no": case "0": case null: return false;
      default: return this.defaultValue;
    }
  }
}
