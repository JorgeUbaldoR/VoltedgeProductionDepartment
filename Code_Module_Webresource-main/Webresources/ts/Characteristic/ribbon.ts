namespace Characteristic.Ribbon {
  /**
   * Constants related to the Characteristic Ribbon functionality.
   */
  const ADD_TO_ALL = 'hsl_addtoall';

  /**
   * Handles the click event for the "Add to All" button in the Characteristic form.
   *
   * @param formContext - The Xrm.FormContext object representing the Characteristic form.
   * @returns A Promise that resolves when the operation is completed.
   *
   * @example
   * const formContext = Xrm.Page.getFormContext();
   * Characteristic.Ribbon.OnAddToAllClick(formContext).then(() => {
   *   // Handle the completion of the "Add to All" operation if needed.
   * });
   */
  export async function OnAddToAllClick(formContext: Xrm.FormContext): Promise<void> {
    // Construct the OData query
    const query = '?$select=hsl_addtoall';

    // Get the ID of the Characteristic entity
    const id = formContext.data.entity.getId();

    // Retrieve the entity with the specified query
    const entity = await Xrm.WebApi.retrieveRecord('hsl_characteristic', id, query);

    // Get the value of the 'hsl_addtoall' attribute or default to false
    const addToAllVal = entity.hsl_addtoall ?? false;

    if (addToAllVal === true) {
      const alertStrings = {
        confirmButtonLabel: 'OK',
        text: 'A request to add this characteristic is currently being processed. This could take a few minutes to complete.',
        title: 'Add to All Pets',
      };
      await Xrm.Navigation.openAlertDialog(alertStrings);
    } else {
      const alertStrings = {
        confirmButtonLabel: 'OK',
        text: 'This characteristic will now be added, when applicable, to existing active records. This could take a few minutes to complete.',
        title: 'Add to All Pets',
      };

      // Update the record to set 'hsl_addtoall' to true
      const updatedRecord = {
        [ADD_TO_ALL]: true,
      };
      await Xrm.WebApi.online.updateRecord('hsl_characteristic', id, updatedRecord);

      // Request the "Add to All" characteristic operation
      requestAddToAllCharacteristic(id);

      await Xrm.Navigation.openAlertDialog(alertStrings);
    }
  }

  /**
   * Determines the visibility of the "Add to All" button in the Characteristic form based on the form type.
   *
   * @param formContext - The Xrm.FormContext object representing the Characteristic form.
   * @returns True if the button should be visible; otherwise, false.
   *
   * @example
   * const formContext = Xrm.Page.getFormContext();
   * const isVisible = Characteristic.Ribbon.AddToAllButtonVisibility(formContext);
   */
  export function AddToAllButtonVisibility(formContext: Xrm.FormContext): boolean {
    // Get the current form type
    const formType = formContext.ui.getFormType();

    // The button is visible for all form types except 'Create' (1)
    return formType !== 1;
  }

  /**
   * Requests the "Add to All" characteristic operation.
   *
   * @param id - The ID of the Characteristic entity.
   *
   * @example
   * const characteristicId = '12345';
   * Characteristic.Ribbon.requestAddToAllCharacteristic(characteristicId);
   */
  function requestAddToAllCharacteristic(id: string): void {
    // Create the request object
    const req = {};

    // Build action metadata
    const target = {};
    target['entityType'] = 'hsl_characteristic';
    target['id'] = id;
    req['entity'] = target;
    req['getMetadata'] = function () {
      return {
        boundParameter: 'entity',
        parameterTypes: {
          entity: {
            typeName: 'mscrm.hsl_characteristic',
            structuralProperty: 5,
          },
        },
        operationType: 0,
        operationName: 'hsl_HslCharacteristAddToExisting',
      };
    };

    // Execute the custom action
    Xrm.WebApi.online.execute(req);
  }
}