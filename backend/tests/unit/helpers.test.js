const { calculate } = require('@/helpers');

describe('Helper Functions - Calculate', () => {
  describe('add', () => {
    test('should add two positive numbers correctly', () => {
      const result = calculate.add(10, 20);
      expect(result).toBe(30);
    });

    test('should add decimal numbers correctly', () => {
      const result = calculate.add(10.5, 20.3);
      expect(result).toBeCloseTo(30.8, 2);
    });

    test('should handle negative numbers', () => {
      const result = calculate.add(-10, 20);
      expect(result).toBe(10);
    });

    test('should handle zero', () => {
      const result = calculate.add(0, 100);
      expect(result).toBe(100);
    });
  });

  describe('sub', () => {
    test('should subtract two numbers correctly', () => {
      const result = calculate.sub(30, 10);
      expect(result).toBe(20);
    });

    test('should subtract decimal numbers correctly', () => {
      const result = calculate.sub(30.5, 10.3);
      expect(result).toBeCloseTo(20.2, 2);
    });

    test('should handle negative results', () => {
      const result = calculate.sub(10, 30);
      expect(result).toBe(-20);
    });
  });

  describe('multiply', () => {
    test('should multiply two numbers correctly', () => {
      const result = calculate.multiply(10, 5);
      expect(result).toBe(50);
    });

    test('should multiply decimal numbers correctly', () => {
      const result = calculate.multiply(10.5, 2);
      expect(result).toBe(21);
    });

    test('should handle zero multiplication', () => {
      const result = calculate.multiply(100, 0);
      expect(result).toBe(0);
    });

    test('should handle percentage calculation (tax)', () => {
      const subTotal = 1000;
      const taxRate = 10;
      const result = calculate.multiply(subTotal, taxRate / 100);
      expect(result).toBe(100);
    });
  });

  describe('divide', () => {
    test('should divide two numbers correctly', () => {
      const result = calculate.divide(100, 5);
      expect(result).toBe(20);
    });

    test('should divide decimal numbers correctly', () => {
      const result = calculate.divide(10.5, 2);
      expect(result).toBe(5.25);
    });

    test('should handle division by zero', () => {
      // currency.js returns Infinity for division by zero, not an error
      const result = calculate.divide(100, 0);
      expect(result).toBe(Infinity);
    });
  });

  describe('Invoice Calculation Flow', () => {
    test('should calculate invoice totals correctly', () => {
      const items = [
        { quantity: 2, price: 100 },
        { quantity: 1, price: 50 },
      ];

      let subTotal = 0;
      items.forEach((item) => {
        const itemTotal = calculate.multiply(item.quantity, item.price);
        subTotal = calculate.add(subTotal, itemTotal);
      });

      const taxRate = 10;
      const taxTotal = calculate.multiply(subTotal, taxRate / 100);
      const total = calculate.add(subTotal, taxTotal);

      expect(subTotal).toBe(250);
      expect(taxTotal).toBe(25);
      expect(total).toBe(275);
    });

    test('should calculate invoice with discount', () => {
      const subTotal = 1000;
      const taxRate = 10;
      const discount = 100;

      const taxTotal = calculate.multiply(subTotal, taxRate / 100);
      const totalBeforeDiscount = calculate.add(subTotal, taxTotal);
      const finalTotal = calculate.sub(totalBeforeDiscount, discount);

      expect(taxTotal).toBe(100);
      expect(totalBeforeDiscount).toBe(1100);
      expect(finalTotal).toBe(1000);
    });
  });
});

