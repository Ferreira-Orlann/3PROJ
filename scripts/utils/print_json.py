import json
from pygments import highlight, lexers, formatters # type: ignore

def print_json(data: str):
    formatted_json = json.dumps(json.loads(data), indent=4, sort_keys=True)
    colorful_json = highlight(formatted_json, lexers.JsonLexer(), formatters.TerminalFormatter())
    print(colorful_json)