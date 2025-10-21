# Image Button Automation Project

## Overview
The Image Button Automation project allows users to upload an image and input a URL. The application modifies the title of the page, adjusts the button position based on the uploaded image, and replaces the redirect URL with the user-provided URL.

## Project Structure
```
image-button-automation
├── src
│   ├── index.html          # Main entry point for the application
│   ├── upload.html         # Form for image upload and URL input
│   ├── preview.html        # Displays preview of uploaded image and URL
│   ├── css
│   │   ├── style.css       # Styles for the main application
│   │   └── upload.css      # Styles for the upload page
│   ├── js
│   │   ├── main.js         # Main JavaScript logic
│   │   ├── upload.js       # Manages image upload and URL input
│   │   └── preview.js      # Handles display of uploaded image and URL
│   ├── templates
│   │   └── generated-page.html # Template for dynamically generated pages
│   └── assets
│       ├── images
│       │   └── placeholder.jpg  # Placeholder image
│       └── generated             # Directory for generated files
├── package.json            # npm configuration file
└── README.md               # Project documentation
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd image-button-automation
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage
1. Open `src/index.html` in a web browser to access the application.
2. Click the button to navigate to the upload page (`src/upload.html`).
3. Upload an image and input a URL.
4. Submit the form to view the preview page (`src/preview.html`), where the uploaded image and URL will be displayed.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License.