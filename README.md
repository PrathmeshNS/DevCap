# 🛡️ DevCap

**DevCap** is a modern, privacy-first, proof-of-work CAPTCHA alternative. It protects your applications from abuse, spam, and bot attacks without frustrating your users with complicated visual puzzles. 

Designed for developers, DevCap provides a seamless integration experience, a premium dark-themed UI out of the box, and a minimal footprint.

---

## ✨ Features

- **No Visual Puzzles**: Uses proof-of-work challenges in the background instead of asking users to select traffic lights.
- **Privacy-First**: No tracking, no external analytics, no data harvesting.
- **Lightweight**: Zero external dependencies in the frontend widget.
- **Modern UI**: Comes with a sleek, developer-focused aesthetic that can easily adapt to any brand.
- **Fully Customizable**: Tweak colors, sizing, and animations using straightforward CSS variables.
- **Easy Local Setup**: Integrated Node.js environment powered by npm workspaces.

---

## 🚀 Getting Started

Follow this quick guide to run DevCap locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- `npm` (comes with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd devcap
   ```

2. **Install dependencies:**
   The project uses `npm workspaces` to manage packages. A single install command handles everything.
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
4. **View the demo:**
   Open your browser and navigate to **http://localhost:3000** to see the DevCap widget in action!

---

## 📂 Project Structure

DevCap is structured as a monorepo utilizing npm workspaces:

- **/core**: The stateless server-side challenge generator and verifier.
- **/widget**: The lightweight frontend Web Component (`<cap-widget>`).
- **/demo**: An Express.js application that serves the demo environment and API endpoints.
- **/standalone**: A Docker-ready implementation for running DevCap as a standalone microservice.

---

## 🛠️ Usage Example

Embedding the widget into your HTML is straightforward:

```html
<!-- Include the DevCap scripts -->
<script src="http://localhost:3000/cap.js"></script>

<!-- Add the widget element -->
<cap-widget
  id="my-captcha"
  data-cap-api-endpoint="/api/"
  onsolve="console.log('Captcha solved! Token:', event.detail.token)"
></cap-widget>
```

When a user interacts with the widget, it requests a challenge from your API, solves it using Web Workers (proof-of-work), and triggers the `onsolve` event with a validation token. You then send this token along with your form submission to be verified by your backend.

---

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request or open an issue if you encounter any problems or have feature suggestions.

## 📄 License

DevCap is open-source software licensed under the [Apache-2.0 License](LICENSE).
