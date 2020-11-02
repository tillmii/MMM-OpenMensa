# MMM-OpenMensa

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/).

It displays all today's meals from any german canteen. Therefor it uses the [OpenMensa API](https://openmensa.org/).

## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:
```js
var config = {
    modules: [
        {
            module: 'MMM-OpenMensa',
            config: {
                canteen: 79,
                hideCategories: ["Pasta", "Terrine", "Tagessuppe"],
                updateInterval: 5000,
                fadeDuration: 1500
            }
        }
    ]
}
```

## Configuration options

| Option           | Description
|----------------- |-----------
| `canteen`        | *Required* <br> Choose any canteen in Germany from this map: https://openmensa.org <br> **Type:** `int`<br> **Default:** `79`
| `hideCategories` | *Optional* <br> Hide the categories you're not interested in <br> **Type:** `String[]` <br> **Default:** `[]`
| `updateInterval` | *Optional* <br> Interval in which the data is fetched from the API in milliseconds (5 seconds should be totally fine) <br> **Type:** `int` <br> **Default:** `5000`
| `fadeDuration`   | *Optional* <br> Duration in which the current meal is displayed <br> **Type:** `int` <br> **Default:** `2500`