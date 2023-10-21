import { Field } from "o1js";

export function fieldArrayToStringArray(fields: Field[]): string[] {
    return fields.map((field) => field.toString());
}
