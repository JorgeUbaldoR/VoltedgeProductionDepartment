namespace Replacement.Main {

    // Logical name of the Replacement table
    const REPLACEMENT_TABLE = 'vtd_replacement';

    // Logical name of the flag indicating whether the record was automatically created
    const REPLACEMENT_AUTOMATICALLY_CREATED_FLAG = 'vtd_automaticallycreated';

    // Logical name of the Old Device lookup field
    const REPLACEMENT_SERVICE_REQUEST_OLD_DEVICE_LOOKUP = 'vtd_olddeviceid';

    // Logical name of the parent Service Request lookup field
    const REPLACEMENT_SERVICE_REQUEST_LOOKUP = 'vtd_servicerequestid';

    // Logical name of the flag indicating whether the record is being viewed in popup context
    const REPLACEMENT_ON_POP_VIEW = 'vtd_onpopupview';

    /**
     * Handles the form onLoad event for the Replacement entity.
     *
     * This function adapts the form behaviour according to the current access context:
     * - in Create mode, it locks the auto-mapped lookup fields to preserve traceability in the automated flow;
     * - in Edit mode, it shows a one-time informational notification for automatically created records
     *   and silently updates the related tracking flags in Dataverse.
     *
     * @param executionContext - The Xrm.Events.EventContext object representing the execution context of the event.
     *
     * @example
     * const formContext = executionContext.getFormContext();
     * Replacement.Main.onLoad(executionContext);
     */
    export async function onLoad(executionContext: Xrm.Events.EventContext): Promise<void> {
        const formContext = executionContext.getFormContext();
        const formType = formContext.ui.getFormType();

        const automaticallyCreatedValue =
            formContext.getAttribute(REPLACEMENT_AUTOMATICALLY_CREATED_FLAG)?.getValue() ?? false;
        const onPopupViewValue =
            formContext.getAttribute(REPLACEMENT_ON_POP_VIEW)?.getValue() ?? false;

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