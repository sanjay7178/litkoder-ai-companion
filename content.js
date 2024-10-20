chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "scrape") {
    const problemStatement = document.querySelector('.problem-statement-box');
    const testCases = document.querySelectorAll('.problem-statement-box code');
    const explanations = document.querySelectorAll('.problem-statement-box p');

    const problemStatementText = problemStatement ? problemStatement.innerText : 'Problem statement not found';


    sendResponse({
      data: {
        problemStatement: problemStatementText,

      }
    });
  }
});