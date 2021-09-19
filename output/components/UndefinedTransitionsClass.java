package components;

public class UndefinedTransitionsClass extends Result {
    public UndefinedTransitionsClass() { 
        super();
    }

	interface TaskRunner { 
        Result run(Result res);
    }

	private undefinedTaskClass UndefinedRunner = new undefinedTaskClass();

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
	public Result registrar_uma_transacao_runner() {

         TaskRunner[] runners = new TaskRunner[] { 
        
        };
        this.result = tasksRunner(runners, "and", this.result);
        return this.result;


       
        //Goes to state: Processar_entrada_na_api
    }





public Result rejeitar_a_transacao_runner(Result res) {

         TaskRunner[] runners = new TaskRunner[] { 
        
        };
        this.result = tasksRunner(runners, "and", this.result);
        return this.result;


    }

}