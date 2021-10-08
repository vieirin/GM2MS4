package components;

public class OrdererTransitionsClass {
    

	interface TaskRunner { 
        Result run(Result res);
    }

	private ordererTaskClass OrdererRunner = new ordererTaskClass();

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

	public Result validar_assinaturas_do_bloco_runner(Result result) {

       
        if (result.locked()) { 
            return result;
        }
        
        TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return rejeitar_a_transacao_runner(res);}}
        };
        return tasksRunner(runners, "or", "or", result);

       
        //Goes to state: Rejeitar_a_transacao
    }

public Result rejeitar_a_transacao_runner(Result result) {

        TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return OrdererRunner.Task_task(res);}}
        };
        return tasksRunner(runners, "and", "or", result);

    }
	public Result criar_bloco_runner(Result result) {

       result = verifyContinuation(result, "or" , true);
        if (result.locked()) { 
            return result;
        }
        
        TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return OrdererRunner.Adicionar_bloco_a_cadeia_task(res);}},
		   new TaskRunner() {public Result run(Result res) {return OrdererRunner.Notificar_a_rede_task(res);}}
        };
        return tasksRunner(runners, "and", "or", result);

       
        //Goes to state: output_state
    }


}