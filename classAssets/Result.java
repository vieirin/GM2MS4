package components;

import java.io.Serializable;

public class Result implements Serializable {

	private static final long serialVersionUID = 5018535970263352859L;

	private ErrorSignal error = null;
	private String component = "";
	private boolean success = false;
	private boolean isLocked = false;;
    private String result = "";
	
    public void setError(String error) {
    	System.out.println(error);
		this.error = new ErrorSignal(error, this.component);
		this.success = false;
		this.result = error;
	}
	
    public ErrorSignal getError() {
		return error;
	}
	
    public void setSuccess() {
		if (!isLocked) { 
			error = null;
			success = true;
	    	System.out.println("done with success");
		}
	}

	public void setSuccess(String result) { 
		if (!isLocked) { 
			success = true;
			this.result = result;
		}
		setSuccess();
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
	
	public void resetError() { 
		this.error = null;
		
	}

    public void setResult(String result) {
		if (!this.isLocked) { 
			this.result = result;
		}
	}
	
    public String getResult() {
		return result;
	}

	public void reset (Result res) { 
		this.error = res.error;
		this.success = res.success;
		this.isLocked = false;
		this.result = res.result;
	}

	public Result update(Result res) { 
		if (!this.isLocked) { 
			this.error = res.error;
			this.success = res.success;
			this.result = res.result;
		}
		return this;
	}

	public Result (String  component) { 
		this.component = component;
	}

	public Result (String  component, String initialState) { 
		result = initialState;
		this.component = component;
	}
	
	
	public void print() { 
		System.out.print("Succes: ");
		System.out.print(success);
		System.out.print(" Locked: ");
		System.out.print(isLocked);
		System.out.print(" Error: ");

		System.out.print(error != null ? error.error : "null" );
	}
}
