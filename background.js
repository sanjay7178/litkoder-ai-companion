chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "generate") {
    generateCode(request.data, request.apiKey, request.model).then(generatedCode => {
      sendResponse({ generatedCode: generatedCode });
    });
    return true; // Indicates that the response is asynchronous
  }
});

async function generateCode(scrapedData, apiKey, model) {
  const apiUrl = "https://litcoder-server.saisanjay7660.workers.dev/api/generate";
  const sampleCode = await getSampleCode();
  const prompt = `sampleCode is ${sampleCode} and context is ${scrapedData.problemStatement}`;
  console.log(prompt);
  try {
    const response = await fetch(`${apiUrl}?prompt=${encodeURIComponent(prompt)}&apiKey=${apiKey}&model=${model}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data.response);
    return data.response || "Failed to generate code.";
  } catch (error) {
    console.error("Error generating code:", error);
    return "An error occurred while generating code.";
  }
}

async function getSampleCode() {
  try {
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url;

    // Fetch the content from the URL
    const response = await fetch(url);
    const content = await response.text();
    
    // Rest of the function remains the same
    const startIndex = content.indexOf('import java.io');
    if (startIndex === -1) {
      console.log("No Java code block found");
      return "";
    }

    let codeBlock = content.slice(startIndex);
    let braceCount = 0;
    let endIndex = 0;

    for (let i = 0; i < codeBlock.length; i++) {
      if (codeBlock[i] === '{') braceCount++;
      if (codeBlock[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIndex = i + 1;
          break;
        }
      }
    }

    codeBlock = codeBlock.slice(0, endIndex);
    console.log("Extracted Java code:");
    // console.log(codeBlock);
    return codeBlock;
  } catch (error) {
    console.error('Error:', error);
    return "";
  }
}
