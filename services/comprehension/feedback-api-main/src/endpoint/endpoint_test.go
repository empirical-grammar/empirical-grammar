package endpoint

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"bytes"
	"encoding/json"
)

func TestPublishMessage(t *testing.T) {

	api_request := APIRequest{Entry: "more people vote", Prompt_id: 4, Session_id: "Asfasdf", Attempt: 2}
	request_json, _ := json.Marshal(api_request)
	json_string := bytes.NewBuffer(request_json)

	rr := httptest.NewRecorder()
	req := httptest.NewRequest("POST", "/", json_string)
	Endpoint(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Endpoint got response code %v, want %v", rr.Code, http.StatusOK)
	}
}
