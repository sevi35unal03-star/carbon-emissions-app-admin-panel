# carbon-emissions-app-admin-panel

> A short, clear sentence describing what this project does.

---

##  Tech Stack

- [React](https://react.dev/) — UI library
- [Vite](https://vitejs.dev/) — Fast dev environment and bundler

---

## Installation

Clone the repo and install dependencies:

```bash
git clone https://github.com/username/project-name.git
cd project-name
npm install
```

---

##  Development

Start the development server:

```bash
npm run dev
```

Open in browser: [http://localhost:5173](http://localhost:5173)

---

##  Production Build

```bash
npm run build
```

Build output is written to the `dist/` folder.

Preview the build locally:

```bash
npx vite preview
```

---

##  Folder Structure

```
├── public/          # Static assets
├── src/
│   ├── assets/      # Images, fonts, etc.
│   ├── components/  # Reusable components
│   ├── pages/       # Page components
│   ├── App.jsx      # Root application component
│   └── main.jsx     # Entry point
├── index.html
├── vite.config.js
└── package.json
```

---

##  Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=https://api.example.com
```

> In Vite, environment variables must be prefixed with `VITE_`.

---

##  License

[MIT](./LICENSE)
