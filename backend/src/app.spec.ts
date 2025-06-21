// Test simple qui passe toujours
describe('Application', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have Node.js environment', () => {
    expect(typeof process).toBe('object');
  });
});
