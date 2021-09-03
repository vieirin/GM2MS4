package Models.java;

public class Result {
	private Error error = null;

	private boolean success = false;
	
    private String result = "";
	
    public void setError(Error error) {
		this.error = error;
	}
	
    public Error getError() {
		return error;
	}
	
    public void setSuccess(boolean success) {
		this.success = success;
	}
	
    public boolean isSuccess() {
		return success;
	}
	
    public void setResult(String result) {
		this.result = result;
	}
	
    public String getResult() {
		return result;
	}
	
	
}
