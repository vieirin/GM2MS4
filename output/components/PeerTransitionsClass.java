package components;

public class PeerTransitionsClass {
    

	interface TaskRunner { 
        Result run(Result res);
    }

	private peerTaskClass PeerRunner = new peerTaskClass();

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

	public Result calcular_resultado_da_transacao_runner(Result result) {

       
        if (result.locked()) { 
            return result;
        }
        
        return result;
       
        //Goes to state: Invocar_o_chaincode
    }

	public Result invocar_o_chaincode_runner(Result result) {

       result = verifyContinuation(result, "and" , true);
        if (result.locked()) { 
            return result;
        }
        
        return result;
       
        //Goes to state: Executar_logica_de_negocio
    }

	public Result executar_logica_de_negocio_continue_runner(Result result) {

       result = verifyContinuation(result, "and" , true);
        if (result.locked()) { 
            return result;
        }
        
        return result;
       
        //Goes to state: output_state
    }


	public Result enviar_resultado_para_api_runner(Result result) {

       result = verifyContinuation(result, "and" , true);
        if (result.locked()) { 
            return result;
        }
        
        TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return PeerRunner.Enviar_resultado_para_api_task(res);}}
        };
        return tasksRunner(runners, "and", "and", result);

       
        //Goes to state: output_state
    }


}