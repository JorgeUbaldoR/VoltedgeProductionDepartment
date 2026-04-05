namespace CaseReport.Main {

    // Logical name of the Case Report complexity field
    const COMPLEXITY = 'vtd_complexity';

    // Name of the subgrid that displays related Test Records
    const CASE_REPORT_TESTS_SUBGRID = 'subgrid_tests';

    // Possible complexity values for Case Reports
    const COMPLEXITY_TYPES = {
        BASIC: 953180000,
        MODERATED: 953180001,
        ADVANCED: 953180002,
        EXTREME: 953180003,
    };

    // Logical name of the Test Record status reason field
    const TEST_RECORD_STATUS_REASON = 'statuscode';

    // Possible status reason values for Test Records
    const TEST_RECORD_STATUS_REASON_TYPES = {
        PASSED: 1,
        FAILED: 953180003,
    };

    /**
     * Handles the form onLoad event for the Case Report entity.
     *
     * This function:
     * - prevents execution in Create mode;
     * - displays a warning notification when the Case Report complexity is high;
     * - registers a subgrid onLoad handler to detect failed related Test Records.
     *
     * @param executionContext - The Xrm.Events.EventContext object representing the execution context of the event.
     *
     * @example
     * const formContext = executionContext.getFormContext();
     * CaseReport.Main.onLoad(executionContext);
     */
    export async function onLoad(executionContext: Xrm.Events.EventContext) {
        const formContext = executionContext.getFormContext();

        const formType = formContext.ui.getFormType();

        if (formType === Common.Helper.FORM_TYPES.CREATE) {
            return;
        }

        showCaseReportComplexityWarningNotification(formContext);

        const gridControl = formContext.getControl(CASE_REPORT_TESTS_SUBGRID) as Xrm.Controls.GridControl;

        if (gridControl) {
            gridControl.addOnLoad(showCaseReportErrorNotificationWhenTestsFailed);
        }
    }

    /**
     * Displays a warning notification when the Case Report complexity is classified as high.
     *
     * This function:
     * - retrieves the current complexity value;
     * - clears any previous complexity notification;
     * - shows a WARNING notification when the complexity is Advanced or Extreme.
     *
     * @param formContext - The Xrm.FormContext object representing the current form.
     *
     * @example
     * showCaseReportComplexityWarningNotification(formContext);
     */
    function showCaseReportComplexityWarningNotification(formContext: Xrm.FormContext): void {

        const complexityAttribute = formContext.getAttribute(COMPLEXITY);

        if (!complexityAttribute) {
            return;
        }

        const complexityStatus = complexityAttribute.getValue();
        formContext.ui.clearFormNotification('caseReportWarningNotification');

        if (!complexityStatus) {
            return;
        }

        if (complexityStatus === COMPLEXITY_TYPES.BASIC || complexityStatus === COMPLEXITY_TYPES.MODERATED) {
            return;
        } else {
            formContext.ui.setFormNotification(
                'High Complexity Report: This case requires a detailed quality standards review.',
                'WARNING',
                'caseReportWarningNotification',
            );
        }
    }

    /**
     * Displays an error notification on the Case Report form when one or more related Test Records have failed.
     *
     * This function:
     * - clears any previous failed-test notification;
     * - reads the rows currently loaded in the related Test Records subgrid;
     * - counts how many related Test Records are marked as Failed;
     * - shows an ERROR notification summarizing the number of failed tests.
     *
     * @param executionContext - The Xrm.Events.EventContext object representing the execution context of the subgrid event.
     *
     * @example
     * showCaseReportErrorNotificationWhenTestsFailed(executionContext);
     */
    function showCaseReportErrorNotificationWhenTestsFailed(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();

        formContext.ui.clearFormNotification('testRecordFailReasonNotification');

        const testsGridControl = formContext.getControl(CASE_REPORT_TESTS_SUBGRID) as Xrm.Controls.GridControl;

        if (!testsGridControl) {
            return;
        }

        const grid = testsGridControl.getGrid();
        const rows = grid.getRows();

        let totalFailedTests = 0;

        rows.forEach(row => {
            const statusAttribute = row.data.entity.attributes.get(TEST_RECORD_STATUS_REASON);

            if (statusAttribute && statusAttribute.getValue() === TEST_RECORD_STATUS_REASON_TYPES.FAILED) {
                totalFailedTests++;
            }
        });

        if (totalFailedTests > 0) {
            formContext.ui.setFormNotification(
                `A total of ${totalFailedTests} test(s) have failed. Please review the test records for details.`,
                'ERROR',
                'testRecordFailReasonNotification',
            );
        }
    }
}