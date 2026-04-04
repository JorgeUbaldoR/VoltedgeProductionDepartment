namespace TestingGoalIndicator.Main {
    const TGI_DEVICE_LOOKUP = 'vtd_deviceid';
    const TGI_ITEM_LOOKUP = 'vtd_itemid';

    const TAB_ITEM = 'tab_item'; 
    const TAB_DEVICE = 'tab_device';

    export function onLoad(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();

        applyVisibilityLogic(formContext);

        formContext.getAttribute(TGI_ITEM_LOOKUP)?.addOnChange(onFieldChange);
        formContext.getAttribute(TGI_DEVICE_LOOKUP)?.addOnChange(onFieldChange);
    }

    function onFieldChange(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();
        applyVisibilityLogic(formContext);
    }

    function applyVisibilityLogic(formContext: Xrm.FormContext): void {
        const itemAttribute = formContext.getAttribute(TGI_ITEM_LOOKUP) as Xrm.Attributes.LookupAttribute;
        const deviceAttribute = formContext.getAttribute(TGI_DEVICE_LOOKUP) as Xrm.Attributes.LookupAttribute;

        const itemValue = itemAttribute?.getValue();
        const deviceValue = deviceAttribute?.getValue();

        const deviceControl = formContext.getControl(TGI_DEVICE_LOOKUP) as Xrm.Controls.LookupControl;
        const itemControl = formContext.getControl(TGI_ITEM_LOOKUP) as Xrm.Controls.LookupControl;

        const itemTab = formContext.ui.tabs.get(TAB_ITEM);
        const deviceTab = formContext.ui.tabs.get(TAB_DEVICE);

        // LÓGICA CONDICIONAL
        if (itemValue && itemValue.length > 0) {
            // IF: Selecionou um ITEM
            
            // 1. Esconde e limpa a lupa do Device
            deviceControl?.setVisible(false);
            deviceAttribute?.setValue(null);
            
            // 2. Esconde a Tab inteira do Device
            deviceTab?.setVisible(false);

            // 3. Garante que o Item e a sua Tab estão visíveis
            itemControl?.setVisible(true);
            itemTab?.setVisible(true);

        } else if (deviceValue && deviceValue.length > 0) {
            // ELSE IF: Selecionou um DEVICE
            
            // 1. Esconde e limpa a lupa do Item
            itemControl?.setVisible(false);
            itemAttribute?.setValue(null);
            
            // 2. Esconde a Tab inteira do Item
            itemTab?.setVisible(false);

            // 3. Garante que o Device e a sua Tab estão visíveis
            deviceControl?.setVisible(true);
            deviceTab?.setVisible(true);

        } else {
            // ELSE: Nenhum está selecionado
            
            // Mostra as duas lupas para o utilizador poder escolher
            deviceControl?.setVisible(true);
            itemControl?.setVisible(true);
            
            // Mostra as duas Tabs
            itemTab?.setVisible(true);
            deviceTab?.setVisible(true);
        }
    }
}