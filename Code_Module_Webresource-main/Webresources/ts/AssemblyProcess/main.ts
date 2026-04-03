namespace AssemblyProcess.Main {
    
    const ASSEMBLY_PROCESS_STATUS_REASON = 'statuscode';
    const INDUSTRIAL_PLANT_ATTRIBUTE = "vtd_industrialplantid";
    const PRODUCT_TYPE_ATTRIBUTE = "vtd_producttypeid";
    const PRODUCT_TYPE_BPF_CONTROL = "header_process_vtd_producttypeid";
    const ASSEMBLY_LINE_BPF_CONTROL = "header_process_vtd_assemblylineid";

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

    const FORM_TABS = {
        GENERAL: 'tab_general' 
    };

    const FORM_SECTIONS = {
        IDENTIFICATION: "tab_general_section_information",
        EV_CHARGER_PRODUCTION: "tab_general_section_production",
        BATTERY_PRODUCTION: "tab_general_section_production",
        FINAL_ITEM: "tab_general_section_finalitem",
        CASE_REPORT: "tab_general_section_casereport"
    };

    //Product Type Constants
    const PRODUCT_TYPE_TABLE = 'vtd_producttype';

    //Assembly Line Constants
    const ASSEMBLY_LINE_TABLE = 'vtd_assemblyline';
    const ASSEMBLY_LINE_INDUSTRIAL_PLANT_LOOKUP = 'vtd_industrialplantid';
    const ASSEMBLY_LINE_PRODUCT_TYPE_LOOKUP = 'vtd_producttypeid';

    const PRODUCT_TYPES_IDS = {
        BATTERY: 'A1E500F9-8828-F111-8341-000D3A5B9779',
        EV_CHARGER: '96E85327-8928-F111-8341-000D3A5B9779'
    }

    export function onLoad(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();
        
        const process = formContext.data.process;

        if (process) {
            process.addOnStageChange(onStageChange);
            handleBpfStageLogic(formContext);
        }

        applyProductTypeFilter(formContext);
        applyAssemblyLinePlantFilter(formContext);


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
        
        hideAllStageSections(formContext);

        const tab = formContext.ui.tabs.get(FORM_TABS.GENERAL);

        switch (stageId) {
            case ASSEMBLY_PROCESS_BPF_STAGES.IDENTIFICATION: 
                formContext.getAttribute(ASSEMBLY_PROCESS_STATUS_REASON)?.setValue(ASSEMBLY_PROCESS_STATUS_REASON_TYPES.IDENTIFICATION);
                tab?.sections.get(FORM_SECTIONS.IDENTIFICATION)?.setVisible(true);
                break;

            case ASSEMBLY_PROCESS_BPF_STAGES.EV_CHARGER_PRODUCTION: 
                formContext.getAttribute(ASSEMBLY_PROCESS_STATUS_REASON)?.setValue(ASSEMBLY_PROCESS_STATUS_REASON_TYPES.EV_CHARGER_PRODUCTION);
                tab?.sections.get(FORM_SECTIONS.EV_CHARGER_PRODUCTION)?.setVisible(true);
                break;

            case ASSEMBLY_PROCESS_BPF_STAGES.BATTERY_PRODUCTION: 
                formContext.getAttribute(ASSEMBLY_PROCESS_STATUS_REASON)?.setValue(ASSEMBLY_PROCESS_STATUS_REASON_TYPES.BATTERY_PRODUCTION);
                tab?.sections.get(FORM_SECTIONS.BATTERY_PRODUCTION)?.setVisible(true);
                break;

            case ASSEMBLY_PROCESS_BPF_STAGES.FINAL_ITEM: 
                formContext.getAttribute(ASSEMBLY_PROCESS_STATUS_REASON)?.setValue(ASSEMBLY_PROCESS_STATUS_REASON_TYPES.FINAL_ITEM);
                tab?.sections.get(FORM_SECTIONS.FINAL_ITEM)?.setVisible(true);
                break;

            case ASSEMBLY_PROCESS_BPF_STAGES.CASE_REPORT: 
                formContext.getAttribute(ASSEMBLY_PROCESS_STATUS_REASON)?.setValue(ASSEMBLY_PROCESS_STATUS_REASON_TYPES.CASE_REPORT);
                tab?.sections.get(FORM_SECTIONS.CASE_REPORT)?.setVisible(true);
                break;

            default:
                break;
        }
    }

    function hideAllStageSections(formContext: Xrm.FormContext): void {
        const tab = formContext.ui.tabs.get(FORM_TABS.GENERAL);
        if (!tab) return;

        tab.sections.get(FORM_SECTIONS.IDENTIFICATION)?.setVisible(false);
        tab.sections.get(FORM_SECTIONS.EV_CHARGER_PRODUCTION)?.setVisible(false);
        tab.sections.get(FORM_SECTIONS.BATTERY_PRODUCTION)?.setVisible(false);
        tab.sections.get(FORM_SECTIONS.FINAL_ITEM)?.setVisible(false);
        tab.sections.get(FORM_SECTIONS.CASE_REPORT)?.setVisible(false);
    }

    function applyProductTypeFilter(formContext: Xrm.FormContext): void {
        const productTypeLookupControl = formContext.getControl(PRODUCT_TYPE_BPF_CONTROL) as Xrm.Controls.LookupControl;

        if (!productTypeLookupControl) {
            return;
        }

        const filterFunction = () => {
            const fetchXmlFilter = `
                <filter type="or">
                    <condition attribute="vtd_producttypeid" operator="eq" value="${PRODUCT_TYPES_IDS.BATTERY}" />
                    <condition attribute="vtd_producttypeid" operator="eq" value="${PRODUCT_TYPES_IDS.EV_CHARGER}" />
                </filter>
            `;
            productTypeLookupControl.addCustomFilter(fetchXmlFilter, PRODUCT_TYPE_TABLE);
        };

        productTypeLookupControl.addPreSearch(filterFunction);
    }

    function applyAssemblyLinePlantFilter(formContext: Xrm.FormContext): void {
        const assemblyLineLookupControl = formContext.getControl(ASSEMBLY_LINE_BPF_CONTROL) as Xrm.Controls.LookupControl;

        if (!assemblyLineLookupControl) {
            return;
        }

        const filterFunction = () => {
            const industrialPlantField = formContext.getAttribute(INDUSTRIAL_PLANT_ATTRIBUTE);
            const selectedPlant = industrialPlantField?.getValue();

            const productTypeField = formContext.getAttribute(PRODUCT_TYPE_ATTRIBUTE);
            const selectedProductType = productTypeField?.getValue();

            if (!selectedPlant || !selectedPlant[0].id || !selectedProductType || !selectedProductType[0].id) {
                return;
            }

            const plantId = selectedPlant[0].id.replace(/[{}]/g, "");
            const productTypeId = selectedProductType[0].id.replace(/[{}]/g, "");

            const fetchXmlFilter = `
                <filter type="and">
                    <condition attribute="${ASSEMBLY_LINE_INDUSTRIAL_PLANT_LOOKUP}" operator="eq" value="${plantId}" />
                    <condition attribute="${ASSEMBLY_LINE_PRODUCT_TYPE_LOOKUP}" operator="eq" value="${productTypeId}" />

                </filter>
            `;

            assemblyLineLookupControl.addCustomFilter(fetchXmlFilter, ASSEMBLY_LINE_TABLE);
        };

        assemblyLineLookupControl.addPreSearch(filterFunction);
    }

}