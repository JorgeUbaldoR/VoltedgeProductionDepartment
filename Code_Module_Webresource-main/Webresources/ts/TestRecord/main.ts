namespace TestRecord.Main{

    const TEST_RECORD_STATUS_REASON = 'statuscode';
    const TEST_RECORD_FAILED_REASON = 'vtd_failreason';

    const TEST_RECORD_STATUS_REASON_TYPES = {
        PASSED: 1,
        FAILED: 953180003,
    }

    export function onStatusReasonChange(executionContext: Xrm.Events.EventContext):void{
        const formContext = executionContext.getFormContext();
        const statusValue = formContext.getAttribute(TEST_RECORD_STATUS_REASON)?.getValue();

        handleVisibilityBussinesRules(formContext,statusValue);
    }

    function handleVisibilityBussinesRules(formContext:Xrm.FormContext, statusValue: number):void{

        const failReasonControl = formContext.getControl(TEST_RECORD_FAILED_REASON) as Xrm.Controls.StandardControl;
        const failReasonAttribute = formContext.getAttribute(TEST_RECORD_FAILED_REASON);

        if(statusValue === TEST_RECORD_STATUS_REASON_TYPES.FAILED){
            failReasonControl?.setVisible(true);
        } else {
            failReasonControl?.setVisible(false);
            failReasonAttribute?.setValue(null);
        }

    }
}