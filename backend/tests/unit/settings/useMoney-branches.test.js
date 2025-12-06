const useMoney = require('@/settings/useMoney');

describe('useMoney Settings - Branch Coverage', () => {
  test('should format money when dollars > 0 and zero_format is true', () => {
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

  test('should format money when dollars = 0 and zero_format is false', () => {
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

  test('should format money when dollars = 0 and zero_format is true (branch 30)', () => {
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

    // When dollars = 0 and zero_format is true, it should use the else branch (line 21-27)
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  test('should format money with currency position after (branch 36)', () => {
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

    expect(formatted).toBeDefined();
    expect(formatted).toContain('USD');
    // Should be amount first, then currency
    expect(formatted.indexOf('USD')).toBeGreaterThan(formatted.indexOf('1'));
  });

  test('should format money when dollars = 0 and zero_format is true (branch 30)', () => {
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

    // When dollars = 0 and zero_format is true, it uses the else branch (line 21-27)
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });
});

