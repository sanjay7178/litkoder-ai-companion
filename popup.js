document.addEventListener('DOMContentLoaded', function () {
    const generateBtn = document.getElementById('generateBtn');
    const outputArea = document.getElementById('outputArea');
    const apiKeyInput = document.getElementById('apiKey');
    const saveApiKeyBtn = document.getElementById('saveApiKey');
    const modelSelect = document.getElementById('model');
    const spinner = document.getElementById('spinner');

    var jQueryScript = document.createElement('script');
    jQueryScript.setAttribute('src', 'https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js');
    document.head.appendChild(jQueryScript);

    // Load saved API key
    chrome.storage.sync.get(['apiKey', 'model'], function (result) {
        if (result.apiKey) apiKeyInput.value = result.apiKey;
        if (result.model) modelSelect.value = result.model;
    });

    saveApiKeyBtn.addEventListener('click', function () {
        const apiKey = apiKeyInput.value;
        const model = modelSelect.value;
        chrome.storage.sync.set({ apiKey: apiKey, model: model }, function () {
            console.log('API key and model saved');
        });
    });

    generateBtn.addEventListener('click', function () {
        // Show spinner and clear previous output
        spinner.style.display = 'block';
        outputArea.value = '';

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            console.log('Scraping data from the active tab');
            chrome.tabs.sendMessage(tabs[0].id, { action: "scrape" }, function (response) {
                if (response && response.data) {
                    chrome.storage.sync.get(['apiKey', 'model'], function (result) {
                        chrome.runtime.sendMessage({
                            action: "generate",
                            data: response.data,
                            apiKey: result.apiKey,
                            model: result.model
                        }, function (result) {
                            // Hide spinner and show result
                            spinner.style.display = 'none';
                            outputArea.value = result.generatedCode;
                        });
                    });
                } else {
                    // Hide spinner if there's an error
                    spinner.style.display = 'none';
                    outputArea.value = 'Error: Unable to scrape data';
                }
            });
        });
    });
});

