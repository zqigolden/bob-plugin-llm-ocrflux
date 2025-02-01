//@ts-check

var lang = require('./lang.js');

function supportLanguages() {
  return lang.supportLanguages.map(([standardLang]) => standardLang);
}

/**
 * @param {string} apiKey - The authentication API key.
 * @returns {{
 * "Authorization": string;
 * "Content-Type": string;
 * }} The header object.
 */
function buildHeader(apiKey) {
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

/**
 * @param {Bob.TranslateQuery} query
 * @param {Bob.HttpResponse} result
 * @returns {void}
 */
function handleError(query, result) {
  const { statusCode } = result.response;
  const reason = statusCode >= 400 && statusCode < 500 ? 'param' : 'api';
  const errorMessage =
    result.data && result.data.detail ? result.data.detail : '接口响应错误';

  // Enhanced error logging
  $log.error(`Translation error: ${errorMessage}. Status code: ${statusCode}. Full response: ${JSON.stringify(result)}`);

  query.onCompletion({
    error: {
      type: reason,
      message: `${errorMessage}`,
      addtion: JSON.stringify(result),
    },
  });
}
/**
 * Generates OCR-specific prompt with Markdown formatting requirements
 * @returns {string} 
 */
function createUserPrompt() {
  return $option.ocrUserPrompt || `Accurately extract all content from the image including:
- Text (preserve original languages)
- Mathematical equations (convert to LaTeX)
- Tables (format as Markdown tables)
- Document structure (use headings and sections)

Convert everything to clean Markdown format while:
1. Maintaining original language(s) and layout
2. Preserving exact numerical values and symbols
3. Using $$ LaTeX $$ for equations
4. Creating Markdown tables for tabular data
5. Never adding interpretations or explanations`;
}

function createSystemPrompt() {
  return $option.ocrSystemPrompt || `You are a helpful assistant that can accurately extract and convert content from images into clean Markdown format.`;
}

/**
 * 构建请求体
 * @param {string} imageUrl - 图片的URL
 * @returns {Object} 请求体
 */
function buildBody(imageUrl) {
  return {
    model: $option.visionModel || 'gpt-4o-mini',
    messages: [{
      role: 'system',
      content: createSystemPrompt(),
    }, {
      role: 'user',
      content: [{
        type: 'text',
        text: createUserPrompt()
      }, {
        type: 'image_url',
        image_url: {
          url: imageUrl
        }
      }]
    }]
  };
}


/**
 * OCR文字识别功能实现
 * @param {Bob.OcrQuery} query
 * @param {Bob.Completion} completion
 */
async function ocr(query, completion) {
  try {
    const imageData = query.image;

    const base64Image = imageData.toBase64();
    if (!base64Image) {
      return completion({
        error: {
          type: 'param',
          message: '图片数据转换失败',
          addtion: JSON.stringify({ status: 400 })
        },
      });
    }

    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    const {apiKeys} = $option;
    if (!apiKeys) {
      return completion({
        error: {
          type: 'secretKey',
          message: '配置错误 - 未填写 API Keys',
          addtion: '请在插件配置中填写 API Keys',
        },
      });
    }
    const apiKeySelection = apiKeys.split(',').map((key) => key.trim());
  
    if (!apiKeySelection.length) {
        return completion({
            error: {
                type: 'secretKey',
                message: '配置错误 - 未填写 API Keys',
                addtion: '请在插件配置中填写 API Keys',
            },
        });
    }
  
  
    const apiKey =
      apiKeySelection[Math.floor(Math.random() * apiKeySelection.length)];

    const header = buildHeader(apiKey);
    const body = buildBody(imageUrl);

    const baseUrl = ($option.apiUrl || "https://api.openai.com").replace(/\/$/, "");
    const urlPath = ($option.apiUrlPath || "/v1/chat/completions").replace(/^\//, "");
    const fullUrl = `${baseUrl}/${urlPath}`;
    $http.request({
      method: 'POST',
      url: fullUrl,
      header,
      body,
      handler: (result) => {
        if (result.error || result.response.statusCode >= 400) {
          completion({
            error: {
              type: 'api',
              message: result.data?.error?.message || 'OCR请求失败',
              addtion: JSON.stringify(result),
            },
          });
          return;
        }
        
        try {
          if (!result.data || !result.data.choices || !result.data.choices[0] || !result.data.choices[0].message) {
            completion({
              error: {
                type: 'api',
                message: '未获取到有效的识别结果',
                addtion: JSON.stringify(result),
              },
            });
            $log.error(`未获取到有效的识别结果: ${JSON.stringify(result)}`);
            return;
          }
          const text = result.data.choices[0].message.content;
          completion({
            result: {
              texts: [{ text }],
              from: query.detectFrom
            },
          });
        } catch (e) {
          completion({
            error: {
              type: 'api',
              message: '响应解析失败',
              addtion: JSON.stringify(result),
            },
          });
        }
      }
    });
  } catch (error) {
    completion({
      error: {
        type: error._type || 'unknown',
        message: error._message || '未知错误',
        addtion: error._addition
      }
    });
  }
}

exports.supportLanguages = supportLanguages;
exports.ocr = ocr;