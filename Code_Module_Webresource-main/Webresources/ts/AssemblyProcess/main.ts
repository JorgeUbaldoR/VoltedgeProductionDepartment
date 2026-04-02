namespace AssemblyProcess.Main {
    
    const ASSEMBLY_PROCESS_STATUS_REASON = 'statuscode';

    const ASSEMBLY_PROCESS_STATUS_REASON_TYPES = {
        IDENTIFICATION: 953180001,
        EV_CHARGER_PRODUCTION: 953180002,
        BATTERY_PRODUCTION: 953180003,
        FINAL_ITEM: 953180004,
        CASE_REPORT: 953180005
    }

    const ASSEMBLY_PROCESS_BPF_STAGES = {
        IDENTIFICATION: 'de8206fc-e4b1-4b8d-8a01-67a03ab5c812',
        EV_CHARGER_PRODUCTION: 'cb6a6658-c10d-4a72-b1a6-89d2fa20b07b',
        BATTERY_PRODUCTION: 'e387fa6c-7e5f-4f37-b851-50da728e66ef',
        FINAL_ITEM: '9bd090f2-a1b5-4774-b27f-694e9f7906f1',
        CASE_REPORT: '5604d2b7-bc7f-4e0e-9370-e71d4a7c6631'
    }

    export function onLoad(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();
        
        const process = formContext.data.process;

        if (process) {
            process.addOnStageChange(onStageChange);
            
            handleBpfStageLogic(formContext);
        }
    }

    function onStageChange(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();
        handleBpfStageLogic(formContext);
    }

    function handleBpfStageLogic(formContext: Xrm.FormContext): void {
        const activeStage = formContext.data.process.getActiveStage();
        
        if (!activeStage) return;
        
        const stageId = activeStage.getId().replace(/[{}]/g, "").toLowerCase();

        formContext.ui.clearFormNotification('bpf_stage_notice');

        switch (stageId) {
            case ASSEMBLY_PROCESS_BPF_STAGES.IDENTIFICATION: 
                formContext.ui.setFormNotification("You are in the Design Stage.", "INFO", "bpf_stage_notice");
                formContext.getAttribute(ASSEMBLY_PROCESS_STATUS_REASON)?.setValue(ASSEMBLY_PROCESS_STATUS_REASON_TYPES.IDENTIFICATION);
                break;
            case ASSEMBLY_PROCESS_BPF_STAGES.EV_CHARGER_PRODUCTION: 
                formContext.ui.setFormNotification("You are in the EV Charger Production Stage.", "INFO", "bpf_stage_notice");
                formContext.getAttribute(ASSEMBLY_PROCESS_STATUS_REASON)?.setValue(ASSEMBLY_PROCESS_STATUS_REASON_TYPES.EV_CHARGER_PRODUCTION);
                break;
            case ASSEMBLY_PROCESS_BPF_STAGES.BATTERY_PRODUCTION: 
                formContext.ui.setFormNotification("You are in the Battery Production Stage.", "INFO", "bpf_stage_notice");
                formContext.getAttribute(ASSEMBLY_PROCESS_STATUS_REASON)?.setValue(ASSEMBLY_PROCESS_STATUS_REASON_TYPES.BATTERY_PRODUCTION);
                break;
            case ASSEMBLY_PROCESS_BPF_STAGES.FINAL_ITEM: 
                formContext.ui.setFormNotification("You are in the Final Item Stage.", "INFO", "bpf_stage_notice");
                formContext.getAttribute(ASSEMBLY_PROCESS_STATUS_REASON)?.setValue(ASSEMBLY_PROCESS_STATUS_REASON_TYPES.FINAL_ITEM);
                break;
            case ASSEMBLY_PROCESS_BPF_STAGES.CASE_REPORT: 
                formContext.ui.setFormNotification("You are in the Case Report Stage.", "INFO", "bpf_stage_notice");
                formContext.getAttribute(ASSEMBLY_PROCESS_STATUS_REASON)?.setValue(ASSEMBLY_PROCESS_STATUS_REASON_TYPES.CASE_REPORT);
                break;
            default:
                break;
        }

    }
}