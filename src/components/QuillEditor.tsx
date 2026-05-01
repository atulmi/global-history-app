import React, { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const TOOLBAR = [
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["clean"],
];

type Props = {
  value: string;
  onChange: (value: string) => void;
  "data-testid"?: string;
};

const QuillEditor: React.FC<Props> = ({ value, onChange, "data-testid": testId }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const onChangeRef = useRef(onChange);
  const internalValueRef = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Clear any remnants from a previous mount (Strict Mode double-invoke).
    // Quill inserts the toolbar as a sibling *before* its target element inside
    // the wrapper, so wiping wrapper.innerHTML removes both toolbar and container.
    wrapper.innerHTML = "";

    // Give Quill a fresh target div rather than the wrapper itself, so the
    // wrapper stays as the stable cleanup boundary.
    const target = document.createElement("div");
    wrapper.appendChild(target);

    const quill = new Quill(target, {
      theme: "snow",
      modules: { toolbar: TOOLBAR },
    });

    quill.clipboard.dangerouslyPasteHTML(internalValueRef.current);

    quill.on("text-change", () => {
      const html = quill.root.innerHTML;
      internalValueRef.current = html;
      onChangeRef.current(html);
    });

    quillRef.current = quill;

    return () => {
      quillRef.current = null;
      wrapper.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    if (!quillRef.current || value === internalValueRef.current) return;
    internalValueRef.current = value;
    quillRef.current.clipboard.dangerouslyPasteHTML(value);
  }, [value]);

  return <div ref={wrapperRef} data-testid={testId} />;
};

export default QuillEditor;
