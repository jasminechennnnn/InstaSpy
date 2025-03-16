import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

// custom CSS
const markdownStyles = `
  .markdown-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: #333;
  }
  
  .markdown-container h3 {
    font-size: 1.4rem;
    font-weight: 700;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    color: #312e81; /* Changed to indigo-900 color */
  }
  
  .markdown-container hr {
    border: 0;
    height: 1px;
    background-color: #e5e7eb;
    margin: 1.5rem 0;
  }
  
  .markdown-container ul {
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .markdown-container li {
    margin-bottom: 0.5rem;
  }
  
  .markdown-container p {
    margin-bottom: 1rem;
  }
  
  .markdown-container strong {
    font-weight: 700;
    color: #1f2937;
  }
  
  .markdown-container em {
    font-style: italic;
  }
  
  /* 特殊元素樣式 */
  .markdown-container .emoji {
    font-size: 1.2em;
    vertical-align: middle;
  }
  
  /* @ 標記的用戶名稱 */
  .markdown-container .username {
    color: #312e81; /* Changed to indigo-900 color */
    font-weight: 600;
    background-color: rgba(49, 46, 129, 0.1); /* Adjusted background to match indigo */
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
  }
`;

// 處理 @username 的正則表達式
const USERNAME_REGEX = /(@[\w\u4e00-\u9fa5]+)/g;

const CustomMarkdown = ({ content }) => {
  // 預處理內容，將 @username 替換為帶有特殊標記的內容
  const processedContent = content.replace(
    USERNAME_REGEX,
    match => `<span class="username">${match}</span>`
  );
  
  // custom render
  const components = {
    p: ({ node, ...props }) => <p className="mb-4" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-indigo-600 mt-6 mb-3" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
    li: ({ node, ...props }) => <li className="mb-2" {...props} />,
    hr: () => <hr className="my-6 border-gray-200" />,
    em: ({ node, ...props }) => <em className="italic" {...props} />,
    strong: ({ node, ...props }) => <strong className="font-bold text-gray-800" {...props} />
  };

  return (
    <>
      <style>{markdownStyles}</style>
      <div className="markdown-container prose max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={components}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    </>
  );
};

export default CustomMarkdown;