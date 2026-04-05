namespace Device.Ribbon {

    // Logical name of the Device table
    const DEVICE_TABLE = 'vtd_device';

    // Logical name of the Device status reason field
    const DEVICE_STATUS_REASON = 'statuscode';

    // Logical name of the flag indicating whether a replacement service request has already been initiated
    const DEVICE_INITIATE_SERVICE_REQUEST = 'vtd_initiatereplacementservicerequest';

    // Logical name of the Device unique code field
    const DEVICE_UNIQUE_CODE = 'vtd_dxuniquecode';

    // Possible status reason values for Device records
    const DEVICE_STATUS_REASON_TYPES = {
        IN_OPERATION: 1,
        UNDER_SCRUTINY: 953180002,
        RESERVED: 953180001,
        AWAITING_APPROVAL: 953180003,
        AWAITS_REPLACEMENT_REQUEST_APPROVAL: 953180004,
    };

    // Logical name of the Service Request table
    const SERVICE_TABLE = 'vtd_servicerequest';

    // Logical name of the Service Type lookup field in Service Request
    const SERVICE_REQUEST_SERVICE_TYPE = 'vtd_servicetypeid';

    // Logical name of the Service Request title field
    const SERVICE_REQUEST_TITLE = 'vtd_title';

    // Logical name of the Device lookup field in Service Request
    const SERVICE_REQUEST_DEVICE = 'vtd_deviceid';

    // Logical name of the flag indicating whether the Service Request was automatically created
    const SERVICE_REQUEST_AUTOMATICALLY_CREATED_FLAG = 'vtd_automaticallycreatedflag';

    // Logical name of the flag indicating whether the Service Request is being viewed in popup context
    const SERVICE_REQUEST_ON_POP_VIEW = 'vtd_onpopupview';

    // Logical name of the Service Type table
    const SERVICE_TYPE_TABLE = 'vtd_servicetype';

    // Identifier of the Replacement Service Type record
    const SERVICE_TYPE_REPLACEMENT_ID = '74FF69DA-D52E-F111-88B4-000D3A308996';

    // Logical name of the Replacement table
    const REPLACEMENT_TABLE = 'vtd_replacement';

    // Logical name of the Replacement description field
    const REPLACEMENT_DESCRIPTION = 'vtd_description';

    // Logical name of the Replacement reason field
    const REPLACEMENT_REASON = 'vtd_replacementreason';

    // Logical name of the parent Service Request lookup field in Replacement
    const REPLACEMENT_SERVICE_REQUEST_LOOKUP = 'vtd_servicerequestid';

    // Logical name of the Old Device lookup field in Replacement
    const REPLACEMENT_SERVICE_REQUEST_NEW_DEVICE_LOOKUP = 'vtd_olddeviceid';

    // Logical name of the Replacement status reason field
    const REPLACEMENT_STATUS_REASON = 'statuscode';

    // Logical name of the flag indicating whether the Replacement was automatically created
    const REPLACEMENT_AUTOMATICALLY_CREATED_FLAG = 'vtd_automaticallycreated';

    // Logical name of the flag indicating whether the Replacement is being viewed in popup context
    const REPLACEMENT_ON_POP_VIEW = 'vtd_onpopupview';

    // Possible status reason values for Replacement records
    const REPLACEMENT_STATUS_REASON_TYPES = {
        AWAITING_APPROVAL: 953180002,
    };

    /**
     * Handles the click event of the custom Ribbon button used to initiate the replacement process.
     *
     * This function:
     * - verifies whether a replacement request has already been initiated for the current Device;
     * - opens a pre-filled Service Request popup;
     * - opens a pre-filled Replacement popup after the Service Request is created;
     * - updates the Device status and initiation flag if both steps are completed successfully;
     * - performs cleanup if the Service Request is created but the Replacement is cancelled.
     *
     * @param formContext - The Xrm.FormContext object representing the current Device form.
     * @returns A Promise that resolves when the replacement initiation process is completed.
     *
     * @example
     * const formContext = executionContext.getFormContext();
     * await Device.Ribbon.OnInitiateServiceRequestClick(formContext);
     */
    export async function OnInitiateServiceRequestClick(formContext: Xrm.FormContext): Promise<void> {
        const query = '?$select=vtd_initiatereplacementservicerequest';
        const deviceId = formContext.data.entity.getId().replace(/[{}]/g, "");
        const entity = await Xrm.WebApi.retrieveRecord(DEVICE_TABLE, deviceId, query);
        const initiateServiceRequestValue = entity.vtd_initiatereplacementservicerequest ?? false;

        if (initiateServiceRequestValue === true) {

            await Common.Helper.createAndShowAlertDialog('OK', 'Already exists a request to create a Replacement Service Request.', 'Replacement Service Request');

        } else {

            const createdServiceRequestId = await openServiceRequestPopup(formContext, deviceId);

            if (createdServiceRequestId) {

                const replacementCreated = await openReplacementCreationPopup(formContext, createdServiceRequestId);

                if (replacementCreated) {

                    Xrm.Utility.showProgressIndicator('Updating Device...');

                    await updateDeviceInitiateServiceRequestFlag(deviceId);
                    await updateDeviceStatusReason(formContext, deviceId);

                    Xrm.Utility.closeProgressIndicator();

                    await formContext.data.refresh(false);
                    await Common.Helper.createAndShowAlertDialog('OK', 'Service Request and Replacement scheduled successfully!', 'Replacement Service Request');
                } else {
                    Xrm.Utility.showProgressIndicator('Cancelling process and cleaning up...');

                    await Xrm.WebApi.deleteRecord(SERVICE_TABLE, createdServiceRequestId);

                    Xrm.Utility.closeProgressIndicator();

                    await Common.Helper.createAndShowAlertDialog(
                        'Understood',
                        'The operation was cancelled. The Service Request was discarded because the Replacement was not completed.',
                        'Process Cancelled'
                    );
                }

            } else {
                return;
            }
        }
    }

    /**
     * Opens a modal popup to create a pre-filled Service Request for the current Device.
     *
     * This function prepares the Service Request context by:
     * - setting a generated title and descriptive text;
     * - mapping the current Device lookup;
     * - assigning the Replacement Service Type;
     * - marking the record as automatically created and opened in popup view.
     *
     * @param formContext - The Xrm.FormContext object representing the current Device form.
     * @param deviceId - The identifier of the Device associated with the new Service Request.
     * @returns A Promise resolving to the newly created Service Request ID, or null if the popup is cancelled or fails.
     *
     * @example
     * const serviceRequestId = await openServiceRequestPopup(formContext, deviceId);
     */
    async function openServiceRequestPopup(formContext: Xrm.FormContext, deviceId: string): Promise<string | null> {
        const deviceUniqueCode = formContext.getAttribute(DEVICE_UNIQUE_CODE)?.getValue() ?? deviceId;
        const currentUserName = Xrm.Utility.getGlobalContext().userSettings.userName;

        const formParameters: any = {
            [SERVICE_REQUEST_TITLE]: `Replacement Service Request for Device (${deviceUniqueCode})`,
            'vtd_problemdescription': `A Replacement Service Request has been initiated triggered by user ${currentUserName} for device ${deviceUniqueCode}. Please review the device details and update the service request with any additional information as necessary`,
            'vtd_solution': `Replacement Service Request for Device (${deviceUniqueCode})`,

            [SERVICE_REQUEST_DEVICE]: [{
                id: deviceId,
                entityType: DEVICE_TABLE,
                name: deviceUniqueCode
            }],

            [SERVICE_REQUEST_SERVICE_TYPE]: [{
                id: SERVICE_TYPE_REPLACEMENT_ID,
                entityType: SERVICE_TYPE_TABLE
            }],

            [SERVICE_REQUEST_AUTOMATICALLY_CREATED_FLAG]: true,
            [SERVICE_REQUEST_ON_POP_VIEW]: true

        };

        const pageInput: Xrm.Navigation.PageInputEntityRecord = {
            pageType: "entityrecord",
            entityName: SERVICE_TABLE,
            data: formParameters
        };

        const navigationOptions: Xrm.Navigation.NavigationOptions = {
            target: 2,
            width: { value: 80, unit: "%" }
        };

        try {
            const result = await Xrm.Navigation.navigateTo(pageInput, navigationOptions);

            if (result && result.savedEntityReference && result.savedEntityReference.length > 0) {
                return result.savedEntityReference[0].id.replace(/[{}]/g, "");
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }

    }

    /**
     * Opens a modal popup to create a pre-filled Replacement record linked to the created Service Request.
     *
     * This function prepares the Replacement context by:
     * - associating the parent Service Request;
     * - associating the current Device as the old device;
     * - setting default description, reason, status, and automation flags.
     *
     * @param formContext - The Xrm.FormContext object representing the current Device form.
     * @param serviceRequestId - The identifier of the Service Request created in the previous step.
     * @returns A Promise resolving to true if the Replacement is created successfully, or false if cancelled or failed.
     *
     * @example
     * const created = await openReplacementCreationPopup(formContext, serviceRequestId);
     */
    async function openReplacementCreationPopup(formContext: Xrm.FormContext, serviceRequestId: string): Promise<boolean> {
        const deviceId = formContext.data.entity.getId().replace(/[{}]/g, "");
        const deviceUniqueCode = formContext.getAttribute(DEVICE_UNIQUE_CODE)?.getValue() ?? "Device";

        const formParameters: any = {
            [REPLACEMENT_SERVICE_REQUEST_LOOKUP]: [{
                id: serviceRequestId,
                entityType: SERVICE_TABLE
            }],

            [REPLACEMENT_SERVICE_REQUEST_NEW_DEVICE_LOOKUP]: [{
                id: deviceId,
                entityType: DEVICE_TABLE,
                name: deviceUniqueCode
            }],

            [REPLACEMENT_DESCRIPTION]: `Replacement task for device ${deviceUniqueCode}.`,
            [REPLACEMENT_STATUS_REASON]: REPLACEMENT_STATUS_REASON_TYPES.AWAITING_APPROVAL,
            [REPLACEMENT_REASON]: `Replacement initiated due to issues found in device ${deviceUniqueCode}. Please review the associated Service Request for more details.`,
            [REPLACEMENT_AUTOMATICALLY_CREATED_FLAG]: true,
            [REPLACEMENT_ON_POP_VIEW]: true
        };

        const pageInput: Xrm.Navigation.PageInputEntityRecord = {
            pageType: "entityrecord",
            entityName: REPLACEMENT_TABLE,
            data: formParameters
        };

        const navigationOptions: Xrm.Navigation.NavigationOptions = {
            target: 2,
            width: { value: 70, unit: "%" }
        };

        try {
            const result = await Xrm.Navigation.navigateTo(pageInput, navigationOptions);

            if (result && result.savedEntityReference && result.savedEntityReference.length > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Erro ao abrir pop-up de Replacement: ", error);
            return false;
        }
    }

    /**
     * Updates the Device status reason to indicate that it is awaiting replacement request approval.
     *
     * @param formContext - The Xrm.FormContext object representing the current Device form.
     * @param deviceId - The identifier of the Device to update.
     * @returns A Promise that resolves when the Device status is updated.
     *
     * @example
     * await updateDeviceStatusReason(formContext, deviceId);
     */
    async function updateDeviceStatusReason(formContext: Xrm.FormContext, deviceId: string): Promise<void> {
        const deviceUpdateData = {
            [DEVICE_STATUS_REASON]: DEVICE_STATUS_REASON_TYPES.AWAITS_REPLACEMENT_REQUEST_APPROVAL
        };

        await Xrm.WebApi.updateRecord(DEVICE_TABLE, deviceId, deviceUpdateData);
    }

    /**
     * Updates the Device flag that indicates a replacement service request has already been initiated.
     *
     * @param deviceId - The identifier of the Device to update.
     * @returns A Promise that resolves when the initiation flag is updated.
     *
     * @example
     * await updateDeviceInitiateServiceRequestFlag(deviceId);
     */
    async function updateDeviceInitiateServiceRequestFlag(deviceId: string): Promise<void> {
        const updatedRecord = {
            [DEVICE_INITIATE_SERVICE_REQUEST]: true,
        };

        await Xrm.WebApi.online.updateRecord(DEVICE_TABLE, deviceId, updatedRecord);
    }

    /**
     * Determines the visibility of the "Initiate Service Request" Ribbon button in the Device form.
     *
     * The button is hidden when:
     * - the form is in Create mode;
     * - the Device status is already set to "Awaits Replacement Request Approval".
     *
     * @param formContext - The Xrm.FormContext object representing the Device form.
     * @returns True if the button should be visible; otherwise, false.
     *
     * @example
     * const visible = Device.Ribbon.OnInitateServiceRequestButtonVisibility(formContext);
     */
    export function OnInitateServiceRequestButtonVisibility(formContext: Xrm.FormContext): boolean {
        const formType = formContext.ui.getFormType();

        if (formType === 1) {
            return false;
        }

        const deviceStatus = formContext.getAttribute(DEVICE_STATUS_REASON);

        if (!deviceStatus) {
            return false;
        }

        const deviceStatusValue = deviceStatus.getValue();

        return deviceStatusValue !== DEVICE_STATUS_REASON_TYPES.AWAITS_REPLACEMENT_REQUEST_APPROVAL;
    }
}