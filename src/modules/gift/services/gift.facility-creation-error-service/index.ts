import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { GiftWorkPackageService } from '../gift.work-package.service';

interface FinallyHandlerParams {
  workPackageId?: number;
  facilityId: string;
  creationCatchError?: unknown;
}

/**
 * GIFT facility creation error service.
 * This service is responsible for handling errors during the GIFT facility creation process.
 */
@Injectable()
export class GiftFacilityCreationErrorService {
  constructor(
    private readonly giftWorkPackageService: GiftWorkPackageService,
    private readonly logger: PinoLogger,
  ) {
    this.giftWorkPackageService = giftWorkPackageService;
  }

  /**
   * "Finally function handler" for GIFT facility creation try/catch/finally pattern.
   * In the scenario that GIFT facility creation has errored (apart from createInitialFacility),
   *
   * This is responsible for:
   *
   * 1) If a work package ID is available - attempt to delete the GIFT "facility creation work package".
   *    a) Otherwise, GIFT could have an empty or incomplete work package.
   *    b) Additionally, retry attempts could fail because the facility has already been created (facility ID must be unique).
   *    c) NOTE: Extremely unlikely - it is possible for the "delete work package" endpoint to return a 409 Conflict status.
   *       - This means the status change is rejected by GIFT's state machine.
   *    d) The expected successful response from GIFT, for the "delete work package" endpoint, is 204 - No Content.
   *
   * 2) Logging and populating error messages from facility creation and the deletion response, for debugging purposes.
   *
   * @param {CreationFinallyHandlerParams} params - The parameters object.
   * @param {number} [params.workPackageId] - Work package ID (optional).
   * @param {string} params.facilityId - Facility ID.
   * @param {unknown} [params.creationCatchError] - Optional catch error thrown during facility creation.
   * @throws {Error} If work package deletion has an unexpected status code.
   * @throws {Error} If work package deletion throws an error.
   */
  async finallyHandler({ workPackageId, facilityId, creationCatchError = false }: FinallyHandlerParams) {
    if (workPackageId) {
      try {
        this.logger.info('Severe error creating a GIFT facility (finally handler) %s %s', facilityId, workPackageId);

        await this.giftWorkPackageService.delete(workPackageId, facilityId);
      } catch (deletionError) {
        this.logger.error('Severe error creating a GIFT facility %s and deleting GIFT work package %s', facilityId, workPackageId);

        const populatedCause = `Creation error: ${creationCatchError} \n Work package deletion error: ${deletionError}`;

        throw new Error(`Severe error creating a GIFT facility ${facilityId} and deleting work package ${workPackageId}`, { cause: populatedCause });
      }
    }

    // TODO: throw error here - no work package ID available?
  }
}
