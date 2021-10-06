package components;

public class Result {
	private ErrorSignal error = null;
	private String component = "";
	private boolean success = false;
	private boolean isLocked = false;
    private String result = "";
	
    public void setError(String error) {
		this.error = new ErrorSignal(error, this.component);
	}
	
    public ErrorSignal getError() {
		return error;
	}
	
    public void setSuccess(boolean success) {
		if (!this.isLocked) { 
			this.success = success;

		}
	}

	public void lock() { 
		this.isLocked = true;
	}
	
    public boolean isSuccess() {
		return success;
	}
	
    public void setResult(String result) {
		if (!this.isLocked) { 
			this.result = result;
		}
	}
	
    public String getResult() {
		return result;
	}


	protected Result (String  component) { 
		this.component = component;
	}

	
	public Result (Result result) { 
		this.isLocked = result.isLocked;
		this.component = result.component;
		this.error = result.error;
		this.result = result.result;
		this.success = result.success;
	}
}
