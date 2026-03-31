namespace CaseReport.Main {

    const COMPLEXITY = 'vtd_complexity';

    const COMPLEXITY_TYPES = {
        BASIC: 953180000,
        MODERATED: 953180001,
        ADVANCED: 953180002,
        EXTREME: 953180003,
    };


    export async function onLoad(executionContext: Xrm.Events.EventContext) {
        const formContext = executionContext.getFormContext();

        showCaseReportWarningNotification(executionContext);
    }

    function showCaseReportWarningNotification(executionContext: Xrm.Events.EventContext) {
        const formContext = executionContext.getFormContext();
        const complexityAttr = formContext.getAttribute(COMPLEXITY);
        if (!complexityAttr) {
            console.log("Atribute not found! Atribute Name Used: " + COMPLEXITY);
            return;
        }
        const complexityStatus = complexityAttr.getValue();
        formContext.ui.clearFormNotification('caseReportWarningNotification');

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
}