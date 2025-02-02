<div align="center">
  <h1>LLM OCR Bob Plugin</h1>
</div>

## Introduction

The LLM OCR Bob Plugin is a next-generation intelligent OCR tool that transcends the limitations of traditional OCR technology. By leveraging the power of Large Language Models (LLMs), it achieves accurate recognition of complex documents. This plugin supports mixed content recognition (e.g., text, formulas, tables), multi-column layout parsing, and preserves the original document structure.

Traditional OCR plugins (such as Baidu OCR) have the following limitations:

-   Difficulty in handling complex layouts (e.g., two-column, vertical arrangements).
-   Difficulty in recognizing mixed content (e.g., text, formulas, tables).
-   Inability to preserve the original document structure.

**Key Features**

-   **Multimodal Parsing:** Accurately recognizes formulas, code, and tables in technical documents and academic papers.
-   **Intelligent Layout Handling:** Automatically processes complex layouts such as two-column and vertical arrangements.
-   **Multiple Model Support:** Compatible with OpenAI, Gemini, and other large model APIs that support the OpenAI format.
-   **Flexible Output Formats:** Supports Markdown, plain text, and custom template exports.

## Installation

1. Install [Bob](https://bobtranslate.com/guide/#%E5%AE%89%E8%A3%85) (version >= 1.8.0).
2. Download the plugin: [llm-ocr.bobplugin](https://github.com/Henry-Jessie/bob-plugin-llm-ocr/releases/latest).
3. Obtain an [OpenAI API Key](https://platform.openai.com/api-keys) or a [Google AI Studio API Key](https://aistudio.google.com/app/apikey).
4. Enter the API KEY in the plugin configuration (supports multiple KEYs for automatic load balancing).

## Core Functionality

### Multiple Recognition Modes

| Mode        | Use Case                  | Output Example                     |
| ----------- | ------------------------- | ---------------------------- |
| Markdown    | Academic papers/Technical documents         | Well-formatted Markdown with formulas/tables    |
| Plaintext   | Letters/Contracts/Ancient texts           | Plain text that preserves the original layout         |
| Custom      | Special format requirements             | Freely defined output structure             |

### Model Selection

-   **GPT-4o Mini:** Most cost-effective.
-   **GPT-4o:** High-precision recognition.
-   **Custom Model:** Compatible with other large model APIs that support the OpenAI format.

### Model Recommendation

-   **Highly recommend using the Gemini-2.0-Flash-Exp custom model, which provides recognition performance comparable to GPT-4o and offers a free quota of 1500 requests per day.**

**How to configure the Gemini-2.0-Flash-Exp custom model:**

1. **Obtain API Key:** Visit [Google AI Studio](https://aistudio.google.com/) to obtain an API Key.
2. **Configure the plugin:** Select "Custom Model" in the Bob plugin configuration and enter the following information:
    -   **Model Name:** `gemini-2.0-flash-exp`
    -   **Base URL:** `https://generativelanguage.googleapis.com`
    -   **Path:** `/v1beta/openai/chat/completions`

## Development Guide

If you need to develop your own OCR plugin, you can refer to the following steps:

### Environment Setup

1. Install type definitions:

    ```bash
    npm install --save-dev @bob-translate/types
    ```

2. Configure `tsconfig.json`:

    ```json
    {
      "compilerOptions": {
        "types": ["@bob-translate/types"]
      }
    }
    ```

### Development Documentation

Refer to the [Bob Plugin Development Documentation](https://bobtranslate.com/plugin/) for more information.

## Acknowledgements

The development of this project was inspired by the following excellent projects:

-   [bob-plugin-claude-translator](https://github.com/jtsang4/bob-plugin-claude-translator)
-   [bob-plugin-qwen-translator](https://github.com/simongino/bob-plugin-qwen-translator)