package components;

public class ChaincodeTransitionsClass {
    

	interface TaskRunner { 
        Result run(Result res);
    }

	private chaincodeTaskClass ChaincodeRunner = new chaincodeTaskClass();

	private Result tasksRunner (TaskRunner[] tasks, String relation,  String parentRelation,Result result){ 
        Result lastRes = result;
        for (TaskRunner run : tasks) { 
            Result res = run.run(lastRes);
            
            res = verifyContinuation(res, relation, parentRelation == "and");
            
            lastRes.update(res);
            if (res.locked()) { 
                break;
            }
            
        }
        return lastRes;
    }
	private Result verifyContinuation(Result result, String relation, boolean canLock) { 
        if (((result.getError() == null && result.isSuccess())&& relation == "or") || ((result.getError() != null && !result.isSuccess())&& relation == "and")) { 
            if (canLock) { 
                result.lock();
            }
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
        return tasksRunner(runners, "and", "and", result);

       
        //Goes to state: output_state
    }


}