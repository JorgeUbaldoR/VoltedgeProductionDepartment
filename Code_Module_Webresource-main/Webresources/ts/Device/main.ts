namespace Device.main {

    // Logical name of the header Status Reason control
    const DEVICE_STATUS_REASON_HEADER_CONTROL = 'header_statuscode';

    // Logical name of the Purchase Date field
    const PURCHASE_DATE_ATTRIBUTE = 'vtd_purchasedate';

    // Logical name of the Installation Date field
    const INSTALLATION_DATE_ATTRIBUTE = 'vtd_installationdate';

    /**
     * Handles the form onLoad event for the Device entity.
     *
     * This function:
     * - disables the Status Reason header control for existing records;
     * - registers real-time validation handlers for Purchase Date and Installation Date;
     * - executes the date validation immediately on form load to detect invalid legacy data.
     *
     * @param executionContext - The Xrm.Events.EventContext object representing the execution context of the event.
     *
     * @example
     * const formContext = executionContext.getFormContext();
     * Device.main.onLoad(executionContext);
     */
    export async function onLoad(executionContext: Xrm.Events.EventContext): Promise<void> {
        const formContext = executionContext.getFormContext();
        const formType = formContext.ui.getFormType();

        if (formType !== Common.Helper.FORM_TYPES.CREATE) {
            const statusReasonControl = formContext.getControl(DEVICE_STATUS_REASON_HEADER_CONTROL) as Xrm.Controls.OptionSetControl;
            if (statusReasonControl) {
                statusReasonControl.setDisabled(true);
            }
        }

        formContext.getAttribute(PURCHASE_DATE_ATTRIBUTE)?.addOnChange(validateDates);
        formContext.getAttribute(INSTALLATION_DATE_ATTRIBUTE)?.addOnChange(validateDates);

        validateDates(executionContext);
    }

    /**
     * Validates the chronological consistency between Purchase Date and Installation Date.
     *
     * This function:
     * - retrieves both date fields from the current Device form;
     * - clears any previous validation notification on the Purchase Date field;
     * - compares both dates when they are present;
     * - shows a field-level validation error if the Purchase Date is later than the Installation Date.
     *
     * @param executionContext - The Xrm.Events.EventContext object representing the execution context of the event.
     *
     * @example
     * const formContext = executionContext.getFormContext();
     * validateDates(executionContext);
     */
    function validateDates(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();

        const purchaseDateAttr = formContext.getAttribute(PURCHASE_DATE_ATTRIBUTE);
        const installationDateAttr = formContext.getAttribute(INSTALLATION_DATE_ATTRIBUTE);

        const purchaseDateControl = formContext.getControl(PURCHASE_DATE_ATTRIBUTE) as Xrm.Controls.DateControl;

        if (!purchaseDateAttr || !installationDateAttr || !purchaseDateControl) return;

        const purchaseDate = purchaseDateAttr.getValue() as Date;
        const installationDate = installationDateAttr.getValue() as Date;

        const notificationId = "date_validation_error";

        purchaseDateControl.clearNotification(notificationId);

        if (purchaseDate && installationDate) {
            if (purchaseDate.getTime() > installationDate.getTime()) {
                purchaseDateControl.setNotification(
                    "The Purchase Date cannot be after the Installation Date.",
                    notificationId
                );
            }
        }
    }
}