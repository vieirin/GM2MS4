package components;

public class ApiTransitionsClass extends Result {
    public ApiTransitionsClass() { 
        super();
    }

	interface TaskRunner { 
        Result run(Result res);
    }

	private apiTaskClass ApiRunner = new apiTaskClass();

	private Result result = new Result();

	private Result tasksRunner (TaskRunner[] tasks, String relation, Result result){ 
        Result lastRes = result;
        for (TaskRunner run : tasks) { 
            lastRes = run.run(lastRes);

            if ((lastRes.isSuccess() && relation == "or") || (!lastRes.isSuccess() && relation == "and")) { 
                return lastRes;
            } 

            if ((lastRes.isSuccess() && relation == "and") || (!lastRes.isSuccess() && relation == "or")) { 
                continue;
            }
        }
        return lastRes;
    }
	public Result processar_entrada_na_api_runner() {

         TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return ApiRunner.Abort__input__task(res);}}
        };

        this.result = tasksRunner(runners, "or", this.result);
        return this.result;
        //Goes to state: Propor_transacao_a_rede
    }

	public Result propor_transacao_a_rede_runner() {

         TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return ApiRunner.Montar_proposta_de_transacao_task(res);}}
        };

        this.result = tasksRunner(runners, "and", this.result);
        return this.result;
        //Goes to state: Enviar_proposta_para_os_Peers
    }

	public Result enviar_proposta_para_os_peers_runner() {

         TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return ApiRunner.Calcular_peers_alvo_task(res);}},
		   new TaskRunner() {public Result run(Result res) {return ApiRunner.Enviar_proposta_para_os_peers_alvo_task(res);}}
        };

        this.result = tasksRunner(runners, "and", this.result);
        return this.result;
        //Goes to state: output_state
    }


	public Result receber_pool_de_resultados_runner() {

         TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return verificar_a_pool_de_resultados_runner(res);}}
        };

        this.result = tasksRunner(runners, "and", this.result);
        return this.result;
        //Goes to state: Verificar_a_pool_de_resultados
    }

	public Result verificar_a_pool_de_resultados_runner() {

         TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return enviar_transacao_assinada_para_o_orderer_runner(res);}},
		   new TaskRunner() {public Result run(Result res) {return rejeitar_a_transacao_runner(res);}}
        };

        this.result = tasksRunner(runners, "or", this.result);
        return this.result;
        //Goes to state: Rejeitar_a_transacao
    }

	public Result rejeitar_a_transacao_runner() {

         TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return ApiRunner.Enviar_erro_task(res);}}
        };

        this.result = tasksRunner(runners, "and", this.result);
        return this.result;
        //Goes to state: output_state
    }


	public Result enviar_transacao_assinada_para_o_orderer_runner() {

         TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return validar_assinaturas_do_bloco_runner(res);}}
        };

        this.result = tasksRunner(runners, "and", this.result);
        return this.result;
        //Goes to state: Validar_assinaturas_do_bloco
    }


public Result criar_bloco_runner(Result res) {

         TaskRunner[] runners = new TaskRunner[] { 
        
        };

    }
}