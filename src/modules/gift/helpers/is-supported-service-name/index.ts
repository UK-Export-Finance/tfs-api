import { GIFT } from '@ukef/constants';

const { SERVICE_NAME } = GIFT;

/**
 * Check if a service name is supported
 * @param {String} serviceName: Service name
 * @returns {Boolean}
 */
export const isSupportedServiceName = (serviceName: string): boolean => (SERVICE_NAME[`${serviceName}`] ? true : false);
