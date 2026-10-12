declare module 'bcryptjs' {
  export function hash(value: string, saltOrRounds: number): Promise<string>;
  export function compare(value: string, encoded: string): Promise<boolean>;
}
