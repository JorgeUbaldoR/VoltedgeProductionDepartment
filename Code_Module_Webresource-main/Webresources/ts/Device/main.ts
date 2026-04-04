namespace Device.main {

    // Device constants 
    const DEVICE_STATUS_REASON_HEADER_CONTROL = 'header_statuscode';

    export async function onLoad(executionContext: Xrm.Events.EventContext): Promise<void> {
        const formContext = executionContext.getFormContext();
        const formType = formContext.ui.getFormType();

        if(formType === Common.Helper.FORM_TYPES.CREATE) {
            return;
        }else{
            const statusReasonControl = formContext.getControl(DEVICE_STATUS_REASON_HEADER_CONTROL) as Xrm.Controls.OptionSetControl;
            if(!statusReasonControl) return;

            statusReasonControl.setDisabled(true);
        }
    }
}