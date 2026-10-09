/**
 * Returns a promise that resolves after the specified number of milliseconds.
 * @param {number} milliseconds - The number of milliseconds to wait.
 * @returns {Promise<void>} A promise that resolves after the specified delay.
 */
export const waitFor = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
