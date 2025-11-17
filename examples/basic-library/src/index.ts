/**
 * Example library function
 */
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

/**
 * Example class
 */
export class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }

  subtract(a: number, b: number): number {
    return a - b;
  }

  multiply(a: number, b: number): number {
    return a * b;
  }

  divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error('Division by zero');
    }
    return a / b;
  }
}

/**
 * Example type export
 */
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

/**
 * Example constant export
 */
export const VERSION = '1.0.0';