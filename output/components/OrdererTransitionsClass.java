package components;

public class OrdererTransitionsClass extends Result {
    public OrdererTransitionsClass() { 
        super();
    }

	interface TaskRunner { 
        Result run(Result res);
    }

	private ordererTaskClass OrdererRunner = new ordererTaskClass();

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
	public Result validar_assinaturas_do_bloco_runner() {

         TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return criar_bloco_runner(res);}},
		   new TaskRunner() {public Result run(Result res) {return rejeitar_a_transacao_runner(res);}}
        };

        this.result = tasksRunner(runners, "or", this.result);
        return this.result;
        //Goes to state: Rejeitar_a_transacao
    }

	public Result rejeitar_a_transacao_runner() {

         TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return OrdererRunner.Task_task(res);}}
        };

        this.result = tasksRunner(runners, "and", this.result);
        return this.result;
        //Goes to state: output_state
    }


public Result criar_bloco_runner(Result res) {

         TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return Notificar_a_rede_task(res);}},
		   new TaskRunner() {public Result run(Result res) {return Adicionar_bloco_a_cadeia_task(res);}}
        };

    }
}