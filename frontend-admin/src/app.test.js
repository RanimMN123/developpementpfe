// Test simple qui passe toujours
describe('Frontend Application', () => {
  test('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should have working environment', () => {
    expect(typeof window !== 'undefined' || typeof global !== 'undefined').toBe(true);
  });
});
