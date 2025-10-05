import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { DataSource } from 'typeorm';

@ValidatorConstraint({ async: true })
@Injectable()
export class ExistsConstraint implements ValidatorConstraintInterface {
  constructor(private readonly dataSource: DataSource) {}

  async validate(value: any, args: ValidationArguments) {
    const [entity, column] = args.constraints as [Function | string, string];

    if (!value) return false;

    const repo = this.dataSource.getRepository(entity);
    const record = await repo.findOne({
      select: [column],
      where: { [column]: value },
    });

    return !!record;
  }

  defaultMessage(args: ValidationArguments) {
    const [entity, column] = args.constraints as [Function | string, string];
    return `${args.property} does not exist in ${entity} on column ${column}`;
  }
}
