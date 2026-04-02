namespace Replacement.Main {

    const REPLACEMENT_TABLE = 'vtd_replacement';
    const REPLACEMENT_AUTOMATICALLY_CREATED_FLAG = 'vtd_automaticallycreated';

    export async function onLoad(executionContext: Xrm.Events.EventContext): Promise<void> {
        const formContext = executionContext.getFormContext();
        
        // 1. Defesa Pessoal: Verifica logo se o Common carregou (evita erros fatais de Form Library)
        if (typeof Common === "undefined") {
            console.error("ERRO: A biblioteca Common.Helper não foi encontrada nas Form Libraries deste formulário.");
            return; 
        }

        const formType = formContext.ui.getFormType();

        if (formType === Common.Helper.FORM_TYPES.CREATE) {
            return;
        } else {
            
            try {
                await Common.Helper.createAndShowToastNotification('This record has automatically populated data, please review and edit it.', 4);
                
                const recordId = formContext.data.entity.getId().replace(/[{}]/g, "");
                const dataToUpdate = {
                    [REPLACEMENT_AUTOMATICALLY_CREATED_FLAG]: false
                };

                // Se isto falhar, o "catch" apanha o erro suavemente!
                await Xrm.WebApi.updateRecord(REPLACEMENT_TABLE, recordId, dataToUpdate);
                
                formContext.getAttribute(REPLACEMENT_AUTOMATICALLY_CREATED_FLAG)?.setValue(false);

            } catch (error: any) {
                // Tenta apanhar a mensagem de várias formas que o Dataverse usa, ou converte o objeto inteiro para texto
                const errorMessage = error?.message || error?.raw || (error && JSON.stringify(error)) || "Erro desconhecido";
                
                console.error("Erro na Web API do Replacement: ", error);
                Xrm.Navigation.openAlertDialog({ text: "Developer Info - Ocorreu um erro: " + errorMessage });
            }
        }
    }
}