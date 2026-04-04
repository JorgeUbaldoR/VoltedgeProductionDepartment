namespace Replacement.Main {

    const REPLACEMENT_TABLE = 'vtd_replacement';
    const REPLACEMENT_AUTOMATICALLY_CREATED_FLAG = 'vtd_automaticallycreated';
    const REPLACEMENT_SERVICE_REQUEST_OLD_DEVICE_LOOKUP = 'vtd_olddeviceid';
    const REPLACEMENT_SERVICE_REQUEST_LOOKUP = 'vtd_servicerequestid';
    const REPLACEMENT_ON_POP_VIEW = 'vtd_onpopupview';

    export async function onLoad(executionContext: Xrm.Events.EventContext): Promise<void> {
        const formContext = executionContext.getFormContext();
        const formType = formContext.ui.getFormType();
        
        const automaticallyCreatedValue = formContext.getAttribute(REPLACEMENT_AUTOMATICALLY_CREATED_FLAG)?.getValue() ?? false;
        const onPopupViewValue = formContext.getAttribute(REPLACEMENT_ON_POP_VIEW)?.getValue() ?? false;

        formContext.ui.clearFormNotification("aviso_readonly");

        if (formType === Common.Helper.FORM_TYPES.CREATE) {
            (formContext.getControl(REPLACEMENT_SERVICE_REQUEST_OLD_DEVICE_LOOKUP) as Xrm.Controls.LookupControl)?.setDisabled(true);
            (formContext.getControl(REPLACEMENT_SERVICE_REQUEST_LOOKUP) as Xrm.Controls.LookupControl)?.setDisabled(true);
            return;
        } 

        const recordId = formContext.data.entity.getId().replace(/[{}]/g, "");
        let dataToUpdate: any = {};
        let needsUpdate = false;

        if (onPopupViewValue) {
            dataToUpdate[REPLACEMENT_ON_POP_VIEW] = false;
            formContext.getAttribute(REPLACEMENT_ON_POP_VIEW)?.setValue(false);
            needsUpdate = true;
        }

        if (automaticallyCreatedValue && !onPopupViewValue) {
            Common.Helper.showFormNotification(
                formContext, 
                'This record has automatically populated data, please review and edit it.', 
                "INFO", 
                "aviso_readonly"
            );

            dataToUpdate[REPLACEMENT_AUTOMATICALLY_CREATED_FLAG] = false;
            formContext.getAttribute(REPLACEMENT_AUTOMATICALLY_CREATED_FLAG)?.setValue(false);
            needsUpdate = true;
        }

        if (needsUpdate) {
            try {
                await Xrm.WebApi.updateRecord(REPLACEMENT_TABLE, recordId, dataToUpdate);
            } catch (error) {
                console.error("Erro ao limpar flags do Replacement:", error);
            }
        }
    }
}