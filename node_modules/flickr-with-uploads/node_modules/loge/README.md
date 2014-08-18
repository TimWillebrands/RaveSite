# loge

My very own Node.js logging library! Crazy that no one else thought of this first!


## Installation

**From npm:**

```sh
npm install loge
```

**Or github:**

```sh
git clone https://github.com/chbrown/loge.git
```


## Usage

```js
var logger = require('loge');

logger.level = 'error';
logger.warn('You should probably get a doctor to look at that.'); // crickets...
logger.critical('OMG your face I you what no really just does it hurt?'); // loud and clear!
```


## License

Copyright © 2014 Christopher Brown. [MIT Licensed](LICENSE).
