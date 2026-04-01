
namespace CaseReport.Main {

    //Case Reports Constants
    const COMPLEXITY = 'vtd_complexity';
    const CASE_REPORT_TESTS_SUBGRID = 'subgrid_tests';

    const COMPLEXITY_TYPES = {
        BASIC: 953180000,
        MODERATED: 953180001,
        ADVANCED: 953180002,
        EXTREME: 953180003,
    };

    //Test Records Constants
    const TEST_RECORD_STATUS_REASON = 'statuscode';
    const TEST_RECORD_STATUS_REASON_TYPES = {
        PASSED: 1,
        FAILED: 953180003,
    }


    export async function onLoad(executionContext: Xrm.Events.EventContext) {
        const formContext = executionContext.getFormContext();

        const formType = formContext.ui.getFormType();

        if(formType === Common.Helper.FORM_TYPES.CREATE){
            return;
        }

        showCaseReportComplexityWarningNotification(formContext);

        const gridControl = formContext.getControl(CASE_REPORT_TESTS_SUBGRID) as Xrm.Controls.GridControl;

        if(gridControl){
            gridControl.addOnLoad(showCaseReportErrorNotificationWhenTestsFailed);
        }
    }



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
        }else{
             formContext.ui.setFormNotification(
                'High Complexity Report: This case requires a detailed quality standards review.',
                'WARNING',
                'caseReportWarningNotification',
            );
        }
    }



    function showCaseReportErrorNotificationWhenTestsFailed(executionContext: Xrm.Events.EventContext):void{
        const formContext = executionContext.getFormContext();

        formContext.ui.clearFormNotification('testRecordFailReasonNotification');

        const testsGridControl = formContext.getControl(CASE_REPORT_TESTS_SUBGRID) as Xrm.Controls.GridControl;

        if(!testsGridControl){
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

        
        if(totalFailedTests > 0){
            formContext.ui.setFormNotification(
                `A total of ${totalFailedTests} test(s) have failed. Please review the test records for details.`,
                'ERROR',
                'testRecordFailReasonNotification',
            );
        }
    }
}