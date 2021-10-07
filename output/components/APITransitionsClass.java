package components;

public class ApiTransitionsClass {
    

	interface TaskRunner { 
        Result run(Result res);
    }

	private apiTaskClass ApiRunner = new apiTaskClass();

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

	public Result processar_entrada_na_api_runner(Result result) {

       
        if (result.locked()) { 
            return result;
        }
        
        TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return ApiRunner.Abort__input__task(res);}}
        };
        return tasksRunner(runners, "or", result);

       
        //Goes to state: Propor_transacao_a_rede
    }

	public Result propor_transacao_a_rede_runner(Result result) {

       result = verifyContinuation(result, "or" );
        if (result.locked()) { 
            return result;
        }
        
        TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return ApiRunner.Montar_proposta_de_transacao_task(res);}}
        };
        return tasksRunner(runners, "and", result);

       
        //Goes to state: Enviar_proposta_para_os_Peers
    }

	public Result enviar_proposta_para_os_peers_runner(Result result) {

       result = verifyContinuation(result, "and" );
        if (result.locked()) { 
            return result;
        }
        
        TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return ApiRunner.Calcular_peers_alvo_task(res);}},
		   new TaskRunner() {public Result run(Result res) {return ApiRunner.Enviar_proposta_para_os_peers_alvo_task(res);}}
        };
        return tasksRunner(runners, "and", result);

       
        //Goes to state: output_state
    }


	public Result receber_pool_de_resultados_runner(Result result) {

       
        if (result.locked()) { 
            return result;
        }
        
        return result;
       
        //Goes to state: Verificar_a_pool_de_resultados
    }

	public Result verificar_a_pool_de_resultados_runner(Result result) {

       result = verifyContinuation(result, "and" );
        if (result.locked()) { 
            return result;
        }
        
        return result;
       
        //Goes to state: Rejeitar_a_transacao
    }

	public Result rejeitar_a_transacao_runner(Result result) {

       result = verifyContinuation(result, "or" );
        if (result.locked()) { 
            return result;
        }
        
        TaskRunner[] runners = new TaskRunner[] { 
           new TaskRunner() {public Result run(Result res) {return ApiRunner.Enviar_erro_task(res);}}
        };
        return tasksRunner(runners, "and", result);

       
        //Goes to state: output_state
    }


	public Result enviar_transacao_assinada_para_o_orderer_runner(Result result) {

       result = verifyContinuation(result, "or" );
        if (result.locked()) { 
            return result;
        }
        
        return result;
       
        //Goes to state: Validar_assinaturas_do_bloco
    }

	public Result validar_assinaturas_do_bloco_continue_runner(Result result) {

       result = verifyContinuation(result, "and" );
        if (result.locked()) { 
            return result;
        }
        
        return result;
       
        //Goes to state: output_state
    }


}