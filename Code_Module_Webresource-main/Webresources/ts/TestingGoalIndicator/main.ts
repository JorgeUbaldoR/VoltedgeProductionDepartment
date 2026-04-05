namespace TestingGoalIndicator.Main {
    // Logical name of the Device lookup field in the Testing Goal Indicator form
    const TGI_DEVICE_LOOKUP = 'vtd_deviceid';

    // Logical name of the Item lookup field in the Testing Goal Indicator form
    const TGI_ITEM_LOOKUP = 'vtd_itemid';

    // Name of the tab associated with Item-related information
    const TAB_ITEM = 'tab_item';

    // Name of the tab associated with Device-related information
    const TAB_DEVICE = 'tab_device';

    /**
     * Handles the form onLoad event for the Testing Goal Indicator entity.
     *
     * This function:
     * - applies the initial visibility logic for Item and Device targets;
     * - registers real-time onChange handlers for both lookup fields.
     *
     * @param executionContext - The Xrm.Events.EventContext object representing the execution context of the event.
     *
     * @example
     * const formContext = executionContext.getFormContext();
     * TestingGoalIndicator.Main.onLoad(executionContext);
     */
    export function onLoad(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();

        applyVisibilityLogic(formContext);

        formContext.getAttribute(TGI_ITEM_LOOKUP)?.addOnChange(onFieldChange);
        formContext.getAttribute(TGI_DEVICE_LOOKUP)?.addOnChange(onFieldChange);
    }

    /**
     * Handles the onChange event for the Item and Device lookup fields.
     *
     * This function re-applies the mutual exclusion and dynamic visibility logic
     * whenever the user changes one of the target lookup fields.
     *
     * @param executionContext - The Xrm.Events.EventContext object representing the execution context of the event.
     *
     * @example
     * const formContext = executionContext.getFormContext();
     * onFieldChange(executionContext);
     */
    function onFieldChange(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();
        applyVisibilityLogic(formContext);
    }

    /**
     * Applies the mutual exclusion and dynamic visibility rules between the Item and Device targets.
     *
     * Behaviour:
     * - If an Item is selected, the Device lookup is hidden and cleared, and the Device tab is hidden.
     * - If a Device is selected, the Item lookup is hidden and cleared, and the Item tab is hidden.
     * - If neither is selected, both lookups and both tabs remain visible.
     *
     * This ensures that the Testing Goal Indicator can only be associated with one target type at a time.
     *
     * @param formContext - The Xrm.FormContext object representing the current form.
     *
     * @example
     * applyVisibilityLogic(formContext);
     */
    function applyVisibilityLogic(formContext: Xrm.FormContext): void {
        const itemAttribute = formContext.getAttribute(TGI_ITEM_LOOKUP) as Xrm.Attributes.LookupAttribute;
        const deviceAttribute = formContext.getAttribute(TGI_DEVICE_LOOKUP) as Xrm.Attributes.LookupAttribute;

        const itemValue = itemAttribute?.getValue();
        const deviceValue = deviceAttribute?.getValue();

        const deviceControl = formContext.getControl(TGI_DEVICE_LOOKUP) as Xrm.Controls.LookupControl;
        const itemControl = formContext.getControl(TGI_ITEM_LOOKUP) as Xrm.Controls.LookupControl;

        const itemTab = formContext.ui.tabs.get(TAB_ITEM);
        const deviceTab = formContext.ui.tabs.get(TAB_DEVICE);

        if (itemValue && itemValue.length > 0) {
            deviceControl?.setVisible(false);
            deviceAttribute?.setValue(null);

            deviceTab?.setVisible(false);

            itemControl?.setVisible(true);
            itemTab?.setVisible(true);

        } else if (deviceValue && deviceValue.length > 0) {
            itemControl?.setVisible(false);
            itemAttribute?.setValue(null);

            itemTab?.setVisible(false);

            deviceControl?.setVisible(true);
            deviceTab?.setVisible(true);

        } else {
            deviceControl?.setVisible(true);
            itemControl?.setVisible(true);

            itemTab?.setVisible(true);
            deviceTab?.setVisible(true);
        }
    }
}