#Installation

You can use CDN and include the script in your HTML file:

```html
<script src="https://cdn.jsdelivr.net/gh/cttricks/spotlight.js/dist/spotlight.min.js" type="module"></script>
```
&nbsp;

### Start Using

You can simply use the magical attribute `lights-on` in the `<script>` tag — as it automatically activates the Spotlight.js without requiring any additional configuration or code.

```html
<script src="https://cdn.jsdelivr.net/gh/cttricks/spotlight.js/dist/spotlight.min.js" type="module" lights-on ></script>
```

Or you can use javascript code to use it in more controlled way.

```javascript

<script type="module">

    import { spotlight } from 'https://cdn.jsdelivr.net/gh/cttricks/spotlight.js/dist/spotlight.min.js';

    const Spotlight = await spotlight();

    Spotlight.start();

</script>
```

Continue reading the [Quick start](link:quick-start-guide) guide to learn more about the package.