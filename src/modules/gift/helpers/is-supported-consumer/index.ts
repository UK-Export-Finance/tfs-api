import { GIFT } from '@ukef/constants';

const { CONSUMER } = GIFT;

/**
 * Check if a consumer is supported
 * @param {String} consumer: Consumer
 * @returns {Boolean}
 */
export const isSupportedConsumer = (consumer: string): boolean => Boolean(CONSUMER[`${consumer}`]);
