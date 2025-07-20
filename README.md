# 🧙‍♂️ D&D Combat Tracker

A sleek and modern combat tracker for Dungeons & Dragons and other TTRPGs, built with **Next.js**, **TypeScript**, and **Tailwind CSS**. Designed to be fast, responsive, and easy to use during high-paced combat sessions.

![Combat Tracker Screenshot](./public/screenshot.png)

---

## ✨ Features

- 🎯 Initiative-based turn tracking
- ♻️ Round counter with automatic advancement
- ❤️ Quick heal and damage controls
- 💀 Automatic death state when HP reaches 0
- 🔒 Persistent combat state using `localStorage`
- 🧠 Condition tracking with common status effects
- 🧹 Clear/reset button with confirmation modal
- 💡 Responsive dark-mode UI using Tailwind

---

## 📦 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** React `useState` + `useEffect`
- **Persistence:** Browser `localStorage`

---

## 🚀 Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/your-username/dnd-combat-tracker.git
cd dnd-combat-tracker
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the development server**

```bash
npm run dev
```

4. Open your browser to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
  ├── app/
  │   ├── components/
  │   │   ├── AddCombatantForm.tsx
  │   │   └── CombatantCard.tsx
  │   ├── types/
  │   │   └── combatant.ts
  │   └── page.tsx
  └── styles/
      └── globals.css
```

---

## 🧪 Future Improvements

- ☁️ Save/load encounters from file or cloud
- 🧍 Add character avatars or class icons
- 🗡️ Support for attack rolls and saving throws
- 🔁 Initiative reordering during combat
- 📱 Mobile-first optimizations

---

## 🛠️ Dev Scripts

```bash
npm run dev       # Run in development mode
npm run build     # Create production build
npm run start     # Run the production server
```

---

## 📖 License

MIT — free to use, modify, and share.

---

## 👑 Acknowledgements

- Built with love for DMs and players alike 🐉
- Inspired by countless paper initiative trackers
