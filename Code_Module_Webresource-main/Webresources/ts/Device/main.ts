namespace Device.main {

    // Constantes do Status Reason
    const DEVICE_STATUS_REASON_HEADER_CONTROL = 'header_statuscode';

    // Novas Constantes para as Datas
    const PURCHASE_DATE_ATTRIBUTE = 'vtd_purchasedate';
    const INSTALLATION_DATE_ATTRIBUTE = 'vtd_installationdate';

    export async function onLoad(executionContext: Xrm.Events.EventContext): Promise<void> {
        const formContext = executionContext.getFormContext();
        const formType = formContext.ui.getFormType();

        // Lógica do Form Type (se tiveste erro com o Common, muda para formType === 1)
        if(formType !== Common.Helper.FORM_TYPES.CREATE) {
            const statusReasonControl = formContext.getControl(DEVICE_STATUS_REASON_HEADER_CONTROL) as Xrm.Controls.OptionSetControl;
            if(statusReasonControl) {
                statusReasonControl.setDisabled(true);
            }
        }

        // 1. Registar os eventos para que a validação corra sempre que as datas mudarem
        formContext.getAttribute(PURCHASE_DATE_ATTRIBUTE)?.addOnChange(validateDates);
        formContext.getAttribute(INSTALLATION_DATE_ATTRIBUTE)?.addOnChange(validateDates);

        // 2. Correr a validação no onLoad para verificar registos antigos que possam ter a data errada
        validateDates(executionContext);
    }

    function validateDates(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();

        // Apanhar os Atributos (Dados)
        const purchaseDateAttr = formContext.getAttribute(PURCHASE_DATE_ATTRIBUTE);
        const installationDateAttr = formContext.getAttribute(INSTALLATION_DATE_ATTRIBUTE);

        // Apanhar o Controlo da Purchase Date para mostrar a mensagem de erro lá
        const purchaseDateControl = formContext.getControl(PURCHASE_DATE_ATTRIBUTE) as Xrm.Controls.DateControl;

        if (!purchaseDateAttr || !installationDateAttr || !purchaseDateControl) return;

        // O getValue() de um campo de Data devolve um objeto Date do JavaScript
        const purchaseDate = purchaseDateAttr.getValue() as Date;
        const installationDate = installationDateAttr.getValue() as Date;

        // O ID único da nossa notificação para podermos limpá-la depois
        const notificationId = "date_validation_error";

        // Limpar sempre a notificação antes de validar (para apagar o erro se o utilizador corrigir a data)
        purchaseDateControl.clearNotification(notificationId);

        // Só fazemos a comparação se as DUAS datas estiverem preenchidas
        if (purchaseDate && installationDate) {
            // O getTime() converte a data para milissegundos, tornando a comparação à prova de bala
            if (purchaseDate.getTime() > installationDate.getTime()) {
                
                // Aplica a notificação vermelha no campo
                purchaseDateControl.setNotification("The Purchase Date cannot be after the Installation Date.", notificationId);
            }
        }
    }
}