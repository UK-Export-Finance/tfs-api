import { GIFT } from '@ukef/constants';

const { CONSUMER } = GIFT;

/**
 * Check if a consumer is supported
 * @param {string} consumer: Consumer
 * @returns {boolean}
 */
export const isSupportedConsumer = (consumer: string): boolean => Object.keys(CONSUMER).includes(consumer);
