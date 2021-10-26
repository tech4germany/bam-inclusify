# INCLUSIFY App - React Frontend Documentation

## Setting up certificates for local Office Add-in development

_See also [`office-addin-dev-certs`](https://www.npmjs.com/package/office-addin-dev-certs) and the [Word add-in development docs](https://docs.microsoft.com/en-us/office/dev/add-ins/word/) for more info._

- (On macOS & Linux:) Go to `react-ui/node_modules/office-addin-dev-certs/cli.js` and change the end of lines format to `LF` to avoid a bug.
- Use `yarn office-addin-dev-certs install` to obtain certificates.
- Create a file `react-ui/.env.local` with the following contents (you can also replace `$HOME` with the path to your user home folder).

```
DEVSERVER_HTTPS_KEY=$HOME/.office-addin-dev-certs/localhost.key
DEVSERVER_HTTPS_CERT=$HOME/.office-addin-dev-certs/localhost.crt
DEVSERVER_HTTPS_CA=$HOME/.office-addin-dev-certs/ca.crt
```

## Adjusting the links in the navigation bar (Standalone) and for the INCLUSIFY logo (Addin)

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
