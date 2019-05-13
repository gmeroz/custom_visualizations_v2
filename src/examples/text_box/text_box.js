looker.plugins.visualizations.add({
  // Id and Label are legacy properties that no longer have any function besides documenting
  // what the visualization used to have. The properties are now set via the manifest
  // form within the admin/visualizations page of Looker
  id: "text box",
  label: "Description Box",
  options: {
    html_content: {
      type: "string",
      label: "Text (HTML)",
      order: 1,
      default: "edit you text here"
    },
    font_size: {
      type: "string",
      label: "Font Size",
      values: [
        {"Large": "large"},
        {"Small": "small"}
      ],
      display: "radio",
      default: "large"
    },
    alignment: {
      default: 'left',
      display: 'select',
      label: `Text-align`,
      type: 'string',
      values: [
        { 'Left': 'left' },
        { 'Center': 'center' },
        { 'Right': 'right' }
      ]
    }
  },

  // Set up the initial state of the visualization
  create: function(element, config) {

    // Insert a <style> tag with some styles we'll use later.
    element.innerHTML = `
      <style>
        .text-box-vis {
          /* Vertical centering */
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
        }
        .text-box-text-large {
          font-size: 72px;
        }
        .text-box-text-small {
          font-size: 18px;
        }
      </style>
    `;

    // Create a container element to let us center the text.
    var container = element.appendChild(document.createElement("div"));
    container.className = "text-box-vis";

    // Create an element to contain the text.
    this._textElement = container.appendChild(document.createElement("div"));

  },
  // Render in response to the data or settings changing
  updateAsync: function(data, element, config, queryResponse, details, done) {

    // Clear any errors from previous updates
    this.clearErrors();

    var description = config.html_content;

    // Insert the data into the page
    this._textElement.innerHTML = description;

    // Set the size to the user-selected size
    if (config.font_size == "small") {
      this._textElement.className = "text-box-text-small";
    } else {
      this._textElement.className = "text-box-text-large";
    }

    // We are done rendering! Let Looker know.
    done()
  }
});
