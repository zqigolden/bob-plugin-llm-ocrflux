<h4 align="right">
  <strong>简体中文</strong> | <a href="https://github.com/Henry-Jessie/bob-plugin-llm-ocr/blob/main/docs/README_EN.md">English</a>
</h4>

<div>
  <h1 align="center">LLM OCR Bob Plugin</h1>
</div>

## 简介

LLM OCR Bob 插件是一款新一代智能 OCR 工具，它突破了传统 OCR 技术的限制，利用大型语言模型 (LLM) 实现了对复杂文档的精准识别。该插件支持混合内容识别（如文本、公式、表格）、多栏排版解析，并且能够完整地保持原始文档的结构。

传统的 OCR 插件（例如百度 OCR）存在以下局限性：

-   难以处理复杂排版（如双栏、纵向排列等）
-   难以识别混合内容（如文本、公式、表格）
-   无法保持原始文档的结构

**特色功能**

-   **多模态解析：**  精准识别技术文档、学术论文中的公式、代码和表格。
-   **智能排版：**  自动处理双栏、纵向排列等复杂版式。
-   **多模型支持：**  兼容 OpenAI、Gemini 以及支持 OpenAI 格式的大模型 API。
-   **格式输出：**  支持 Markdown、纯文本以及自定义模板导出。

## 安装方法

1. 安装 [Bob](https://bobtranslate.com/guide/#%E5%AE%89%E8%A3%85) (版本 >= 1.8.0)
2. 下载插件: [llm-ocr.bobplugin](https://github.com/Henry-Jessie/bob-plugin-llm-ocr/releases/latest)
3. 获取 [OpenAI API Key](https://platform.openai.com/api-keys)（或其它兼容OPENAI API格式的平台API KEY）
4. 在插件配置中填入API KEY（支持多个KEY自动负载均衡）

## 核心功能

### 多场景识别模式
| 模式       | 适用场景                  | 输出示例                     |
|------------|-------------------------|----------------------------|
| Markdown   | 学术论文/技术文档         | 带公式/表格的规范Markdown    |
| Plaintext  | 普通文本                 | 保持原始版式的纯文本         |
| Custom     | 特殊格式需求             | 自由定义输出结构             |


### 模型选择

-   **GPT-4o Mini：**  性价比最优。
-   **GPT-4o：**  高精度识别。
-   **自定义模型：**  兼容 OpenAI 格式的其他大模型 API。

### 模型推荐

-   **强烈推荐使用 Gemini-2.0-Flash-Exp 自定义模型，其识别效果媲美 GPT-4o，同时提供每天 1500 次的免费额度。**

**如何配置 Gemini-2.0-Flash-Exp 自定义模型：**

1. **获取 API Key：**  访问 [Google AI Studio](https://aistudio.google.com/) 获取 API Key。
2. **配置插件：**  在 Bob 插件配置中选择"自定义模型"，并输入以下信息：
    -   **模型名称：**  `gemini-2.0-flash-exp`
    -   **Base URL：**  `https://generativelanguage.googleapis.com`
    -   **Path：**  `/v1beta/openai/chat/completions`

## 开发指南

如果需要开发自己的 OCR 插件，可以参考以下步骤：

### 环境准备

1. 安装类型定义：

    ```bash
    npm install --save-dev @bob-translate/types
    ```

2. 配置 `tsconfig.json`：

    ```json
    {
      "compilerOptions": {
        "types": ["@bob-translate/types"]
      }
    }
    ```

### 开发文档
参考 [Bob Plugin Development Docs](https://bobtranslate.com/plugin/) 和 [Bob Plugin Types Docs](https://github.com/liby/bob-translate-types) 了解更多信息。


## 感谢

本项目的开发受到以下优秀项目的启发：

-   [bob-plugin-claude-translator](https://github.com/jtsang4/bob-plugin-claude-translator)
-   [bob-plugin-qwen-translator](https://github.com/simongino/bob-plugin-qwen-translator)

