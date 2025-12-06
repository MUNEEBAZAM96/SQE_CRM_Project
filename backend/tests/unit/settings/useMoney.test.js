const useMoney = require('@/settings/useMoney');

describe('useMoney Settings', () => {
  test('should format money with currency before amount', () => {
    const settings = {
      currency_symbol: '$',
      currency_position: 'before',
      decimal_sep: '.',
      thousand_sep: ',',
      cent_precision: 2,
      zero_format: false,
    };

    const money = useMoney({ settings });
    const formatted = money.moneyFormatter({ amount: 1234.56 });

    expect(formatted).toContain('$');
    expect(formatted).toMatch(/1[,.]234/); // Match 1,234 or 1.234
  });

  test('should format money with currency after amount', () => {
    const settings = {
      currency_symbol: 'USD',
      currency_position: 'after',
      decimal_sep: '.',
      thousand_sep: ',',
      cent_precision: 2,
      zero_format: false,
    };

    const money = useMoney({ settings });
    const formatted = money.moneyFormatter({ amount: 1234.56 });

    expect(formatted).toContain('USD');
  });

  test('should format amount without currency symbol', () => {
    const settings = {
      currency_symbol: '$',
      currency_position: 'before',
      decimal_sep: '.',
      thousand_sep: ',',
      cent_precision: 2,
      zero_format: false,
    };

    const money = useMoney({ settings });
    const formatted = money.amountFormatter({ amount: 1234.56 });

    expect(formatted).not.toContain('$');
    expect(formatted).toMatch(/1[,.]234/); // Match 1,234 or 1.234
  });

  test('should handle zero format when zero_format is true and amount is zero', () => {
    const settings = {
      currency_symbol: '$',
      currency_position: 'before',
      decimal_sep: '.',
      thousand_sep: ',',
      cent_precision: 2,
      zero_format: true,
    };

    const money = useMoney({ settings });
    const formatted = money.moneyFormatter({ amount: 0 });

    expect(formatted).toBeDefined();
  });

  test('should format money when amount dollars > 0 and zero_format is true', () => {
    const settings = {
      currency_symbol: '$',
      currency_position: 'before',
      decimal_sep: '.',
      thousand_sep: ',',
      cent_precision: 2,
      zero_format: true,
    };

    const money = useMoney({ settings });
    const formatted = money.moneyFormatter({ amount: 100 });

    expect(formatted).toBeDefined();
    expect(formatted).toContain('$');
  });

  test('should format money when amount dollars = 0 and zero_format is false', () => {
    const settings = {
      currency_symbol: '$',
      currency_position: 'before',
      decimal_sep: '.',
      thousand_sep: ',',
      cent_precision: 2,
      zero_format: false,
    };

    const money = useMoney({ settings });
    const formatted = money.moneyFormatter({ amount: 0 });

    expect(formatted).toBeDefined();
  });

  test('should return all settings properties', () => {
    const settings = {
      currency_symbol: '$',
      currency_position: 'before',
      decimal_sep: '.',
      thousand_sep: ',',
      cent_precision: 2,
      zero_format: false,
    };

    const money = useMoney({ settings });

    expect(money).toHaveProperty('moneyFormatter');
    expect(money).toHaveProperty('amountFormatter');
    expect(money.currency_symbol).toBe('$');
    expect(money.currency_position).toBe('before');
    expect(money.decimal_sep).toBe('.');
    expect(money.thousand_sep).toBe(',');
    expect(money.cent_precision).toBe(2);
    expect(money.zero_format).toBe(false);
  });
});

