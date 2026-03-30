namespace Pet.Main {
  /**
   * Constants related to the Pet Main functionality.
   */
  const GENERATION_CHARACTERISTICS_STATUS = 'hsl_characteristicgenerationstatus';
  const TYPE_OF_ANIMAL = 'hsl_typeofanimal';
  const ANIMAL_TYPE = 'hsl_animaltype';

  /**
   * Enum of characteristic generation status values.
   */
  const CHARACTERISTIC_GENERATION_STATUS = {
    IN_PROGRESS: 818410000,
    SUCCESSFUL: 818410001,
    FAILED: 818410005,
  };

  /**
   * Enum of characteristic generation status values.
   */
  const ANIMAL_TYPE_VALUES = {
    CAT: 818410000,
    DOG: 818410001,
    HAMSTER: 818410002,
    RABBIT: 818410003,
    SNAKE: 818410004,
    TURTLE: 818410005,
    OTHER: 818410006,
  };

  /**
   * Handles the form's onLoad event for the Pet entity.
   *
   * @param executionContext - The Xrm.Events.EventContext object representing the execution context of the event.
   *
   * @example
   * const formContext = executionContext.getFormContext();
   * Pet.Main.onLoad(executionContext);
   */
  export async function onLoad(executionContext: Xrm.Events.EventContext) {
    const formContext = executionContext.getFormContext();

    // Show a notification if characteristic generation is in progress
    showCharacteristicGenerationInProgressNotification(executionContext);

    // Warn about close appointments
    warnOfCloseAppointments(executionContext);
    handleAnimalType(executionContext);
    // Check if the form data load state is 'FormLoad'
    if ((executionContext as any).getEventArgs().getDataLoadState() === 1) {
      formContext.getAttribute(GENERATION_CHARACTERISTICS_STATUS).addOnChange(showCharacteristicGenerationInProgressNotification);
      formContext.getAttribute(TYPE_OF_ANIMAL).addOnChange(handleAnimalType);
    }

    function showCharacteristicGenerationInProgressNotification(executionContext: Xrm.Events.EventContext) {
      const formContext = executionContext.getFormContext();
      const generationStatus = formContext.getAttribute(GENERATION_CHARACTERISTICS_STATUS).getValue();
      formContext.ui.clearFormNotification('characteristicGenerationInProgress');

      if (generationStatus === CHARACTERISTIC_GENERATION_STATUS.IN_PROGRESS) {
        formContext.ui.setFormNotification(
          'Characteristics are being generated in the background. Please refresh the form to see them.',
          'INFO',
          'characteristicGenerationInProgress',
        );
      }
    }

    async function warnOfCloseAppointments(executionContext: Xrm.Events.EventContext): Promise<void> {
      const formContext = executionContext.getFormContext();
      const petId = formContext.data.entity.getId();
      const appointments = await Xrm.WebApi.retrieveMultipleRecords(
        'hsl_veterinaryappointment',
        `?$select=hsl_startdate&$filter=Microsoft.Dynamics.CRM.NextXDays(PropertyName='hsl_startdate',PropertyValue=2) and _hsl_pet_value eq ${petId}&$orderby=hsl_startdate asc&$top=1`,
      );

      const date: string = appointments.entities[0].hsl_startdate;
      formContext.ui.clearFormNotification('closeAppointment');

      if (appointments.entities.length > 0) {
        formContext.ui.setFormNotification(
          `There is an appointment for this pet on ${DateHelper.formatUtcDate(date)}. Please check and inform the owner.`,
          'WARNING',
          'closeAppointment',
        );
      }
    }
    function handleAnimalType(executionContext: Xrm.Events.EventContext): void {
      const formContext = executionContext.getFormContext();
      const typeOfAnimal = formContext.getAttribute(TYPE_OF_ANIMAL).getValue();
      const animalTypeControl = formContext.getControl<Xrm.Controls.StandardControl>(ANIMAL_TYPE);
      const animalTypeAttribute = formContext.getAttribute<Xrm.Attributes.StringAttribute>(ANIMAL_TYPE);
      if (typeOfAnimal !== ANIMAL_TYPE_VALUES.OTHER) {
        animalTypeControl.setVisible(false);
        animalTypeAttribute.setValue(null);
        animalTypeAttribute.setRequiredLevel('none');
      } else {
        animalTypeControl.setVisible(true);
        animalTypeAttribute.setRequiredLevel('required');
      }
    }
  }
}
