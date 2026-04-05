namespace AssemblyProcess.Main {

    // Logical name of the Assembly Process status reason field
    const ASSEMBLY_PROCESS_STATUS_REASON = 'statuscode';

    // Logical name of the Industrial Plant lookup field
    const INDUSTRIAL_PLANT_ATTRIBUTE = "vtd_industrialplantid";

    // Logical name of the Product Type lookup field
    const PRODUCT_TYPE_ATTRIBUTE = "vtd_producttypeid";

    // Logical name of the Battery lookup field
    const ASSEMBLY_PROCESS_BATTERYID_LOOKUP = "vtd_batteryid";

    // Logical name of the Connector lookup field
    const ASSEMBLY_PROCESS_CONNECTOR_LOOKUP = "vtd_connectorid";

    // Logical name of the Assembly Line lookup field
    const ASSEMBLY_PROCESS_ASSEMBLY_LINE_LOOKUP = "vtd_assemblylineid";

    // Logical name of the Device lookup field
    const ASSEMBLY_PROCESS_DEVICE_LOOKUP = "vtd_deviceid";

    // BPF control name for Product Type
    const ASSEMBLY_PROCESS_PRODUCT_TYPE_BPF_CONTROL = "header_process_vtd_producttypeid";

    // BPF control name for Assembly Line
    const ASSEMBLY_PROCESS_BPF_CONTROL = "header_process_vtd_assemblylineid";

    // BPF control name for Device
    const ASSEMBLY_PROCESS_DEVICE_BPF_CONTROL = "header_process_vtd_deviceid";

    // BPF control name for Battery
    const ASSEMBLY_PROCESS_BATTERY_BPF_CONTROL = "header_process_vtd_batteryid";

    // BPF control name for Connector
    const ASSEMBLY_PROCESS_CONNECTOR_BPF_CONTROL = "header_process_vtd_connectorid";

    // Header control name for Status Reason
    const DEVICE_STATUS_REASON_HEADER_CONTROL = "header_statuscode";

    // Status reason values used to synchronize the Assembly Process record with the current BPF stage
    const ASSEMBLY_PROCESS_STATUS_REASON_TYPES = {
        IDENTIFICATION: 953180001,
        EV_CHARGER_PRODUCTION: 953180002,
        BATTERY_PRODUCTION: 953180002,
        FINAL_ITEM: 953180003,
        CASE_REPORT: 953180004
    };

    // BPF stage identifiers used to determine the active process phase
    const ASSEMBLY_PROCESS_BPF_STAGES = {
        IDENTIFICATION: 'de8206fc-e4b1-4b8d-8a01-67a03ab5c812',
        EV_CHARGER_PRODUCTION: 'cb6a6658-c10d-4a72-b1a6-89d2fa20b07b',
        BATTERY_PRODUCTION: 'e387fa6c-7e5f-4f37-b851-50da728e66ef',
        FINAL_ITEM: '9bd090f2-a1b5-4774-b27f-694e9f7906f1',
        CASE_REPORT: '5604d2b7-bc7f-4e0e-9370-e71d4a7c6631'
    };

    // Names of the form tabs used in the dynamic layout logic
    const FORM_TABS = {
        GENERAL: 'tab_general'
    };

    // Names of the form sections shown or hidden according to the active BPF stage
    const FORM_SECTIONS = {
        IDENTIFICATION: "tab_general_section_information",
        EV_CHARGER_PRODUCTION: "tab_general_section_production",
        BATTERY_PRODUCTION: "tab_general_section_production",
        FINAL_ITEM: "tab_general_section_finalitem",
        CASE_REPORT: "tab_general_section_casereport"
    };

    // Logical name of the Product Type table
    const PRODUCT_TYPE_TABLE = 'vtd_producttype';

    // Product Type identifiers used for filtering and contextual behaviour
    const PRODUCT_TYPES_IDS = {
        BATTERY: 'A1E500F9-8828-F111-8341-000D3A5B9779',
        EV_CHARGER: '96E85327-8928-F111-8341-000D3A5B9779',
        CONNECTOR: 'B636C515-8928-F111-8341-000D3A5B9779'
    };

    // Logical name of the Assembly Line table
    const ASSEMBLY_LINE_TABLE = 'vtd_assemblyline';

    // Logical name of the Industrial Plant lookup field in the Assembly Line table
    const ASSEMBLY_LINE_INDUSTRIAL_PLANT_LOOKUP = 'vtd_industrialplantid';

    // Logical name of the Product Type lookup field in the Assembly Line table
    const ASSEMBLY_LINE_PRODUCT_TYPE_LOOKUP = 'vtd_producttypeid';

    // Logical name of the Device table
    const DEVICE_TABLE = 'vtd_device';

    // Logical name of the Assembly Line lookup field in the Device table
    const DEVICE_ASSEMBLY_LINE_LOOKUP = "vtd_assemblylineid";

    // Logical name of the Item table
    const ITEM_TABLE = 'vtd_item';

    // Logical name of the Product Type lookup field in the Item table
    const ITEM_PRODUCT_TYPE_LOOKUP = 'vtd_producttypelookupid';

    /**
     * Handles the form onLoad event for the Assembly Process entity.
     *
     * This function:
     * - registers the BPF stage change event;
     * - synchronizes the form layout with the current active stage;
     * - applies contextual lookup filters;
     * - disables the Status Reason header control;
     * - registers hierarchical reset logic for parent-child lookups.
     *
     * @param executionContext - The Xrm.Events.EventContext object representing the execution context of the event.
     *
     * @example
     * const formContext = executionContext.getFormContext();
     * AssemblyProcess.Main.onLoad(executionContext);
     */
    export function onLoad(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();

        const process = formContext.data.process;

        if (process) {
            process.addOnStageChange(onStageChange);
            handleBpfStageLogic(formContext);
        }

        applyProductTypeFilter(formContext);
        applyAssemblyLinePlantFilter(formContext);
        applyDeviceFilter(formContext);
        applyBatteryItemFilter(formContext);
        applyConnectorItemFilter(formContext);

        const statusReasonControl = formContext.getControl(DEVICE_STATUS_REASON_HEADER_CONTROL) as Xrm.Controls.OptionSetControl;

        if (statusReasonControl) {
            statusReasonControl.setDisabled(true);
        }

        formContext.getAttribute(INDUSTRIAL_PLANT_ATTRIBUTE)?.addOnChange(onPlantOrProductChange);
        formContext.getAttribute(PRODUCT_TYPE_ATTRIBUTE)?.addOnChange(onPlantOrProductChange);
        formContext.getAttribute(ASSEMBLY_PROCESS_ASSEMBLY_LINE_LOOKUP)?.addOnChange(onAssemblyLineChange);
    }

    /**
     * Handles changes to the Industrial Plant or Product Type fields.
     *
     * This function clears dependent child fields to preserve hierarchy consistency
     * whenever a higher-level context changes.
     *
     * @param executionContext - The Xrm.Events.EventContext object representing the execution context of the event.
     *
     * @example
     * onPlantOrProductChange(executionContext);
     */
    function onPlantOrProductChange(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();

        formContext.getAttribute(ASSEMBLY_PROCESS_ASSEMBLY_LINE_LOOKUP)?.setValue(null);
        formContext.getAttribute(ASSEMBLY_PROCESS_DEVICE_LOOKUP)?.setValue(null);
    }

    /**
     * Handles changes to the Assembly Line field.
     *
     * This function clears the Device field to prevent invalid child selections
     * when the selected Assembly Line changes.
     *
     * @param executionContext - The Xrm.Events.EventContext object representing the execution context of the event.
     *
     * @example
     * onAssemblyLineChange(executionContext);
     */
    function onAssemblyLineChange(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();

        formContext.getAttribute(ASSEMBLY_PROCESS_DEVICE_LOOKUP)?.setValue(null);
    }

    /**
     * Handles the BPF stage change event.
     *
     * This function re-applies the stage-driven layout and status synchronization logic
     * whenever the active BPF stage changes.
     *
     * @param executionContext - The Xrm.Events.EventContext object representing the execution context of the stage event.
     *
     * @example
     * onStageChange(executionContext);
     */
    function onStageChange(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();
        handleBpfStageLogic(formContext);
    }

    /**
     * Synchronizes the form layout and Status Reason with the currently active BPF stage.
     *
     * This function:
     * - retrieves the active stage;
     * - hides all stage sections;
     * - shows only the sections relevant to the current process phase;
     * - updates the record Status Reason to match the active stage;
     * - controls the visibility of Battery and Connector fields depending on the production context.
     *
     * @param formContext - The Xrm.FormContext object representing the current form.
     *
     * @example
     * handleBpfStageLogic(formContext);
     */
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
                showConnectorAndBatteryFields(formContext);

                tab?.sections.get(FORM_SECTIONS.IDENTIFICATION)?.setVisible(true);
                tab?.sections.get(FORM_SECTIONS.EV_CHARGER_PRODUCTION)?.setVisible(true);
                break;

            case ASSEMBLY_PROCESS_BPF_STAGES.BATTERY_PRODUCTION:
                formContext.getAttribute(ASSEMBLY_PROCESS_STATUS_REASON)?.setValue(ASSEMBLY_PROCESS_STATUS_REASON_TYPES.BATTERY_PRODUCTION);
                hideAndClearConnectorAndBatteryFields(formContext);

                tab?.sections.get(FORM_SECTIONS.IDENTIFICATION)?.setVisible(true);
                tab?.sections.get(FORM_SECTIONS.BATTERY_PRODUCTION)?.setVisible(true);
                break;

            case ASSEMBLY_PROCESS_BPF_STAGES.FINAL_ITEM:
                formContext.getAttribute(ASSEMBLY_PROCESS_STATUS_REASON)?.setValue(ASSEMBLY_PROCESS_STATUS_REASON_TYPES.FINAL_ITEM);
                tab?.sections.get(FORM_SECTIONS.IDENTIFICATION)?.setVisible(true);
                tab?.sections.get(FORM_SECTIONS.EV_CHARGER_PRODUCTION)?.setVisible(true);
                tab?.sections.get(FORM_SECTIONS.FINAL_ITEM)?.setVisible(true);
                break;

            case ASSEMBLY_PROCESS_BPF_STAGES.CASE_REPORT:
                formContext.getAttribute(ASSEMBLY_PROCESS_STATUS_REASON)?.setValue(ASSEMBLY_PROCESS_STATUS_REASON_TYPES.CASE_REPORT);
                tab?.sections.get(FORM_SECTIONS.IDENTIFICATION)?.setVisible(true);
                tab?.sections.get(FORM_SECTIONS.EV_CHARGER_PRODUCTION)?.setVisible(true);
                tab?.sections.get(FORM_SECTIONS.FINAL_ITEM)?.setVisible(true);
                tab?.sections.get(FORM_SECTIONS.CASE_REPORT)?.setVisible(true);
                break;

            default:
                break;
        }
    }

    /**
     * Shows the Battery and Connector fields in contexts where they are relevant.
     *
     * @param formContext - The Xrm.FormContext object representing the current form.
     *
     * @example
     * showConnectorAndBatteryFields(formContext);
     */
    function showConnectorAndBatteryFields(formContext: Xrm.FormContext): void {
        const batteryControl = formContext.getControl(ASSEMBLY_PROCESS_BATTERYID_LOOKUP) as Xrm.Controls.LookupControl;
        const connectorControl = formContext.getControl(ASSEMBLY_PROCESS_CONNECTOR_LOOKUP) as Xrm.Controls.LookupControl;

        if (!connectorControl || !batteryControl) return;

        connectorControl.setVisible(true);
        batteryControl.setVisible(true);
    }

    /**
     * Hides and clears the Battery and Connector fields when they are not relevant
     * to the current production context.
     *
     * @param formContext - The Xrm.FormContext object representing the current form.
     *
     * @example
     * hideAndClearConnectorAndBatteryFields(formContext);
     */
    function hideAndClearConnectorAndBatteryFields(formContext: Xrm.FormContext): void {
        const batteryControl = formContext.getControl(ASSEMBLY_PROCESS_BATTERYID_LOOKUP) as Xrm.Controls.LookupControl;
        const connectorControl = formContext.getControl(ASSEMBLY_PROCESS_CONNECTOR_LOOKUP) as Xrm.Controls.LookupControl;
        const batteryAttribute = formContext.getAttribute(ASSEMBLY_PROCESS_BATTERYID_LOOKUP) as Xrm.Attributes.LookupAttribute;
        const connectorAttribute = formContext.getAttribute(ASSEMBLY_PROCESS_CONNECTOR_LOOKUP) as Xrm.Attributes.LookupAttribute;

        if (connectorControl && connectorAttribute) {
            connectorControl.setVisible(false);
            connectorAttribute.setValue(null);
        }

        if (batteryControl && batteryAttribute) {
            batteryControl.setVisible(false);
            batteryAttribute.setValue(null);
        }
    }

    /**
     * Hides all stage-related sections in the general tab before reapplying
     * the visibility of the sections required for the active stage.
     *
     * @param formContext - The Xrm.FormContext object representing the current form.
     *
     * @example
     * hideAllStageSections(formContext);
     */
    function hideAllStageSections(formContext: Xrm.FormContext): void {
        const tab = formContext.ui.tabs.get(FORM_TABS.GENERAL);
        if (!tab) return;

        tab.sections.get(FORM_SECTIONS.IDENTIFICATION)?.setVisible(false);
        tab.sections.get(FORM_SECTIONS.EV_CHARGER_PRODUCTION)?.setVisible(false);
        tab.sections.get(FORM_SECTIONS.BATTERY_PRODUCTION)?.setVisible(false);
        tab.sections.get(FORM_SECTIONS.FINAL_ITEM)?.setVisible(false);
        tab.sections.get(FORM_SECTIONS.CASE_REPORT)?.setVisible(false);
    }

    /**
     * Applies a pre-search filter to the Product Type BPF lookup so that only
     * allowed production product types are displayed.
     *
     * @param formContext - The Xrm.FormContext object representing the current form.
     *
     * @example
     * applyProductTypeFilter(formContext);
     */
    function applyProductTypeFilter(formContext: Xrm.FormContext): void {
        const productTypeLookupControl = formContext.getControl(ASSEMBLY_PROCESS_PRODUCT_TYPE_BPF_CONTROL) as Xrm.Controls.LookupControl;

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

    /**
     * Applies a contextual pre-search filter to the Assembly Line BPF lookup
     * based on the selected Industrial Plant and Product Type.
     *
     * @param formContext - The Xrm.FormContext object representing the current form.
     *
     * @example
     * applyAssemblyLinePlantFilter(formContext);
     */
    function applyAssemblyLinePlantFilter(formContext: Xrm.FormContext): void {
        const assemblyLineLookupControl = formContext.getControl(ASSEMBLY_PROCESS_BPF_CONTROL) as Xrm.Controls.LookupControl;

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

    /**
     * Applies a contextual pre-search filter to the Device BPF lookup
     * based on the selected Assembly Line.
     *
     * @param formContext - The Xrm.FormContext object representing the current form.
     *
     * @example
     * applyDeviceFilter(formContext);
     */
    function applyDeviceFilter(formContext: Xrm.FormContext): void {
        const deviceLookupControl = formContext.getControl(ASSEMBLY_PROCESS_DEVICE_BPF_CONTROL) as Xrm.Controls.LookupControl;

        if (!deviceLookupControl) {
            return;
        }

        const filterFunction = () => {

            const assemblyLineField = formContext.getAttribute(DEVICE_ASSEMBLY_LINE_LOOKUP);
            const selectedAssemblyLine = assemblyLineField?.getValue();

            if (!selectedAssemblyLine || !selectedAssemblyLine[0].id) {
                return;
            }

            const assemblyLineId = selectedAssemblyLine[0].id.replace(/[{}]/g, "");

            const fetchXmlFilter = `
                <filter type="and">
                    <condition attribute="${DEVICE_ASSEMBLY_LINE_LOOKUP}" operator="eq" value="${assemblyLineId}" />
                </filter>
            `;

            deviceLookupControl.addCustomFilter(fetchXmlFilter, DEVICE_TABLE);
        };

        deviceLookupControl.addPreSearch(filterFunction);
    }

    /**
     * Applies a pre-search filter to the Battery lookup so that only Items
     * of Product Type Battery are displayed.
     *
     * @param formContext - The Xrm.FormContext object representing the current form.
     *
     * @example
     * applyBatteryItemFilter(formContext);
     */
    function applyBatteryItemFilter(formContext: Xrm.FormContext): void {
        const batteryLookupControl = formContext.getControl(ASSEMBLY_PROCESS_BATTERY_BPF_CONTROL) as Xrm.Controls.LookupControl;

        if (!batteryLookupControl) {
            return;
        }

        const filterFunction = () => {
            const fetchXmlFilter = `
                <filter type="and">
                    <condition attribute="${ITEM_PRODUCT_TYPE_LOOKUP}" operator="eq" value="${PRODUCT_TYPES_IDS.BATTERY}" />
                </filter>
            `;

            batteryLookupControl.addCustomFilter(fetchXmlFilter, ITEM_TABLE);
        };

        batteryLookupControl.addPreSearch(filterFunction);
    }

    /**
     * Applies a pre-search filter to the Connector lookup so that only Items
     * of Product Type Connector are displayed.
     *
     * @param formContext - The Xrm.FormContext object representing the current form.
     *
     * @example
     * applyConnectorItemFilter(formContext);
     */
    function applyConnectorItemFilter(formContext: Xrm.FormContext): void {
        const connectorLookupControl = formContext.getControl(ASSEMBLY_PROCESS_CONNECTOR_BPF_CONTROL) as Xrm.Controls.LookupControl;

        if (!connectorLookupControl) {
            return;
        }

        const filterFunction = () => {
            const fetchXmlFilter = `
                <filter type="and">
                    <condition attribute="${ITEM_PRODUCT_TYPE_LOOKUP}" operator="eq" value="${PRODUCT_TYPES_IDS.CONNECTOR}" />
                </filter>
            `;

            connectorLookupControl.addCustomFilter(fetchXmlFilter, ITEM_TABLE);
        };

        connectorLookupControl.addPreSearch(filterFunction);
    }
}