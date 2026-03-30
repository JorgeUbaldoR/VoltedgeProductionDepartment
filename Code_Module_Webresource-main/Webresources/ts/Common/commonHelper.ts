namespace Common.Helper {
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
}
