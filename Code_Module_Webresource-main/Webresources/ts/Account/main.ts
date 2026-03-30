namespace Account.Main {
  // pane config
  const paneId = 'hsl_accountpane';
  const paneConf: Xrm.App.PaneOptions = {
    title: 'Parent Account',
    paneId: paneId,
    canClose: true,
    width: 500,
  };

  //Logical names of fields
  const parentAccountId = 'parentaccountid';

  export function onLoad(executionContext: Xrm.Events.EventContext): void {
    const formContext = executionContext.getFormContext();
    handleParentAccountIdChange(executionContext);
    formContext.getAttribute<Xrm.Attributes.LookupAttribute>(parentAccountId).addOnChange(handleParentAccountIdChange);
    formContext.getControl<Xrm.Controls.LookupControl>(parentAccountId).addOnLookupTagClick(onParentAccountClick);
  }

  async function handleParentAccountIdChange(context: Xrm.Events.EventContext): Promise<void> {
    const formContext = context.getFormContext();
    const parentAccount = formContext.getAttribute<Xrm.Attributes.LookupAttribute>(parentAccountId).getValue();
    if (parentAccount) {
      await Common.Helper.handleOpenEntityRecordOnSidePane(parentAccount, paneConf);
    }
  }

  async function onParentAccountClick(context: Xrm.Events.LookupTagClickEventContext): Promise<void> {
    const formContext = context.getFormContext();
    const eventArgs = context.getEventArgs();
    const parentAccount = formContext.getAttribute<Xrm.Attributes.LookupAttribute>(parentAccountId).getValue();
    eventArgs.preventDefault();
    if (parentAccount) {
      await Common.Helper.handleOpenEntityRecordOnSidePane(parentAccount, paneConf);
    }
  }
}
