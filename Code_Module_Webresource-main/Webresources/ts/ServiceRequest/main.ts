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
        const recordId = formContext.data.entity.getId().replace(/[{}]/g, "");

        // ADICIONADO: Limpar a notificação no início
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

        } else if (onPopupViewValue) {

            const dataToUpdate = {
                [SERVICE_REQUEST_ON_POP_VIEW]: false
            };

            await Xrm.WebApi.updateRecord(SERVICE_REQUEST_TABLE, recordId, dataToUpdate);
            formContext.getAttribute(SERVICE_REQUEST_ON_POP_VIEW)?.setValue(false);

        } else if (automaticallyCreatedValue && !onPopupViewValue) {
            
            Common.Helper.showFormNotification(formContext, 'This record has automatically populated data, please review and edit it.', "INFO", "aviso_readonly");

            const dataToUpdate = {
                [SERVICE_REQUEST_AUTOMATICALLY_CREATED_FLAG]: false
            };

            await Xrm.WebApi.updateRecord(SERVICE_REQUEST_TABLE, recordId, dataToUpdate);
            formContext.getAttribute(SERVICE_REQUEST_AUTOMATICALLY_CREATED_FLAG)?.setValue(false);
        }
    }
}