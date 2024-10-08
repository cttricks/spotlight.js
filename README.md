<div align="center">
<a href="https://cttricks.github.io/spotlight.js/" target="_blank" rel="noopener noreferrer nofollow">
<img src="https://raw.githubusercontent.com/cttricks/spotlight.js/master/docs/assets/img/spotlight-js-banner.png" alt="Spotlight.js" />
</a>
</div>
&nbsp;

A robust, efficient, and fully adaptable pure JavaScript engine designed to direct user attention across your webpage. Free of external libraries, it ensures compatibility with all major browsers and provides a wide range of customization possibilities.

[Check Out the Demo](https://cttricks.github.io/spotlight.js/)

## Quick Start Guide

To quickly get started with Spotlight.js, follow these simple steps to create a basic integration without writing any additional JavaScript code. This example demonstrates how easily you can begin using the library, but keep in mind that Spotlight.js offers a wide range of features and controls for further customization.

### Insert Spotlight Comments

Start by adding an HTML comment directly before the element you want to draw attention to. This comment will instruct Spotlight.js to highlight and display the specified content to your visitors. 

```html
<!-- Spotlight; Hello Visitor; Let's start the website tour. -->
<button type="spotlight-button:start">Start Demo Tour</button>

<!-- Spotlight; Feature Name; A short description about this feature. -->
<div class="container">
    ...
</div>
```
> Note that the `type="spotlight-button:start"` attribute is used as a trigger to start the Spotlight tour.

You can place the comment anywhere on your page to highlight the desired element during the tour for your visitors.
```html
<ul>
    ...
    <!-- Spotlight; Our Store; Visit out store to explore next gen products....  -->
    <li>Visit Store</li>
    ...
</ul>
```

In this example, the comment instructs Spotlight to greet the visitor and initiate a simple tour.

### Include Spotlight with 🪄 Magical Attribute

Next, include the Spotlight.js script by adding the following `<script>` tag at the very bottom of the `<body>` section of your webpage. This ensures that the script loads after the rest of your content. 

```html
<script src="https://cdn.jsdelivr.net/gh/cttricks/spotlight.js/dist/spotlight.min.js" type="module" lights-on ></script>
```

> Notice the `lights-on` attribute in the `<script>` tag—this works like magic, automatically activating Spotlight.js without requiring any additional configuration or code.

And that's it! With the lights-on attribute, your webpage is instantly equipped with Spotlight.js without needing any further JavaScript. This is just a basic example of how quickly you can integrate the library. If you want to explore more advanced features and customization options, Spotlight.js provides extensive controls to tailor the user experience precisely to your needs. 

For demos and documentation, visit [spotlight.js/docs](https://cttricks.github.io/spotlight.js/docs)


## Contributions

I’d love your help—whether it’s through pull requests, reporting issues, or simply sharing the project with others.