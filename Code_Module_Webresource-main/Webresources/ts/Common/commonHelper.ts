namespace Common.Helper {

  export const FORM_TYPES = {
    CREATE: 1,
    UPDATE: 2,
    READ_ONLY: 3,
    DISABLED: 4,
    QUICK_CREATE: 5,
    BULK_EDIT: 6,
    READ_OPTIMIZED: 11,
  }

  export async function handleOpenEntityRecordOnSidePane(lookupValue: Xrm.LookupValue[], paneOptions: Xrm.App.PaneOptions): Promise<void> {
    if (lookupValue) {
      const pane = Xrm.App.sidePanes.getPane(paneOptions.paneId) ?? (await Xrm.App.sidePanes.createPane(paneOptions));
      const navigateOptions: Xrm.Navigation.PageInputEntityRecord = {
        pageType: 'entityrecord',
        entityName: lookupValue[0].entityType,
        entityId: lookupValue[0].id,
      };
      pane.navigate(navigateOptions);
    }
  }

  export async function createAndShowAlertDialog(label: string, text: string, title: string): Promise<string> {
    const alertStrings = {
      confirmButtonLabel: label,
      text: text,
      title: title,
    };

    return await Xrm.Navigation.openAlertDialog(alertStrings);
  }


  /**
   * Mostra uma barra de notificação no topo do formulário.
   * @param level "ERROR" | "INFO" | "WARNING"
   * @param uniqueId Um ID à tua escolha (ex: "aviso_readonly") para poderes apagar a notificação mais tarde.
   */
  export function showFormNotification(formContext: Xrm.FormContext, message: string, level: "ERROR" | "INFO" | "WARNING", uniqueId: string): void {
    formContext.ui.setFormNotification(message, level, uniqueId);
  }

}
