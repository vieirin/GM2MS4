package components;

public class OrdererTransitionsClass {
    

	interface TaskRunner { 
        Result run(Result res);
    }

	private ordererTaskClass OrdererRunner = new ordererTaskClass();

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

	public Result validar_assinaturas_do_bloco_runner(Result result) {

       
        if (result.locked()) { 
            return result;
        }
        
        TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return rejeitar_a_transacao_runner(res);}}
        };
        return tasksRunner(runners, "or", result);

       
        //Goes to state: Rejeitar_a_transacao
    }

public Result rejeitar_a_transacao_runner(Result result) {

        TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return OrdererRunner.Task_task(res);}}
        };
        return tasksRunner(runners, "and", result);

    }
	public Result criar_bloco_runner(Result result) {

       result = verifyContinuation(result, "or" );
        if (result.locked()) { 
            return result;
        }
        
        TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return OrdererRunner.Notificar_a_rede_task(res);}},
		   new TaskRunner() {public Result run(Result res) {return OrdererRunner.Adicionar_bloco_a_cadeia_task(res);}}
        };
        return tasksRunner(runners, "and", result);

       
        //Goes to state: output_state
    }


}