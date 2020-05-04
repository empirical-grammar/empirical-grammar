
package endpoint

import (
	"bytes"
	"net/http"
	"encoding/json"
	"io/ioutil"
	"fmt"
	"sync"
	"net/http/httputil"
)

const (
	automl_api = "https://comprehension-247816.appspot.com/feedback/ml"
	grammar_check_api = "https://us-central1-comprehension-247816.cloudfunctions.net/topic-grammar-API"
	plagiarism_api = "https://comprehension-247816.appspot.com/feedback/plagiarism"
	regex_rules_api = "https://comprehension-247816.appspot.com/feedback/rules/first_pass"
	spell_check_local = "https://us-central1-comprehension-247816.cloudfunctions.net/spell-check-cloud-function"
	spell_check_bing = "https://us-central1-comprehension-247816.cloudfunctions.net/bing-API-spell-check"
	feedback_history_url = "https://comprehension-247816.appspot.com/feedback/history"
	automl_index = 1
)

var wg sync.WaitGroup

var urls = [...]string{
	plagiarism_api,
	automl_api,
	regex_rules_api,
	grammar_check_api,
	spell_check_bing,
}

func Endpoint(responseWriter http.ResponseWriter, request *http.Request) {
	// need this for javascript cors requests
	// https://cloud.google.com/functions/docs/writing/http#functions_http_cors-go
	if request.Method == http.MethodOptions {
		responseWriter.Header().Set("Access-Control-Allow-Origin", "*")
		responseWriter.Header().Set("Access-Control-Allow-Methods", "POST")
		responseWriter.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		responseWriter.Header().Set("Access-Control-Max-Age", "3600")
		responseWriter.WriteHeader(http.StatusNoContent)
		return
	}

	requestDump, err := httputil.DumpRequest(request, true)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(string(requestDump))

	request_body, err := ioutil.ReadAll(request.Body)
	if err != nil {
		//TODO make this response in the same format maybe?
		http.Error(responseWriter, err.Error(), http.StatusInternalServerError)
		return
	}

	results := map[int]APIResponse{}

	c := make(chan InternalAPIResponse)

	for priority, url := range urls {
		go getAPIResponse(url, priority, request_body, c)
	}

	var returnable_result APIResponse

	for response := range c {
		results[response.Priority] = response.APIResponse
		return_index, returnable := processResults(results, len(urls), urls)

		if returnable {
			returnable_result = results[return_index]
			break
		}
	}

	// TODO make this a purely async task instead of coroutine that waits to finish
	wg.Add(1)
	go recordFeedback(request_body, returnable_result)

	responseWriter.Header().Set("Access-Control-Allow-Origin", "*")
	responseWriter.Header().Set("Content-Type", "application/json")
	json.NewEncoder(responseWriter).Encode(returnable_result)

	wg.Wait()
}

func getIndexOfElement(array [] string, element string) (int) {
	for i, v := range array {
		if v == element {
			return i
		}
	}
	return -1
}
// returns a typle of results index and that should be returned.
func processResults(results map[int]APIResponse, length int, urls []string) (int, bool) {
	for i := 0; i < len(results); i++ {
		result, has_key := results[i]
		if !has_key {
			return 0, false
		}

		if !result.Optimal {
			return i, true
		}
	}

	all_correct := len(results) >= length

	return automl_index, all_correct
}

func getAPIResponse(url string, priority int, json_params [] byte, c chan InternalAPIResponse) {
	response_json, err := http.Post(url, "application/json", bytes.NewReader(json_params))

	if err != nil {
		c <- InternalAPIResponse{Priority: priority, APIResponse: APIResponse{Feedback: "There was an error hitting the API", Optimal: false}}
		return
	}

	var result APIResponse

	if err := json.NewDecoder(response_json.Body).Decode(&result); err != nil {
		// TODO might want to think about what this should be.
		c <- InternalAPIResponse{Priority: priority, APIResponse: APIResponse{Feedback: "There was an JSON error", Feedback_type: err.Error(), Labels: url, Optimal: false}}
		return
	}

	c <- InternalAPIResponse{Priority: priority, APIResponse: result}
}

func recordFeedback(incoming_params [] byte, feedback APIResponse) {
	var request_object APIRequest

	// TODO convert the 'feedback' bytes and combine with incoming_params bytes
	// instead of transforming from bytes to object, combining, and then converting back to bytes
	if err := json.NewDecoder(bytes.NewReader(incoming_params)).Decode(&request_object); err != nil {
		return
	}

	history := HistoryAPIRequest{
		Entry: request_object.Entry,
		Prompt_id: request_object.Prompt_id,
		Session_id: request_object.Session_id,
		Attempt: request_object.Attempt,
		Feedback: feedback,
	}

	history_json, _ := json.Marshal(history)

	// TODO For now, just swallow any errors from this, but we'd want to report errors.
	http.Post(feedback_history_url, "application/json",  bytes.NewBuffer(history_json))
	wg.Done() // mark task as done in WaitGroup
}

type APIRequest struct {
	Entry string `json:"entry"`
	Prompt_text string `json:"prompt_text"`
	Prompt_id int `json:"prompt_id"`
	Session_id string `json:"session_id"`
	Attempt int `json:"attempt"`
}

type APIResponse struct {
	Feedback string `json:"feedback"`
	Feedback_type string `json:"feedback_type"`
	Optimal bool `json:"optimal"`
	Response_id string `json:"response_id"`
	Highlight []Highlight `json:"highlight"`
	Labels string `json:"labels,omitempty"`
}

type Highlight struct {
	Type string `json:"type"`
	Id int `json:"id,omitempty"`
	Text string `json:"text"`
	Category string `json:"category"`
	Character int `json:"character,omitempty"`
}

type InternalAPIResponse struct {
	Priority int
	APIResponse APIResponse
}

type HistoryAPIRequest struct {
	Entry string `json:"entry"`
	Prompt_id int `json:"prompt_id"`
	Session_id string `json:"session_id"`
	Attempt int `json:"attempt"`
	Feedback APIResponse `json:"feedback"`
}
