package components;

public class ChaincodeTransitionsClass extends Result {
    public ChaincodeTransitionsClass() { 
        super();
    }

	interface TaskRunner { 
        Result run(Result res);
    }

	private chaincodeTaskClass ChaincodeRunner = new chaincodeTaskClass();

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
	public Result executar_logica_de_negocio_runner() {

         TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return ChaincodeRunner.Executar_funcao_solicitada_task(res);}}
        };
        this.result = tasksRunner(runners, "and", this.result);
        return this.result;


       
        //Goes to state: output_state
    }


}