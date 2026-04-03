namespace AssemblyLine.Main {

    const ASSEMBLY_PROCESS_PRODUCT_TYPE_LOOKUP = 'vtd_producttypeid'; 

    export async function onLoad(executionContext: Xrm.Events.EventContext): Promise<void> {
        const formContext = executionContext.getFormContext();

        const productTypeControl = formContext.getControl(ASSEMBLY_PROCESS_PRODUCT_TYPE_LOOKUP) as Xrm.Controls.LookupControl;
        
        if (!productTypeControl) return;

        productTypeControl.setDisabled(true);
    }
}