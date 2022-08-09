# Reproducing Atom's One Dark UI

The One Dark UI theme [depends on the syntax theme](https://github.com/atom/atom/tree/master/packages/one-dark-ui#faq), Lucario in our case.

In particular, the base background color is the syntax background color. Lucario defines its `*Selection` color for that.  Most every other UI color is derived from this color.

## Tracing ~~back~~ forward the color variables for One Dark + Lucario

This is the math, with references to the code on GitHub.

I have cross-checked the hex values with Atom DevTools, inspecting UI elements to find their color-related styles.

`selection := #19242f =~ hsl(210°,31%,14%) ` — [reference (Lucario)](https://github.com/raphamorim/lucario/blob/6708a94a233f7d951e04ce5c33942b27accd8bbe/styles/colors.less#L3)

`syntax-background-color := Selection` — [reference (Lucario)](https://github.com/raphamorim/lucario/blob/6708a94a233f7d951e04ce5c33942b27accd8bbe/styles/syntax-variables.less)

`ui-syntax-color := syntax-background-color = Selection` — [reference](https://github.com/atom/atom/blob/17a31e3a3729070768f31bbce7ce9bcc09f5a2b8/packages/one-dark-ui/styles/ui-variables-custom.less#L7)

`ui-fg := ui-syntax-color { saturation = 18%, lightness = 66% } =~ #99a8b8 ` — [reference](https://github.com/atom/atom/blob/17a31e3a3729070768f31bbce7ce9bcc09f5a2b8/packages/one-dark-ui/styles/ui-variables-custom.less#L37)

`ui-bg := ui-syntax-color = Selection` 

`ui-border := ui-syntax-color { lightness * 0,6 = 8.46% } =~ #0f161c`

`base-background-color := ui-bg = Selection` — [reference](https://github.com/atom/atom/blob/4a8321eadb2422aec2592c4084af203325428755/packages/one-dark-ui/styles/ui-variables.less#L38)

`base-border-color := ui-border`

`level-1-color := base-background-color { lightness + 6 = 20% } =~ #243343` — [reference](https://github.com/atom/atom/blob/17a31e3a3729070768f31bbce7ce9bcc09f5a2b8/packages/one-dark-ui/styles/ui-variables-custom.less#L61)

`level-2-color := base-background-color = Selection`

`level-3-color := base-background-color { lightness - 3 = 11% } =~ #141c25`

`level-3-color-hover := level-3-color { lightness + 6 = 17% } =~ #1e2c39`

`level-3-color-active := level-3-color { lightness + 3 = 14% } = selection`

`button-background-color := level-1-color` — [reference](https://github.com/atom/atom/blob/4a8321eadb2422aec2592c4084af203325428755/packages/one-dark-ui/styles/ui-variables.less#L61) [^1]

`button-background-color-hover := button-bg-color { lightness + 2 = 22% } =~ #27384a` [^1]

`text-color := ui-fg` — [reference](https://github.com/atom/atom/blob/4a8321eadb2422aec2592c4084af203325428755/packages/one-dark-ui/styles/ui-variables.less#L14)

`text-color-subtle := text-color { alpha - 40% = 60% } =~ #99a8b899`

`text-color-highlight := text-color { lightness + 20% = 86% } =~ #d5dbe2` 

`text-color-selected := white =~ #fff` 

**#todo:** accent-color, text-color-warning, error, ignored, modified, level-1-color gradient avg, etc.

[^1]: `level-1-color` and its variations are only used in buttons, with a gradient. So I want to use the gradient's average.

## Translation to our variables

We're also doing `kebab-case` variable names, to differentiate them from the `PascalCase` names for base / syntax colors. Also, cause they're easier to type. 😝

`level-1-color -> bg-lv-1`

`level-2-color -> bg-lv-2`

`level-3-color -> bg-lv-3`

`level-N-hover -> bg-lv-N-hover`

`level-N-active -> bg-lv-N-active`

`button-background-color[-XYZ] -> bg-lv-1[-XYZ]`

`base-border-color -> border-base`

`text-color -> fg-base`

`text-color-subtle -> fg-subtle`

`text-color-highlight -> fg-highlight`

`text-color-selected -> fg-selected`
