package components;

public class VerifierTransitionsClass {
    

	interface TaskRunner { 
        Result run(Result res);
    }

	private verifierTaskClass VerifierRunner = new verifierTaskClass();

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

	public Result registrar_uma_transacao_runner(Result result) {

       
        if (result.locked()) { 
            return result;
        }
        
        return result;
       
        //Goes to state: Processar_entrada_na_api
    }

	public Result processar_entrada_na_api_continue_runner(Result result) {

       result = verifyContinuation(result, "and" );
        if (result.locked()) { 
            return result;
        }
        
        return result;
       
        //Goes to state: output_state
    }


	public Result calcular_resultado_da_transacao_continue_runner(Result result) {

       result = verifyContinuation(result, "and" );
        if (result.locked()) { 
            return result;
        }
        
        return result;
       
        //Goes to state: output_state
    }


	public Result receber_pool_de_resultados_continue_runner(Result result) {

       result = verifyContinuation(result, "and" );
        if (result.locked()) { 
            return result;
        }
        
        return result;
       
        //Goes to state: output_state
    }


}