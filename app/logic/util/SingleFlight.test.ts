import { describe, it, expect, vi } from 'vitest';
import { SingleFlight } from './SingleFlight';

describe('SingleFlight', () => {
  it('should suppress duplicate concurrent calls', async () => {
    const sf = new SingleFlight();

    // 1. Create a mock function that simulates a slow DB call
    const mockTask = vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50)); // Simulating latency
      return 'success';
    });

    // 2. Fire off multiple calls concurrently for the same key
    const results = await Promise.all([
      sf.do('test-key', mockTask),
      sf.do('test-key', mockTask),
      sf.do('test-key', mockTask),
    ]);

    // 3. Assertions
    // All callers should receive the same result
    expect(results).toEqual(['success', 'success', 'success']);

    // The underlying function should have only been executed ONCE
    expect(mockTask).toHaveBeenCalledTimes(1);
  });

  it('should allow a new call after the previous one finishes', async () => {
    const sf = new SingleFlight();
    const mockTask = vi.fn().mockResolvedValue('done');

    // First call
    await sf.do('key1', mockTask);

    // Second call for the same key (after completion)
    await sf.do('key1', mockTask);

    // Should have been called twice because the first one was finished and removed from Map
    expect(mockTask).toHaveBeenCalledTimes(2);
  });

  it('should handle errors correctly', async () => {
    const sf = new SingleFlight();
    const mockErrorTask = vi.fn().mockRejectedValue(new Error('DB Down'));

    // Both concurrent calls should catch the same error
    const promises = [
      sf.do('error-key', mockErrorTask),
      sf.do('error-key', mockErrorTask),
    ];

    await expect(Promise.all(promises)).rejects.toThrow('DB Down');
    expect(mockErrorTask).toHaveBeenCalledTimes(1);
  });
});
