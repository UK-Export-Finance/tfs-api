import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { GiftWorkPackageService } from '../gift.work-package.service';

interface FinallyHandlerParams {
  workPackageId?: number;
  facilityId: string;
  creationCatchError?: unknown;
}

interface HandleFinallyHandlerErrorParams {
  facilityId: string;
  workPackageId?: number;
  creationCatchError: unknown;
  deletionError: unknown;
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
   * @param {FinallyHandlerParams} params - The parameters object.
   * @param {number} [params.workPackageId] - Work package ID (optional).
   * @param {string} params.facilityId - Facility ID.
   * @param {unknown} [params.creationCatchError] - Optional catch error thrown during facility creation.
   * @throws {Error} If work package deletion has an unexpected status code.
   * @throws {Error} If work package deletion throws an error.
   * @throws {Error} If no work package ID is provided.
   */
  async finallyHandler({ workPackageId, facilityId, creationCatchError = false }: FinallyHandlerParams) {
    this.logger.info('Error creating a GIFT facility (finally handler) %s %s', facilityId, workPackageId);

    if (!workPackageId) {
      this.handleFinallyHandlerError({
        facilityId,
        creationCatchError,
        deletionError: new Error(`Severe error creating a GIFT facility ${facilityId} and deleting work package. No workPackageId available`),
      });
    }

    try {
      await this.giftWorkPackageService.delete(workPackageId, facilityId);
    } catch (deletionError) {
      this.handleFinallyHandlerError({
        facilityId,
        workPackageId,
        creationCatchError,
        deletionError,
      });
    }
  }

  /**
   * Handles errors that occur during the finally handler.
   * @param {HandleFinallyHandlerErrorParams} params - The parameters object.
   * @param {number} params.facilityId - The facility ID.
   * @param {number} [params.workPackageId] - The work package ID (optional).
   * @param {unknown} params.creationCatchError - The error thrown during facility creation.
   * @param {unknown} params.deletionError - The error thrown during work package deletion.
   * @throws {Error} Throws an error with a detailed message and cause.
   */
  private handleFinallyHandlerError({ facilityId, workPackageId, creationCatchError, deletionError }: HandleFinallyHandlerErrorParams): never {
    this.logger.error('Severe error creating a GIFT facility %s and deleting GIFT facility work package %s %o', facilityId, workPackageId, deletionError);

    const populatedCause = {
      creationCatchError,
      deletionError,
    };

    if (!workPackageId) {
      throw new Error(`Severe error creating a GIFT facility ${facilityId} and deleting work package. No workPackageId available`, {
        cause: populatedCause,
      });
    }

    throw new Error(`Severe error creating a GIFT facility ${facilityId} and deleting GIFT facility work package ${workPackageId}`, {
      cause: populatedCause,
    });
  }
}
