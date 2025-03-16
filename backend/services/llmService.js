const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// LLM service function - analyze Instagram followee list
// @param {string} targetUsername
// @param {Array} followeeList
// @param {string} model - model select from ('claude', 'gemini')
exports.analyzeFollowees = async (targetUsername, followeeList, model = 'gemini') => {
  try {
    // Create prompt for analysis
    const prompt = `
格式：
- 結果請回傳markdown格式，有清楚明瞭的排版，不要擠在一起
- 提到帳號名稱（純英文的那個）的時候前面要加個“＠”，並用別的顏色注記，可能用個深藍色
- 不同主題的分析，請用邊匡隔開，並加入多一點換行符號

分析以下 Instagram 用戶的關注清單，並提供該用戶的興趣、喜好、性格特徵和社交圈分析。
用戶: ${targetUsername}
關注帳號列表: ${followeeList.join(', ')}
講話風格有趣一點，請用繁體中文回答，可以的話用一些emoji不錯，有重點、有趣最重要。

根據這個 followee list，以極我提供給你的用戶名稱（如果是有名的人你應該會看得出來），分析這個人的興趣、性格和社交圈，結果請用輕鬆的語氣，並分為「興趣」「性格」「社交圈」三段。
在這三段中，請用列點的方式點出各重點類別（項目）或小標題，再解釋，這樣比較好看。  
特別注意：  
- 這個list的主人可能是男或女，也可能是一隻動物、一個團體，甚至也有可能他本身就是idol，所以需要你先確認身份，再開始進行合理的推論。對了，不用把我給你的提示詞很白痴的都寫出來，你要有自己順暢的表達方式
- 在「興趣」中，包含對名人（如明星、音樂家）、網紅或寵物帳號、香氛、花店、美甲、服飾店，並分析這些反映的喜好。或是分析他的工作領域？（例如喜歡寫程式？喜歡做什麼？）
- 在「興趣」中，可以嘗試分析這個人是否喜歡關注直播主、啦啦隊、或是一些裸露沒腦的瞎妹帳號（如果沒發現蹤跡就不用特別說明，不然有點難看）
- 在「興趣」中，順便推測這個人的風格和審美偏好
- 在「性格」中，根據關注的帳號類型推測可能的性格特徵，但避免過度假設人際互動細節。可以推測他會有什麼特點（例如是不是某個男的追蹤一堆正妹）
- 在「社交圈」中，僅分析可能與他有真實社交關係的對象（如朋友、同學、社團），避免將名人或網紅帳號誤判為社交圈一部分，並謹慎推測關係親密程度，只根據清單內容合理描述。  
- 在「社交圈」中，可以根據關注帳號推測他讀書的地區，甚至學校; 也可以藉由追蹤對象的名稱相似度，來推測他和哪些人熟
`
;

    // Use selected model for analysis
    switch (model.toLowerCase()) {
      case 'gemini':
        return await callGeminiAPI(prompt);
      case 'claude':
      default:
        return await callClaudeAPI(prompt);
    }
  } catch (error) {
    console.error(`LLM API error (${model}):`, error.response?.data || error.message);
    throw new Error(`LLM API error: ${error.message}`);
  }
};

// Call Claude API (Anthropic)
async function callClaudeAPI(prompt) {
  const response = await axios.post(
    process.env.ANTHROPIC_API_URL,
    {
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    }
  );

  return response.data.content[0].text;
}

// Call Gemini API (Google)
// model list: https://ai.google.dev/gemini-api/docs/models/gemini?hl=zh-tw
// api tutorial: https://ai.google.dev/gemini-api/docs/get-started/tutorial?hl=zh-tw&lang=node
async function callGeminiAPI(prompt) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  console.log(response.text());

  return response.text();
}