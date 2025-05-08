interface commentTokenDefinition{
    lineComment: string;
    blockCommentBegin: string; 
    blockCommentEnd: string; 
}

interface commentTokenDefinitions {
    [key: string]: commentTokenDefinition;
}

export const COMMENT_TOKEN_DEFINITIONS: commentTokenDefinitions = {
    "bat":        { lineComment: ":: ",   blockCommentBegin: "",                  blockCommentEnd: "" },
    "c":          { lineComment: "// ",   blockCommentBegin: "/* ",               blockCommentEnd: " */" },
    "cpp":        { lineComment: "// ",   blockCommentBegin: "/* ",               blockCommentEnd: " */" },
    "csharp":     { lineComment: "// ",   blockCommentBegin: "/* ",               blockCommentEnd: " */" },
    "css":        { lineComment: "",      blockCommentBegin: "/* ",               blockCommentEnd: " */" },
    "go":         { lineComment: "// ",   blockCommentBegin: "/* ",               blockCommentEnd: " */" },
    "html":       { lineComment: "",      blockCommentBegin: "<!-- ",             blockCommentEnd: "-->" },
    "java":       { lineComment: "// ",   blockCommentBegin: "/* ",               blockCommentEnd: " */" },
    "javascript": { lineComment: "// ",   blockCommentBegin: "/* ",               blockCommentEnd: " */" },
    "latex":      { lineComment: "% ",    blockCommentBegin: "\\begin{comment}",  blockCommentEnd: "\\end{comment}" },
    "lua":        { lineComment: "-- ",   blockCommentBegin: "--[[ ",             blockCommentEnd: "--]]" },
    "makefile":   { lineComment: "# ",    blockCommentBegin: "",                  blockCommentEnd: "" },
    "perl":       { lineComment: "# ",    blockCommentBegin: "=pod\n",            blockCommentEnd: "=cut" },
    "php":        { lineComment: "// ",   blockCommentBegin: "/* ",               blockCommentEnd: " */" },
    "powershell": { lineComment: "# ",    blockCommentBegin: "",                  blockCommentEnd: "" },
    "python":     { lineComment: "# ",    blockCommentBegin: "",                  blockCommentEnd: "" },
    "r":          { lineComment: "# ",    blockCommentBegin: "",                  blockCommentEnd: "" },
    "ruby":       { lineComment: "# ",    blockCommentBegin: "=begin\n",          blockCommentEnd: "=end" },
    "rust":       { lineComment: "// ",   blockCommentBegin: "/* ",               blockCommentEnd: " */" },
    "shellscript":{ lineComment: "# ",    blockCommentBegin: ": '",               blockCommentEnd: "'" },
    "sql":        { lineComment: "-- ",   blockCommentBegin: "/* ",               blockCommentEnd: " */" },
    "tex":        { lineComment: "% ",    blockCommentBegin: "\\begin{comment}",  blockCommentEnd: "\\end{comment}" },
    "typescript": { lineComment: "// ",   blockCommentBegin: "/* ",               blockCommentEnd: " */" },
    "xml":        { lineComment: "",      blockCommentBegin: "<!-- ",             blockCommentEnd: "-->" },
    "yaml":       { lineComment: "# ",    blockCommentBegin: "",                  blockCommentEnd: "" },
};
