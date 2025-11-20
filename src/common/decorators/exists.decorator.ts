import { registerDecorator, ValidationOptions } from 'class-validator';
import { ExistsConstraint } from '../validators/exists.constraint';

export function Exists(
  entity: Function | string,
  column: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [entity, column],
      validator: ExistsConstraint,
    });
  };
}
