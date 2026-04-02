namespace Package.Main {

    // Package Constants
    const PACKAGE_ITEM_LOOKUP = 'vtd_itemid';
    const PACKAGE_EXTRA_ATTENTION = 'vtd_extraattention';

    // Item Constants
    const ITEM_TABLE = 'vtd_item';
    const ITEM_PRODUCT_LOOKUP = '_vtd_productid_value';

    // Product Constants
    const PRODUCT_SOLAR_CHARGER_ID = 'b1e1a5cd-8928-f111-8341-000d3a5b9779'; 
    const SOLAR_PRODUCT_IDS = [
        PRODUCT_SOLAR_CHARGER_ID,
    ];

    export function onLoad(executionContext: Xrm.Events.EventContext): void {
        onItemLookupChange(executionContext);
    }

    export async function onItemLookupChange(executionContext: Xrm.Events.EventContext): Promise<void> {
        const formContext = executionContext.getFormContext();
        const itemLookup = formContext.getAttribute(PACKAGE_ITEM_LOOKUP);
        const extraAttentionAttr = formContext.getAttribute(PACKAGE_EXTRA_ATTENTION);
        const extraAttentionCtrl = formContext.getControl(PACKAGE_EXTRA_ATTENTION) as Xrm.Controls.StandardControl;

        if (!itemLookup || !extraAttentionAttr || !extraAttentionCtrl) return;

        const itemValue = itemLookup.getValue();

        if (!itemValue || itemValue.length === 0) {
            extraAttentionCtrl.setDisabled(false);
            return;
        }

        const itemId = itemValue[0].id.replace(/[{}]/g, "").toLowerCase();

        try {
            Xrm.Utility.showProgressIndicator("Checking product details...");

            const itemRecord = await Xrm.WebApi.retrieveRecord(ITEM_TABLE, itemId, `?$select=${ITEM_PRODUCT_LOOKUP}`);
            const productId = itemRecord[ITEM_PRODUCT_LOOKUP];

            if (productId && SOLAR_PRODUCT_IDS.includes(productId.toLowerCase())) {
                
                // Se for solar: Marca como True e Bloqueia
                extraAttentionAttr.setValue(true);
                extraAttentionCtrl.setDisabled(true);
                
            } else {
                
                // Se NÃO for solar: Desbloqueia para o utilizador poder decidir manualmente
                extraAttentionCtrl.setDisabled(false);
                
            }

        } catch (error) {
            console.error("Erro ao procurar os detalhes do Item: ", error);
        } finally {
            Xrm.Utility.closeProgressIndicator();
        }
    }
}