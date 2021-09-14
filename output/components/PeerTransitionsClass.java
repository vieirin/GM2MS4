package components;

public class PeerTransitionsClass extends Result {
    public PeerTransitionsClass() { 
        super();
    }

	interface TaskRunner { 
        Result run(Result res);
    }

	private peerTaskClass PeerRunner = new peerTaskClass();

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
	public Result calcular_resultado_da_transacao_runner() {

         TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return enviar_resultado_para_api_runner(res);}},
		   new TaskRunner() {public Result run(Result res) {return invocar_o_chaincode_runner(res);}}
        };

        this.result = tasksRunner(runners, "and", this.result);
        return this.result;
        //Goes to state: Invocar_o_chaincode
    }

	public Result invocar_o_chaincode_runner() {

         TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return executar_logica_de_negocio_runner(res);}}
        };

        this.result = tasksRunner(runners, "and", this.result);
        return this.result;
        //Goes to state: Executar_logica_de_negocio
    }


	public Result enviar_resultado_para_api_runner() {

         TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return PeerRunner.Enviar_resultado_para_api_task(res);}}
        };

        this.result = tasksRunner(runners, "and", this.result);
        return this.result;
        //Goes to state: output_state
    }


}