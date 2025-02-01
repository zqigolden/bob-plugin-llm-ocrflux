//@ts-check

var lang = require('./lang.js');

function supportLanguages() {
  return lang.supportLanguages.map(([standardLang]) => standardLang);
}

function buildHeader(apiKey) {
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}


function createUserPrompt() {
  if ($option.ocrMode === 'custom') {
    return $option.ocrUserPrompt 
  }
  else if ($option.ocrMode === 'markdown') {
    return `Accurately extract all content from the image including:
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
  } else {
    return `Please accurately identify the text content in the image:
- Preserve the original language (retain the original arrangement in multilingual contexts)
- Keep all special symbols, numbers, and punctuation
- Maintain the original layout structure (paragraphs, line breaks, indentations, etc.)`;
  }
}

function createSystemPrompt() {
  if ($option.ocrMode === 'custom') {
    return $option.ocrSystemPrompt 
  }
  else if ($option.ocrMode === 'markdown') {
    return `You are a helpful assistant that can accurately extract and convert content from images into clean Markdown format.`;
  } else {
    return `You are a helpful assistant that can accurately extract and convert content from images into clean plaintext.`;
  }
}


function buildBody(imageUrl) {
  let model = '';
  if ($option.visionModel === 'custom') {
    model = $option.custom_model_name;
  } else {
    model = $option.visionModel;
  }
  return {
    model: model,
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
          let errorMessage = 'OCR请求失败';
          
          // 处理网络层错误
          if (result.error) {
            errorMessage = `网络请求失败: ${result.error.code || '未知错误码'}`;
            if (result.data?.error?.message) {
              errorMessage += `: ${result.data.error.message}`
            }
          }
          // 处理HTTP错误响应
          else if (result.response) {
            const statusCode = result.response.statusCode;
            const statusText = statusCode || '未知错误';
            errorMessage = `HTTP错误 ${statusCode} (${statusText})`;
            
            // 添加详细的错误信息
            const details = [];
            if (result.data?.error?.message) {
              details.push(`错误信息: ${result.data.error.message}`);
            }
            if (result.data?.error?.debugMessage) {
              details.push(`调试信息: ${result.data.error.debugMessage}`);
            }
            
            // 添加完整的响应体信息
            details.push(`完整响应: ${JSON.stringify(result.data, null, 2)}`);
            
            // 记录详细日志
            $log.error(`请求失败:\n状态码: ${statusCode}\n状态描述: ${statusText}\n${details.join('\n')}`);
            
            if (details.length > 0) {
              errorMessage += `\n${details.join('\n')}`;
            }
          }

          completion({
            error: {
              type: 'api',
              message: errorMessage,
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