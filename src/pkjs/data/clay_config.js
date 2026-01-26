module.exports = 
 [
  {
    "type": "heading",
    "defaultValue": "Pebble Cron",
    "id": "JSONHeading"
  },
  {
    "type": "text",
    "defaultValue": "<a href='https://github.com/kennedn/pebble-cron'><img src='https://shields.io/badge/github-Source%20Code-white?logo=github&style=for-the-badge' alt='Source Code'></img></a>",
    "id": "MainText"
  },
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Address",
        "id": "AddressHeading",
      },
      {
        "type": "input",
        "id": "AddressInput",
        "label": "<font style='color:#ff4700;'>* </font>Address",
        "attributes": {
          "autocapitalize": "off",
          "autocorrect": "off",
          "autocomplete": "off",
          "type": "search",
          "spellcheck": false,
          "required": true
        }
      },
      {
        "type": "button",
        "id": "AddressButton",
        "defaultValue": "Submit",
        "description": "Set address for bin collection pins",
        "primary": true,
      },
      {
        "type": "input",
        "messageKey": "ClayJSON",
        "id": "ClayJSON",
        "attributes": {
          "type": "text",
          "style": "display: none;"
        }
      },
    ]
  },
  {
    "type": "text",
    "defaultValue": "Made by <a href='https://kennedn.com'>kennedn</a></br>&nbsp;",
    "id": "MadeByText"
  },
];
