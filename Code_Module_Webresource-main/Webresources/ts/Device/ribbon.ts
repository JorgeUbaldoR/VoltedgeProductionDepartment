namespace Device.Ribbon {

    // Device Constants
    const DEVICE_TABLE = 'vtd_device';
    const DEVICE_STATUS_REASON = 'statuscode';
    const DEVICE_INITIATE_SERVICE_REQUEST = 'vtd_initiatereplacementservicerequest';
    const DEVICE_UNIQUE_CODE = 'vtd_dxuniquecode';

    const DEVICE_STATUS_REASON_TYPES = {
        IN_OPERATION: 1,
        UNDER_SCRUTINY: 953180002,
        RESERVED: 953180001,
        AWAITING_APPROVAL: 953180003,
        AWAITS_REPLACEMENT_REQUEST_APPROVAL: 953180004,
    };

    // Service Constants
    const SERVICE_TABLE = 'vtd_servicerequest';
    const SERVICE_REQUEST_SERVICE_TYPE = 'vtd_servicetypeid';
    const SERVICE_REQUEST_TITLE = 'vtd_title';
    const SERVICE_REQUEST_DEVICE = 'vtd_deviceid';
    const SERVICE_REQUEST_REQUESTOR_LOOKUP = 'vtd_requestorid';
    const SERVICE_REQUEST_AUTOMATICALLY_CREATED_FLAG = 'vtd_automaticallycreatedflag';

    // Service Type Constants
    const SERVICE_TYPE_TABLE = 'vtd_servicetype'; 
    const SERVICE_TYPE_REPLACEMENT_ID = '74FF69DA-D52E-F111-88B4-000D3A308996';

    // Replacement Constants
    const REPLACEMENT_TABLE = 'vtd_replacement';
    const REPLACEMENT_DESCRIPTION = 'vtd_description';
    const REPLACEMENT_REASON = 'vtd_replacementreason';
    const REPLACEMENT_SERVICE_REQUEST_LOOKUP = 'vtd_servicerequestid';
    const REPLACEMENT_SERVICE_REQUEST_NEW_DEVICE_LOOKUP = 'vtd_olddeviceid';
    const REPLACEMENT_STATUS_REASON = 'statuscode';
    const REPLACEMENT_AUTOMATICALLY_CREATED_FLAG = 'vtd_automaticallycreated';

    const REPLACEMENT_STATUS_REASON_TYPES = {
        AWAITING_APPROVAL: 953180002,
    }

    //========================== FUNCTIONS ==========================

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
                }
                
            } else {
                return;
            }
        }
    }

    async function openServiceRequestPopup(formContext: Xrm.FormContext, deviceId: string): Promise<string | null> {
        const deviceUniqueCode = formContext.getAttribute(DEVICE_UNIQUE_CODE)?.getValue() ?? deviceId;
        const currentUserName = Xrm.Utility.getGlobalContext().userSettings.userName;
        const currentUserId = Xrm.Utility.getGlobalContext().userSettings.userId.replace(/[{}]/g, "").toLowerCase();

        // Pré-preenchimento dos campos para o novo Service Request
        const formParameters: any = {
            [SERVICE_REQUEST_TITLE]: `Replacement Service Request for Device (${deviceUniqueCode})`,
            'vtd_problemdescription': `A Replacement Service Request has been initiated triggered by user ${currentUserName} for device ${deviceUniqueCode}. Please review the device details and update the service request with any additional information as necessary`,
            'vtd_solution': `Replacement Service Request for Device (${deviceUniqueCode})`,
            
            // Preenchimento do Lookup do Device
            [SERVICE_REQUEST_DEVICE]: [{
                id: deviceId,
                entityType: DEVICE_TABLE,
                name: deviceUniqueCode 
            }],
            
            // Preenchimento do Lookup do Service Type
            [SERVICE_REQUEST_SERVICE_TYPE]: [{
                id: SERVICE_TYPE_REPLACEMENT_ID,
                entityType: SERVICE_TYPE_TABLE 
            }],

            [SERVICE_REQUEST_AUTOMATICALLY_CREATED_FLAG]: true

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
            [REPLACEMENT_AUTOMATICALLY_CREATED_FLAG]: true
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
                return true; // Replacement criado com sucesso!
            } else {
                return false; // Utilizador cancelou a criação do Replacement
            }
        } catch (error) {
            console.error("Erro ao abrir pop-up de Replacement: ", error);
            return false;
        }
    }

    async function updateDeviceStatusReason(formContext: Xrm.FormContext, deviceId: string): Promise<void> {
        const deviceUpdateData = {
            [DEVICE_STATUS_REASON]: DEVICE_STATUS_REASON_TYPES.AWAITS_REPLACEMENT_REQUEST_APPROVAL
        };

        await Xrm.WebApi.updateRecord(DEVICE_TABLE, deviceId, deviceUpdateData);
    }

    async function updateDeviceInitiateServiceRequestFlag(deviceId: string): Promise<void> {
        const updatedRecord = {
            [DEVICE_INITIATE_SERVICE_REQUEST]: true,
        };

        await Xrm.WebApi.online.updateRecord(DEVICE_TABLE, deviceId, updatedRecord);
    }

    /**
     * Determines the visibility of the "Initiate Service Request" button in the Device form based on the form type.
     *
     * @param formContext - The Xrm.FormContext object representing the Device form.
     * @returns True if the button should be visible; otherwise, false.
    */
    export function OnInitateServiceRequestButtonVisibility(formContext: Xrm.FormContext): boolean {
        const formType = formContext.ui.getFormType();

        // Early return for Create form, as the button should not be visible when creating a new record
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