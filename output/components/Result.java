package components;

import java.io.Serializable;

public class Result implements Serializable {

	private static final long serialVersionUID = 5018535970263352859L;

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

    public boolean locked() { 
		return this.isLocked;
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

	public void reset () { 
		this.error = null;
		this.success = false;
		this.isLocked = false;
		this.result = "";
	}

	public Result update(Result res) { 
		if (!this.isLocked) { 
			this.error = res.error;
			this.success = res.success;
			this.isLocked = res.isLocked;
			this.result = res.result;
		}
		return this;
	}

	public Result (String  component) { 
		this.component = component;
	}
}
