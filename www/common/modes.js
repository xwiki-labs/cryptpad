define([
    '/code/orgmode.js'
], function () {
    var Modes = {};

    // mode language (extension)
    var list = Modes.list = [
        "APL apl .apl",
        "ASCII-Armor asciiarmor",
        "ASN.1 asn.1",
        "Asterisk asterisk",
        "Brainfuck brainfuck .b",
        "C-like clike",
        "Clojure clojure",
        "CMake cmake",
        "COBOL cobol",
        "CoffeeScript coffeescript",
        "Common_Lisp commonlisp",
        "Crystal crystal",
        "CSS css .css",
        "Cypher cypher",
        "D d",
        "Dart dart",
        "Diff diff",
        "Django django",
        "Dockerfile dockerfile",
        "DTD dtd",
        "Dylan dylan",
        "EBNF ebnf",
        "ECL ecl",
        "Eiffel eiffel",
        "Elm elm .elm",
        "Erlang erlang",
        "Factor factor",
        "FCL fcl",
        "Forth forth",
        "Fortran fortran",
        "GAS gas",
        "Gherkin gherkin",
        "Go go",
        "Groovy groovy",
        "Haml haml",
        "Handlebars handlebars",
        "Haskell haskell .hs",
        "Haskell-Literate haskell-literate",
        "Haxe haxe",
        "HTML htmlmixed .html",
        "HTTP http",
        "IDL idl",
        "JADE jade",
        "JavaScript javascript .js",
        "Jinja2 jinja2",
        "JSX jsx .jsx",
        "Julia julia",
        "LiveScript livescript",
        "Lua lua",
        "Markdown gfm .md",
        //"markdown markdown .md",
        "Mathematica mathematica",
        "mIRC mirc",
        "ML mllike",
        "Modelica modelica",
        "MscGen mscgen",
        "MUMPS mumps",
        "Nginx nginx",
        "NSIS nsis",
        "N-Triples ntriples",
        "Octave octave",
        "Org-mode orgmode .org",
        "Oz oz",
        "Pascal pascal",
        "PEG.js pegjs",
        "Perl perl",
        "PHP php",
        "Pig pig",
        "PowerShell powershell",
        "Properties properties",
        "Protocol_Buffers protobuf",
        "Puppet puppet",
        "Python python .py",
        "Q q",
        "R r",
        "RPM rpm",
        "RST rst",
        "Ruby ruby",
        "Rust rust",
        "Sass sass",
        "Scheme scheme .scm",
        "Shell shell .sh",
        "Sieve sieve",
        "Slim slim",
        "Smalltalk smalltalk",
        "Smarty smarty",
        "Solr solr",
        "Soy soy",
        "SPARQL sparql",
        "Spreadsheet spreadsheet",
        "SQL sql",
        "sTeX stex",
        "Stylus stylus",
        "Swift swift",
        "Tcl tcl",
        "Text text .txt",
        "Textile textile",
        "TiddlyWiki tiddlywiki",
        "Tiki tiki",
        "TOML toml",
        "Tornado tornado",
        "troff troff",
        "TTCN ttcn",
        "TTCN-cfg ttcn-cfg",
        "Turtle turtle",
        "Twig twig",
        "Visual_Basic vb",
        "VBScript vbscript",
        "Velocity velocity",
        "Verilog verilog",
        "VHDL vhdl",
        "Vue vue",
        "XML xml",
        //"xwiki xwiki21",
        "XQuery xquery",
        "YAML yaml .yaml",
        "YAML_Frontmatter yaml-frontmatter",
        "Z80 z80"
    ].map(function (line) {
        var kv = line.split(/\s/);
        return {
            language: kv[0].replace(/_/g, ' '),
            mode: kv[1],
            ext: kv[2],
        };
    });

    Modes.extensionOf = function (mode) {
        var ext = '';
        list.some(function (o) {
            if (o.mode !== mode) { return; }
            ext = o.ext || '';
            return true;
        });
        return ext;
    };

    return Modes;
});
