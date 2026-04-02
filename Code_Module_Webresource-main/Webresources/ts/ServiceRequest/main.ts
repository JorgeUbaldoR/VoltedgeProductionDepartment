namespace ServiceRequest.Main {

    const SERVICE_REQUEST_TABLE = 'vtd_servicerequest';
    const SERVICE_REQUEST_SERVICE_TYPE_LOOKUP = 'vtd_servicetypeid';
    const SERVICE_REQUEST_REQUESTOR_LOOKUP = 'vtd_requestorid';
    const SERVICE_REQUEST_AUTOMATICALLY_CREATED_FLAG = 'vtd_automaticallycreatedflag';

    // Adicionei o 'async' e a 'Promise<void>' aqui
    export async function onLoad(executionContext: Xrm.Events.EventContext): Promise<void> {
        const formContext = executionContext.getFormContext();
        
        const formType = formContext.ui.getFormType();

        if (formType === Common.Helper.FORM_TYPES.CREATE) {
            
            const serviceAttribute = formContext.getAttribute(SERVICE_REQUEST_SERVICE_TYPE_LOOKUP);
            const requestorAttribute = formContext.getAttribute(SERVICE_REQUEST_REQUESTOR_LOOKUP);

            if(serviceAttribute && serviceAttribute.getValue() !== null) {
                (formContext.getControl(SERVICE_REQUEST_SERVICE_TYPE_LOOKUP) as Xrm.Controls.LookupControl)?.setDisabled(true);
            }

            if(requestorAttribute && requestorAttribute.getValue() !== null) {
                (formContext.getControl(SERVICE_REQUEST_REQUESTOR_LOOKUP) as Xrm.Controls.LookupControl)?.setDisabled(true);
            }

        } else {
            await Common.Helper.createAndShowToastNotification('This record has automatically populated data, please review and edit it.', 4);
            
            const recordId = formContext.data.entity.getId().replace(/[{}]/g, "");

            const dataToUpdate = {
                [SERVICE_REQUEST_AUTOMATICALLY_CREATED_FLAG]: false
            };

            await Xrm.WebApi.updateRecord(SERVICE_REQUEST_TABLE, recordId, dataToUpdate);
        }
    }
}