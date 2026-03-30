namespace Appointment.Main {
  /**
   * Constant representing the 'Medication Prescribed' attribute name.
   */
  const MEDICATION_PRESCRIBED = 'hsl_medicationprescribed';

  /**
   * Constant representing the 'Medication' attribute name.
   */
  const MEDICATION = 'hsl_medication';

  /**
   * Handles the form's onLoad event for the Appointment entity.
   *
   * @param executionContext - The Xrm.Events.EventContext object representing the execution context of the event.
   *
   * @example
   * const formContext = executionContext.getFormContext();
   * Appointment.Main.onLoad(executionContext);
   */
  export function onLoad(executionContext: Xrm.Events.EventContext): void {
    // Handle medication based on the value of 'Medication Prescribed' attribute
    handleMedication(executionContext);

    const formContext = executionContext.getFormContext();

    // Check if the form data load state is 'FormLoad'
    if ((executionContext as any).getEventArgs().getDataLoadState() === 1) {
      formContext.getAttribute(MEDICATION_PRESCRIBED).addOnChange(handleMedication);
    }
  }

  /**
   * Handles the 'Medication' field based on the value of the 'Medication Prescribed' field.
   *
   * @param executionContext - The Xrm.Events.EventContext object representing the execution context of the event.
   *
   * @example
   * const formContext = executionContext.getFormContext();
   * Appointment.Main.handleMedication(executionContext);
   */
  function handleMedication(executionContext: Xrm.Events.EventContext): void {
    const formContext = executionContext.getFormContext();
    const medicationPrescribed = formContext.getAttribute(MEDICATION_PRESCRIBED).getValue();

    if (medicationPrescribed) {
      // Make the 'Medication' field required and visible
      formContext.getAttribute(MEDICATION).setRequiredLevel('required');
      formContext.getControl<Xrm.Controls.LookupControl>(MEDICATION).setVisible(true);
    } else {
      // Make the 'Medication' field optional, clear its value, and hide it
      formContext.getAttribute<Xrm.Attributes.LookupAttribute>(MEDICATION).setRequiredLevel('none');
      formContext.getAttribute<Xrm.Attributes.LookupAttribute>(MEDICATION).setValue(null);
      formContext.getControl<Xrm.Controls.LookupControl>(MEDICATION).setVisible(false);
    }
  }
}
