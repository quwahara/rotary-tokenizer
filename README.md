# rotary-tokenizer

This tokenizer aims to work for programing language like texts.

The text is like:
```
a = 'b = c'
```

The feature of this tokenizer is to switch definitions to tokenize in the
each context. The definition means a regular expression that what is a token.
For example, The regular expression:`[a-zA-Z]+` can be a definition of an
identifier. And the switch happens in case of this, when you are tokenizing
this: `a = 'b = c'`, so first '=' should be one token but second '=' should not.
The 'b = c' should be one token because it is quoted by single quotes.
In this case, the switch happens if the tokenizer gets into single quotes and
out. I guess you want to use different definition inside and outside of
single quotes.

## License

This product is distributed under The MIT License (MIT).

The sentence is below:

https://raw.githubusercontent.com/quwahara/rotary-tokenizer/master/LICENSE
