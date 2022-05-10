import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class DefaultIntPipe implements PipeTransform {

  constructor(private defaultValue : number) {
  }

  transform(value: any, metadata: ArgumentMetadata) {
    let num = parseInt(value);
    if (isNaN(num)) num = this.defaultValue;
    return num;
  }
}
