namespace Device.Ribbon{ 

    // Device Constants
    const DEVICE_TABLE = 'vtd_device';
    const DEVICE_STATUS_REASON = 'statuscode';
    const DEVICE_INITIATE_SERVICE_REQUEST = 'vtd_initiatereplacementservicerequest';

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
    const SERVICE_REQUEST_STATUS_REASON = 'statuscode';

    // Service Type Constants
    const SERVICE_TYPE_REPLACEMENT_ID = 'EB7F8D6F-8121-F111-8341-000D3A37C533';




    export async function OnInitiateServiceRequestClick(formContext: Xrm.FormContext) : Promise<void> {
        const query = '?$select=vtd_initiatereplacementservicerequest';
        const deviceId = formContext.data.entity.getId().replace(/[{}]/g, "");
        const entity = await Xrm.WebApi.retrieveRecord(DEVICE_TABLE,deviceId,query);
        const initiateServiceRequestValue = entity.vtd_initiatereplacementservicerequest ?? false;
    
        if(initiateServiceRequestValue === true){
            
            await Common.Helper.createAndShowAlertDialog('OK','A request to create a Replacement Service Request is currently being processed. This could take a few minutes to complete.','Replacement Service Request');
        
        }else{

            Xrm.Utility.showProgressIndicator('Creating Replacement Service Request...');

            await updateDeviceInitiateServiceRequestFlag(deviceId);
            await createReplacementServiceRequest(deviceId);
            await updateDeviceStatusReason(deviceId);

            Xrm.Utility.closeProgressIndicator();
            
            await formContext.data.refresh(false);
            await Common.Helper.createAndShowAlertDialog('OK','This Replacement Service Request will now be created, when applicable, to this device record. This could take a few minutes to complete.','Replacement Service Request');
        }
    }

    async function createReplacementServiceRequest(deviceId: string): Promise<void> {
        const newServiceRequestData = {
            'vtd_title': `Replacement Service Request for Device (${deviceId})`, 
            'vtd_deviceid@odata.bind': `/vtd_devices(${deviceId})`,
            'vtd_servicetypeid@odata.bind': `/vtd_servicetypes(${SERVICE_TYPE_REPLACEMENT_ID})` 
        };

        await Xrm.WebApi.createRecord(SERVICE_TABLE,newServiceRequestData);
    }

    async function updateDeviceStatusReason(deviceId: string): Promise<void>{
        const deviceUpdateData = {
            [DEVICE_STATUS_REASON]: DEVICE_STATUS_REASON_TYPES.AWAITS_REPLACEMENT_REQUEST_APPROVAL
        };

        await Xrm.WebApi.updateRecord(DEVICE_TABLE,deviceId,deviceUpdateData);
    }

    async function updateDeviceInitiateServiceRequestFlag(deviceId: string) : Promise<void>{
        const updatedRecord = {
            [DEVICE_INITIATE_SERVICE_REQUEST]: true,
        };

        await Xrm.WebApi.online.updateRecord(DEVICE_TABLE, deviceId, updatedRecord);
    }




    /**
     * Determines the visibility of the "Initiate Service Request" button in the Device form based on the form type.
     *
     * @param formContext - The Xrm.FormContext object representing the Characteristic form.
     * @returns True if the button should be visible; otherwise, false.
     *
     * @example
     * const formContext = Xrm.Page.getFormContext();
     * const isVisible = Characteristic.Ribbon.OnInitateServiceRequestButtonVisibility(formContext);
    */
    export function OnInitateServiceRequestButtonVisibility(formContext: Xrm.FormContext) : boolean {
        const formType = formContext.ui.getFormType();

        return formType !== 1;
    }
}