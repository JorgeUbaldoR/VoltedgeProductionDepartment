namespace Package.Main {

    // Logical name of the Item lookup field in the Package form
    const PACKAGE_ITEM_LOOKUP = 'vtd_itemid';

    // Logical name of the Extra Attention field in the Package form
    const PACKAGE_EXTRA_ATTENTION = 'vtd_extraattention';

    // Logical name of the Item table
    const ITEM_TABLE = 'vtd_item';

    // Logical name of the Product lookup field stored in the Item table
    const ITEM_PRODUCT_LOOKUP = '_vtd_productid_value';

    // Identifier of the solar-powered product that should trigger automatic extra attention
    const PRODUCT_SOLAR_CHARGER_ID = 'b1e1a5cd-8928-f111-8341-000d3a5b9779';

    // List of product identifiers considered solar-powered for this rule
    const SOLAR_PRODUCT_IDS = [
        PRODUCT_SOLAR_CHARGER_ID,
    ];

    /**
     * Handles the form onLoad event for the Package entity.
     *
     * This function initializes the automatic extra attention logic by reusing
     * the Item lookup change handler when the form is first loaded.
     *
     * @param executionContext - The Xrm.Events.EventContext object representing the execution context of the event.
     *
     * @example
     * const formContext = executionContext.getFormContext();
     * Package.Main.onLoad(executionContext);
     */
    export function onLoad(executionContext: Xrm.Events.EventContext): void {
        onItemLookupChange(executionContext);
    }

    /**
     * Handles the onChange event of the Item lookup field in the Package form.
     *
     * This function retrieves the selected Item, checks its related Product,
     * and automatically marks the Package as requiring extra attention if the
     * product belongs to the configured list of solar-powered products.
     *
     * If the selected product is solar-powered:
     * - the Extra Attention field is set to true;
     * - the Extra Attention control is locked.
     *
     * If the selected product is not solar-powered:
     * - the Extra Attention control is enabled for manual user decision.
     *
     * @param executionContext - The Xrm.Events.EventContext object representing the execution context of the event.
     *
     * @example
     * const formContext = executionContext.getFormContext();
     * Package.Main.onItemLookupChange(executionContext);
     */
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
                extraAttentionAttr.setValue(true);
                extraAttentionCtrl.setDisabled(true);
            } else {
                extraAttentionCtrl.setDisabled(false);
            }

        } catch (error) {
            console.error("Erro ao procurar os detalhes do Item: ", error);
        } finally {
            Xrm.Utility.closeProgressIndicator();
        }
    }
}