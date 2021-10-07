package components;

public class ChaincodeTransitionsClass {
    

	interface TaskRunner { 
        Result run(Result res);
    }

	private chaincodeTaskClass ChaincodeRunner = new chaincodeTaskClass();

	private Result tasksRunner (TaskRunner[] tasks, String relation, Result result){ 
        Result lastRes = result;
        for (TaskRunner run : tasks) { 
            Result res = run.run(lastRes);
            
            res = verifyContinuation(res, relation);
            
            lastRes.update(res);
            if (res.locked()) { 
                break;
            }
            
        }
        return lastRes;
    }
	private Result verifyContinuation(Result result, String relation) { 
        if ((result.isSuccess() && relation == "or") || (!result.isSuccess() && relation == "and")) { 
            result.lock();
        }

    return result;
}

	public Result executar_logica_de_negocio_runner(Result result) {

       
        if (result.locked()) { 
            return result;
        }
        
        TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return ChaincodeRunner.Executar_funcao_solicitada_task(res);}}
        };
        return tasksRunner(runners, "and", result);

       
        //Goes to state: output_state
    }


}