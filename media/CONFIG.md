# Config
- ユーザは次の項目を好みに設定できます

    ### `commentBox.enableOneline`
    - ラインコメントの生成を許可します

    ### `commentBox.onelineSnippet`
    - ラインコメントを生成するためのスニペット(コメントを挟む文字列)を設定します
    - デフォルトは`---`です

    ### `commentBox.enableBoxed`
    - ブロックコメントの生成を許可します

    ### `commentBox.boxedSnippet`
    - ラインコメントを生成するためのスニペット(コメントを挟む文字列)を設定します
    - デフォルトは`===`です

    ### `commentBox.onelineCommentDefinition`
    - ラインコメントの水平線を構成する文字を指定します
    - 1文字での設定が想定されています
    - デフォルトは`-`が設定されているため，`-------` と生成されます

    ### `commentBox.boxedCommentDefinition.horizontal`
    - ブロックコメントの水平線を構成する文字を指定します
    - 1文字での設定が想定されています
    - デフォルトは`-`が設定されているため，`+-------+` と生成されます

    ### `commentBox.boxedCommentDefinition.corner`
    - ブロックコメントの垂直線を構成する文字を指定します
    - 1文字での設定が想定されています
    - デフォルトは`|`が設定されているため，縦線が`|` になります

    ### `commentBox.boxedCommentDefinition.corner`
    - ブロックコメントの角を構成する文字を指定します
    - 1文字での設定が想定されています
    - デフォルトは`+`が設定されているため，縦線が`+-------+` になります

    ### `commentBox.width`
    - **コメントの1行あたり最大文字数を設定します**
    - これを上回る文字数のコメントが入力された場合，改行されず無視されます

    ### `commentBox.fullCharacterWidth`
    - **フォントにおいて全角文字が半角文字何文字分かを指定します**
    - **デフォルトフォントを使用している場合，Ubuntuにおいては`1.6667`, Windowsにおいては`2`が適当です**