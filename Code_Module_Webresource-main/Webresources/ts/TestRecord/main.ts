namespace TestRecord.Main {

    // Logical name of the Test Record status reason field
    const TEST_RECORD_STATUS_REASON = 'statuscode';

    // Logical name of the field that stores the failure reason
    const TEST_RECORD_FAILED_REASON = 'vtd_failreason';

    // Possible status reason values for Test Records
    const TEST_RECORD_STATUS_REASON_TYPES = {
        PASSED: 1,
        FAILED: 953180003,
    };

    /**
     * Handles the form onLoad event for the Test Record entity.
     * 
     * This function initializes the dynamic behaviour of the form by:
     * - applying visibility and requirement rules to the failure reason field;
     * - displaying a notification when the Test Record status is Failed.
     *
     * @param executionContext - The Xrm.Events.EventContext object representing the execution context of the event.
     *
     * @example
     * const formContext = executionContext.getFormContext();
     * TestRecord.Main.onLoad(executionContext);
     */
    export function onLoad(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();
        const statusValue = formContext.getAttribute(TEST_RECORD_STATUS_REASON)?.getValue();

        handleVisibilityBussinesRules(formContext, statusValue);
        showTestRecordStatusNotification(formContext, statusValue);
    }

    /**
     * Handles the onChange event of the Test Record status reason field.
     * 
     * This function updates the visibility and requirement state of the failure reason field
     * whenever the status changes.
     *
     * @param executionContext - The Xrm.Events.EventContext object representing the execution context of the event.
     *
     * @example
     * const formContext = executionContext.getFormContext();
     * TestRecord.Main.onStatusReasonChange(executionContext);
     */
    export function onStatusReasonChange(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();
        const statusValue = formContext.getAttribute(TEST_RECORD_STATUS_REASON)?.getValue();

        handleVisibilityBussinesRules(formContext, statusValue);
    }

    /**
     * Applies visibility and requirement rules to the failure reason field based on the current Test Record status.
     * 
     * If the status is Failed:
     * - the failure reason field is shown;
     * - the failure reason field becomes required.
     * 
     * If the status is not Failed:
     * - the failure reason field is hidden;
     * - its value is cleared;
     * - the field is no longer required.
     *
     * @param formContext - The Xrm.FormContext object representing the current form.
     * @param statusValue - The numeric value of the current Test Record status reason.
     *
     * @example
     * handleVisibilityBussinesRules(formContext, 953180003);
     */
    function handleVisibilityBussinesRules(formContext: Xrm.FormContext, statusValue: number): void {
        const failReasonControl = formContext.getControl(TEST_RECORD_FAILED_REASON) as Xrm.Controls.StandardControl;
        const failReasonAttribute = formContext.getAttribute(TEST_RECORD_FAILED_REASON);

        if (statusValue === TEST_RECORD_STATUS_REASON_TYPES.FAILED) {
            failReasonControl?.setVisible(true);
            failReasonAttribute?.setRequiredLevel('required');
        } else {
            failReasonControl?.setVisible(false);
            failReasonAttribute?.setValue(null);
            failReasonAttribute?.setRequiredLevel('none');
        }
    }

    /**
     * Displays a form-level notification when the Test Record is marked as Failed.
     * 
     * The notification is only shown for existing records (not in Create mode).
     * If the status is Failed and a failure reason exists, the form displays an ERROR notification
     * containing the failure reason.
     *
     * @param formContext - The Xrm.FormContext object representing the current form.
     * @param statusValue - The numeric value of the current Test Record status reason.
     *
     * @example
     * showTestRecordStatusNotification(formContext, 953180003);
     */
    function showTestRecordStatusNotification(formContext: Xrm.FormContext, statusValue: number): void {
        const formType = formContext.ui.getFormType();

        if (formType === Common.Helper.FORM_TYPES.CREATE) {
            return;
        }

        formContext.ui.clearFormNotification('testRecordFailReasonNotification');

        if (statusValue !== TEST_RECORD_STATUS_REASON_TYPES.FAILED) {
            return;
        } else if (statusValue === TEST_RECORD_STATUS_REASON_TYPES.FAILED) {
            const faileReasonValue = formContext.getAttribute(TEST_RECORD_FAILED_REASON)?.getValue();

            if (faileReasonValue) {
                formContext.ui.setFormNotification(
                    'Test Record Failed: ' + faileReasonValue,
                    'ERROR',
                    'testRecordFailReasonNotification',
                );
            }
        }
    }
}