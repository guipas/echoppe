<p align="center">
<img style="margin:auto;" src="http://www.guillaumepasquet.fr/statics/echoppe.png" width="120">
</p>
<br/><br/>
Simple ecommerce CMS based on Express (WIP)

## Installation

Echopppe is best used as a npm module :

```
npm install echoppe
```

Then, add it to your existing express app, or create a simple one like this :

```javascript
const express = require('express')
const app = express();
const echopppe = require('echoppe');

app.use('/', echopppe({}));

app.listen(3000, () => console.log('Example app listening on port 3000!'))
```

## Roadmap

- [X] Simple admin (using `Vue.js`)
- [X] Basic theme (using `bootstrap`)
- [X] Extendable theme
- [X] Basic email notification after a sell (using `nodemailer`)
- [ ] Digital products
- [ ] Plugin system
- [ ] Simple onboarding after install
- [ ] *Direct buy* link for all products