# Tree-sitter parser for Action Script

Inspired from [jcs090218/tree-sitter-actionscript](https://github.com/jcs090218/tree-sitter-actionscript) and the official [javascript grammar](https://github.com/tree-sitter/tree-sitter-javascript) for tree-sitter.

This grammar is tailored for parsing results of [jpexs-decompiler](https://github.com/jindrapetrik/jpexs-decompiler), so it may include non standard grammar and quirky stuff.

## Development

### Setup

```bash
yarn install
```

### Build

```bash
yarn build
```

Then you can parse a file using

```bash
tree-sitter parse file.as
```

### Testing

There is a corpus of test in [the test directory](test/corpus/).

To run the grammar against the corpus use:

```bash
yarn test
# OR, to build then test
yarn build-test
```

## Production

Use one of the binding for tree sitter to use this grammar in an external
software, for example the [python bindings](https://github.com/tree-sitter/py-tree-sitter).
