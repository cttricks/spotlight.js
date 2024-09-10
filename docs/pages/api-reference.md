# API Reference

Welcome to the Spotlight API reference! Below is a simple guide to help you understand how to use the different methods available in the Spotlight object.


### Spotlight.`start()`;

The `start()` method begins the Spotlight tour. You can customize how the tour behaves using various options. Here are a few examples to help you understand how to start the tour:

```javascript
// Starts the tour from the first step
Spotlight.start();

// Starts the tour from step 3
Spotlight.start({ from: 3 }); 

// Highlights the elements without allowing navigation
Spotlight.start({ highlightOnly: true }); 

// Asks for confirmation before stopping the tour
Spotlight.start({ confirmOnExit: true }); 

// Combining all options: starts from step 3, only highlights elements, and asks for confirmation before exit
Spotlight.start({ from: 3, highlightOnly: true, confirmOnExit: true });
```
&nbsp;

### Spotlight.`end()`;

The `end()` method is used to end the tour. This can be called at any point when you want to stop the Spotlight tour.

```javascript
Spotlight.end();
```
&nbsp;

### Spotlight.`next()`;
The `next()` method moves the tour to the next step. You can call this to manually progress through the steps of the tour.

```javascript
Spotlight.next();
```

&nbsp;

### Spotlight.`previous()`;
The `previous()` method moves the tour to the previous step. You can call this if you need to go back to the last highlighted spot.

```javascript
Spotlight.previous();
```

&nbsp;

### Spotlight.`setCover()`;

The `setCover()` method allows you to customize the background cover that highlights the elements. You can change the color and transparency to suit your design.

```javascript
Spotlight.setCover({ hex: '#bfff5c', alpha: 0.5 });
```

&nbsp;

### Spotlight.`updateSpots()`;

If your page has dynamic content that changes after the tour starts, you can use the `updateSpots()` method to refresh the highlighted spots to reflect any updates.

```javascript
Spotlight.updateSpots();
```

This is useful when elements appear or change positions after the tour has begun.

&nbsp;

### Spotlight.`addEventListener()`;

The `addEventListener()` method allows you to listen to specific events during the tour. You can attach custom code to run when certain events occur.

```javascript
Spotlight.addEventListener('event-name', (e) => {
    // Your code here
});
```

Here is the list of events:
- all
- start
- end
- exit
- next
- previous
- click
- spots-updated
- cover-updated

#### Example
You could listen to the `click` event, and execute your custom code when those event is triggered.

```javascript
Spotlight.addEventListener('click', (e) => {
    console.log('Model element clicked:', e.target);
});
```