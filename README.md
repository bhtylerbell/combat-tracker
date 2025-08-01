# D&D Combat Tracker

A modern, responsive combat tracker for D&D 5E and similar tabletop RPGs. Built with Next.js, React, and TailwindCSS.

![Combat Tracker Screenshot](public/screenshot.png)

## Features

### Combat Management

- **Initiative Tracking**: Automatically sorts combatants by initiative
- **Turn Management**: Easy next/previous turn navigation
- **Round Counter**: Track combat rounds with increment/decrement controls
- **Combat Timer**: Track how long combats take in real-time
- **State Persistence**: Combat state automatically saves between sessions

### Combatant Features

- **Multiple Types**: Support for PCs, NPCs, Monsters, and Lair Actions
- **Health Tracking**: Visual HP bars with dynamic color changes
- **Status Effects**: Track conditions like Stunned, Poisoned, etc.
- **Quick Remove**: Easily remove defeated combatants

### User Accounts & Saved Combats

- **Optional Registration**: Create an account to save combats across sessions
- **Combat Library**: Save, name, and organize your encounters
- **Cross-Session Sync**: Access your saved combats from any device
- **Export/Import**: Share encounters with other DMs

### Utility Tools

- **Dice Roller**: Quick access to common dice (d4-d100)
- **Export/Import**: Save and load combat states as JSON files for backup or sharing

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/bhtylerbell/combat-tracker.git
   ```

2. Install dependencies:

   ```bash
   cd combat-tracker
   npm install
   ```

3. Set up authentication (optional):

   To enable user accounts and saved combats:
   
   a. Create a [Clerk](https://dashboard.clerk.com/) account
   
   b. Create a new application in Clerk
   
   c. Copy your keys to `.env.local`:
   
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   CLERK_SECRET_KEY=your_clerk_secret_key_here
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage Guide

### Adding Combatants

1. Fill in the combatant details in the sidebar form
2. Set initiative, HP, and AC
3. Click "Add to Combat" to add them to the tracker
4. Combatants are automatically sorted by initiative

### Managing Combat

- Use "Next Turn" to advance to the next combatant
- Use "Previous Turn" to go back one turn
- Round automatically increments when returning to the first combatant
- Combat timer tracks total duration
- Use the dice roller for quick rolls

### Status Effects

1. Click the status effect button on a combatant card
2. Select from common conditions
3. Effects are visually displayed on the combatant card

### Export & Import

**Exporting Combats:**
1. Click the "Export/Import" button in the sidebar
2. Click "Download Combat File" to save your current combat as a JSON file
3. The file includes all combatants, turn order, round, and timer state

**Importing Combats:**
1. Click the "Export/Import" button in the sidebar
2. Click "Choose Combat File" and select a previously exported JSON file
3. The combat will be loaded, replacing your current state
4. Useful for sharing encounters or resuming saved combats

### User Accounts (Optional)

**Creating an Account:**
1. Click "Sign Up" in the sidebar
2. Create your account with email/password or social login
3. Once signed in, you'll see your profile and saved combats

**Managing Saved Combats:**
1. Click on your profile in the sidebar
2. Select "My Saved Combats" to view your library
3. Save your current combat with a name and description
4. Load any saved combat instantly
5. Delete combats you no longer need

### Persistence

- Combat state automatically saves to browser storage
- Reloading the page maintains:
  - Combatant list
  - Current turn
  - Round number
  - Combat timer

## Technology Stack

- **Framework**: Next.js 13+ with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Hooks
- **Storage**: Browser LocalStorage
- **Analytics**: Vercel Analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
- Deployed on [Vercel](https://vercel.com/)

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
