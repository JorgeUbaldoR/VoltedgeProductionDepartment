namespace ServiceRequest.Main {

    const SERVICE_REQUEST_TABLE = 'vtd_servicerequest';
    const SERVICE_REQUEST_SERVICE_TYPE_LOOKUP = 'vtd_servicetypeid';
    const SERVICE_REQUEST_REQUESTOR_LOOKUP = 'vtd_requestorid';
    const SERVICE_REQUEST_AUTOMATICALLY_CREATED_FLAG = 'vtd_automaticallycreatedflag';
    const SERVICE_REQUEST_ON_POP_VIEW = 'vtd_onpopupview';

    export async function onLoad(executionContext: Xrm.Events.EventContext): Promise<void> {
        const formContext = executionContext.getFormContext();
        const formType = formContext.ui.getFormType();
        
        const automaticallyCreatedValue = formContext.getAttribute(SERVICE_REQUEST_AUTOMATICALLY_CREATED_FLAG)?.getValue() ?? false;
        const onPopupViewValue = formContext.getAttribute(SERVICE_REQUEST_ON_POP_VIEW)?.getValue() ?? false;
        
        formContext.ui.clearFormNotification("aviso_readonly");

        if (formType === Common.Helper.FORM_TYPES.CREATE) {
            const serviceAttribute = formContext.getAttribute(SERVICE_REQUEST_SERVICE_TYPE_LOOKUP);
            const requestorAttribute = formContext.getAttribute(SERVICE_REQUEST_REQUESTOR_LOOKUP);

            if(serviceAttribute && serviceAttribute.getValue() !== null) {
                (formContext.getControl(SERVICE_REQUEST_SERVICE_TYPE_LOOKUP) as Xrm.Controls.LookupControl)?.setDisabled(true);
            }

            if(requestorAttribute && requestorAttribute.getValue() !== null) {
                (formContext.getControl(SERVICE_REQUEST_REQUESTOR_LOOKUP) as Xrm.Controls.LookupControl)?.setDisabled(true);
            }
            
            return; 
        } 

        const recordId = formContext.data.entity.getId().replace(/[{}]/g, "");
        let dataToUpdate: any = {};
        let needsUpdate = false;

        if (onPopupViewValue) {
            dataToUpdate[SERVICE_REQUEST_ON_POP_VIEW] = false;
            formContext.getAttribute(SERVICE_REQUEST_ON_POP_VIEW)?.setValue(false);
            needsUpdate = true;
        }

        if (automaticallyCreatedValue && !onPopupViewValue) {
            Common.Helper.showFormNotification(
                formContext, 
                'This record has automatically populated data, please review and edit it.', 
                "INFO", 
                "aviso_readonly"
            );

            dataToUpdate[SERVICE_REQUEST_AUTOMATICALLY_CREATED_FLAG] = false;
            formContext.getAttribute(SERVICE_REQUEST_AUTOMATICALLY_CREATED_FLAG)?.setValue(false);
            needsUpdate = true;
        }

        if (needsUpdate) {
            try {
                await Xrm.WebApi.updateRecord(SERVICE_REQUEST_TABLE, recordId, dataToUpdate);
            } catch (error) {
            }
        }
    }
}