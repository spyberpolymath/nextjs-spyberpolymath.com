'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic<any>(
  () => import('react-quill-new'),
  {
    ssr: false,
    loading: () => <div style={{ padding: 12, color: '#b0f5e6' }}>Loading editor...</div>
  }
);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, style }) => {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'indent', 'script', 'direction',
    'color', 'background', 'align', 'link', 'image', 'video'
  ];

  return (
    <div style={style}>
      <ReactQuill
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Start writing...'}
        theme="snow"
      />
    </div>
  );
};

export default RichTextEditor;