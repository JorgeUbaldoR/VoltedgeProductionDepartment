namespace AssemblyLine.Main {

    // Logical name of the Product Type lookup field in the Assembly Line form
    const ASSEMBLY_PROCESS_PRODUCT_TYPE_LOOKUP = 'vtd_producttypeid';

    /**
     * Handles the form onLoad event for the Assembly Line entity.
     *
     * This function retrieves the Product Type lookup control and sets it as read-only
     * when the form is loaded, preventing manual modification of that field.
     *
     * @param executionContext - The Xrm.Events.EventContext object representing the execution context of the event.
     *
     * @example
     * const formContext = executionContext.getFormContext();
     * AssemblyLine.Main.onLoad(executionContext);
     */
    export async function onLoad(executionContext: Xrm.Events.EventContext): Promise<void> {
        const formContext = executionContext.getFormContext();

        const productTypeControl = formContext.getControl(ASSEMBLY_PROCESS_PRODUCT_TYPE_LOOKUP) as Xrm.Controls.LookupControl;

        if (!productTypeControl) return;

        productTypeControl.setDisabled(true);
    }
}