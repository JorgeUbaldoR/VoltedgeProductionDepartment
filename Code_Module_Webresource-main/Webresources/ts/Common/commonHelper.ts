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
   * Mostra uma notificação no canto do ecrã (Toast).
   * @param message A mensagem a apresentar.
   * @param level 1 = Success, 2 = Error, 3 = Warning, 4 = Info (Por defeito é 4)
   */
  export async function createAndShowToastNotification(message: string, level: 1 | 2 | 3 | 4 = 4): Promise<string> {
    
    const notification = {
      type: 2, 
      level: level, 
      message: message
    };

    return await Xrm.App.addGlobalNotification(notification);
  }

}
