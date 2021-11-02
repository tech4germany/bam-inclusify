# INCLUSIFY App - React Frontend Documentation

## Adjusting the links in the navigation bar (Standalone) and for the INCLUSIFY logo (Addin)

<a href="./images/standalone-navbar-links.png"><img alt="Standalone navigation bar links highlighted" src="./images/standalone-navbar-links.png" height="100"></a>
<a href="./images/addin-logo-link.png"><img alt="Addin logo highlighted" src="./images/addin-logo-link.png" height="100"></a>

- You can adjust the external links shown in the INCLUSIFY app in the `navigation-links.json` file (i.e. the links shown in the navigation bar at the top of the Standalone page, and the link used for the INCLUSIFY logo element in the Addin)
  - Note: in both cases, URLs are only accepted when they start with "http://" or "https://"
- For the links shown in the navigation bar at the top of the Standalone page:
  - In `react-ui/src/navigation-links.json`, edit the list in the key `"standaloneNavigationLinks"`
  - Each item in this list must have at least the two entries `"title"` and `"url"` (both must be strings), and can optionally have an entry `"subtitle"` (also a string), which is shown under the "title" in smaller font
  - Example:
  ```json
  {
    // . . .
    "standaloneNavigationLinks": [
      {
        "title": "Contribute",
        "subtitle": "auf GitHub",
        "url": "https://github.com/tech4germany/bam-inclusify"
      },
      {
        "title": "Projektseite",
        "url": "https://github.com/tech4germany/bam-inclusify"
      }
    ]
    // . . .
  }
  ```
- For the link used for the INCLUSIFY logo element in the Addin:
  - In `react-ui/src/navigation-links.json`, edit the value of the key `"addinLogoLinkUrl"`
  - Example:
  ```json
  {
    // . . .
    "addinLogoLinkUrl": "https://github.com/tech4germany/bam-inclusify"
    // . . .
  }
  ```

## Office Add-in development

### Setting up certificates for local Office Add-in development

If you want to test the Office Add-in locally using the dev server (i.e. with `devcmd start-ui`), you must enable HTTPS for the dev server with the following steps.

_See also [`office-addin-dev-certs`](https://www.npmjs.com/package/office-addin-dev-certs) and the [Word add-in development docs](https://docs.microsoft.com/en-us/office/dev/add-ins/word/) for more info._

- (On macOS & Linux:) Go to `react-ui/node_modules/office-addin-dev-certs/cli.js` and change the end of lines format to `LF` to avoid a bug.
- Use `yarn office-addin-dev-certs install` to obtain certificates.
- Create a file `react-ui/.env.local` with the following contents (you can also replace `$HOME` with the path to your user home folder).

```
HTTPS=true
DEVSERVER_HTTPS_KEY=$HOME/.office-addin-dev-certs/localhost.key
DEVSERVER_HTTPS_CERT=$HOME/.office-addin-dev-certs/localhost.crt
DEVSERVER_HTTPS_CA=$HOME/.office-addin-dev-certs/ca.crt
```

### Polyfills for Internet Explorer webview in Windows Office apps

The Office add-ins are shown in IE11 webviews in certain constellations of Windows and Office versions (see [this overview](https://docs.microsoft.com/en-us/office/dev/add-ins/concepts/browsers-used-by-office-web-add-ins) for details). Since IE11 doesn't support many modern changes and extensions to the ECMAScript, we need to include polyfills to enable our application to run in this legacy environment.

Since we use [Create React App](https://create-react-app.dev/) to manage the setup and build of our React frontend, we automatically get good support to include the necessary polyfills during the build process. See [the CRA docs](https://create-react-app.dev/docs/supported-browsers-features/#supported-browsers) and [`react-app-polyfill`](https://github.com/facebook/create-react-app/blob/main/packages/react-app-polyfill/README.md) for more details.

To enable this support, we added "ie 11" to the `browserslist` key in `react-ui/package.json`, and additionally include the following two imports in our entry points `react-ui/src/standalone/standalone.tsx` and `react-ui/src/office-taskpane/taskpane.tsx`:

```ts
import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
```

**Caveat:** As of the end of the Tech4Germany project term, this method doesn't correctly polyfill [String.replaceAll()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll), so we had to avoid it in one place. More details are documented in a code comment at the affected piece of code.
