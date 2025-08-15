# Grind

![Grind Logo](public/favicon.ico)

A minimalist daily task manager designed for productivity. Grind helps you focus on what matters today by automatically resetting your tasks each day, giving you a fresh start every morning.

![Angular](https://img.shields.io/badge/Angular-20.1.0-red?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue?logo=typescript)
![Material Design](https://img.shields.io/badge/Material_Design-UI-blue?logo=material-design)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

### Daily Reset System
- Tasks automatically reset each day at midnight
- Completed tasks become uncompleted for a fresh start
- Maintains your task structure while clearing daily progress

### Task Management
- Add, complete, and delete tasks
- Organize tasks with custom categories
- Color-coded categories for visual organization
- Quick input with keyboard shortcuts

### Radial Menu Interface
- Unique circular menu for intuitive task actions
- Touch-friendly gestures with HammerJS integration
- Modern and engaging user experience

### Mobile-First Design
- Progressive Web App (PWA) capabilities
- Responsive design for all screen sizes
- Optimized for mobile touch interactions
- Prevents zoom on form focus (iOS optimized)

### Local Storage
- No account required - everything stored locally
- Data persists between browser sessions
- Privacy-focused - your tasks never leave your device

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/grind.git
   cd grind
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   ng serve
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200/`

### Building for Production

```bash
npm run build
# or
ng build
```

The build artifacts will be stored in the `dist/` directory.

## How to Use

### Adding Tasks
1. Click on the current date to open the input box
2. Type your task title
3. Press Enter to add the task
4. Press Escape to close the input box

### Managing Tasks
- **Complete**: Click the checkbox next to any task
- **Delete**: Use the radial menu or task actions
- **Categorize**: Assign tasks to different categories

### Categories
- Create custom categories with unique colors
- Switch between categories to organize your tasks
- Categories persist across daily resets

### Daily Reset
- Tasks automatically reset at midnight
- Completed status clears but task titles remain
- Start each day with a clean slate

## Technology Stack

- **Frontend Framework**: Angular 20.1.0
- **UI Components**: Angular Material 20.1.5
- **Language**: TypeScript 5.8.2
- **Styling**: CSS3 with Material Design
- **Touch Gestures**: HammerJS
- **State Management**: RxJS Observables
- **Data Persistence**: Browser LocalStorage

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── main-shell/          # Main app shell component
│   │   ├── task-list/           # Task list display and management
│   │   ├── radial-menu/         # Circular menu interface
│   │   └── settings/            # App settings and preferences
│   ├── services/
│   │   └── task.service.ts      # Task management business logic
│   ├── models/
│   │   └── task.model.ts        # Task and TaskCategory interfaces
│   ├── app.config.ts           # Angular application configuration
│   └── app.routes.ts           # Application routing
├── styles.css                  # Global styles
└── index.html                 # Main HTML template
```

## Design Philosophy

Grind follows a minimalist design approach:

- **Simplicity**: Clean, uncluttered interface
- **Focus**: Daily reset keeps you focused on today's priorities
- **Accessibility**: High contrast, clear typography, keyboard navigation
- **Performance**: Lightweight, fast loading, optimized for mobile

## Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Build in watch mode for development

### Code Style

The project uses Prettier for code formatting with custom Angular HTML parser configuration.

### Architecture

- **Standalone Components**: Modern Angular standalone component architecture
- **Reactive Programming**: RxJS for state management and data flow
- **Material Design**: Consistent UI/UX following Material Design principles
- **Mobile-First**: Progressive enhancement from mobile to desktop

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Angular CLI](https://github.com/angular/angular-cli)
- UI components from [Angular Material](https://material.angular.io/)
- Touch gestures powered by [HammerJS](https://hammerjs.github.io/)
- Fonts from [Google Fonts](https://fonts.google.com/)

---

**Start your productive day with Grind!**
