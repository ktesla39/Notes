# 📝 Notes App

A modern, feature-rich notes application built with React, featuring rich text editing, image support, dark mode, and smooth animations. Perfect for organizing your thoughts, ideas, and tasks with a beautiful, responsive interface.

![Notes App Preview](https://ktesla.alwaysdata.net/notes)

## ✨ Features

### 🎨 **Rich Text Editing**
- **React Quill** powered rich text editor
- Full formatting support: headers, lists, links, colors, fonts
- Code blocks and blockquote support
- Table creation and advanced formatting

### 🖼️ **Image Support**
- Drag & drop or click to add images
- Automatic image compression and optimization
- Support for JPEG, PNG, GIF, and WebP formats
- Smart resizing for large images (max 2048px dimension)
- No file size limits - images are optimized automatically

### 🎯 **Organization & Management**
- **Categories**: Personal, Work, Ideas, Todo, Archive
- **Color Coding**: 6 beautiful color themes for notes
- **Pin Important Notes**: Keep important notes at the top
- **Search & Filter**: Find notes instantly with powerful search
- **Sorting**: Sort by date or title

### 🌙 **User Experience**
- **Loading Screen**: Beautiful animated loading experience on app start
- **Dark Mode**: Beautiful dark theme with smooth transitions
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Polished transitions and micro-interactions
- **URL Routing**: Shareable links for individual notes
- **Local Storage**: Your notes are saved locally and persist

### 📱 **Progressive Web App (PWA)**
- **Installable**: Add to home screen on mobile devices
- **Offline Ready**: Works without internet connection
- **Native App Feel**: Standalone experience with app-like interface
- **Fast Loading**: Optimized for quick startup times

### 🔧 **Technical Features**
- **Fast Performance**: Built with Vite for lightning-fast development
- **Modern Stack**: React 18, Tailwind CSS, Lucide Icons
- **TypeScript Ready**: Proper type definitions included
- **ESLint**: Code quality and consistency
- **Hot Reload**: Instant updates during development

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/notes-app.git
   cd notes-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:9000
   ```

### PWA Setup (Optional)

To enable Progressive Web App features:

1. **Generate App Icons**
   ```bash
   # Convert SVG icons to PNG (requires ImageMagick or similar)
   # Place icon-192.png and icon-512.png in the public/ folder
   ```

2. **Test PWA Features**
   - Open DevTools → Application → Manifest
   - Check "Add to Home Screen" functionality on mobile

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview the production build
npm run preview
```


## 🛠️ Tech Stack

### Frontend Framework
- **React 18** - Modern React with concurrent features
- **Vite** - Fast build tool and development server

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, consistent icons
- **Custom CSS** - Smooth animations and transitions

### Rich Text Editing
- **React Quill** - Powerful rich text editor
- **Quill** - Core editor library

### Development Tools
- **ESLint** - Code linting and quality
- **TypeScript** - Type definitions for better DX

## 🎨 Customization

### Adding New Categories
Edit the `CATEGORIES` array in `src/App.jsx`:

```javascript
const CATEGORIES = ["Personal", "Work", "Ideas", "Todo", "Archive", "Custom"];
```

### Adding New Colors
Extend the `COLORS` array in `src/App.jsx`:

```javascript
const COLORS = [
  // existing colors...
  {
    name: "Custom",
    bg: "bg-custom-100",
    border: "border-custom-300",
    dot: "bg-custom-500",
    text: "text-custom-600"
  }
];
```

### Customizing Animations
Modify `src/animations.css` to adjust animation timings and effects:

```css
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards; /* Adjust duration */
}
```

## 🔧 Configuration

### Vite Configuration
The app runs on port 9000 by default. To change this, edit `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000  // Change port here
  }
})
```

### Image Settings
Image compression settings can be modified in `src/imageHandler.js`:

```javascript
const MAX_DIMENSION = 2048;  // Maximum image dimension
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
```

## 📱 Usage Guide

### Creating Notes
1. Click the **"Create"** button
2. Add a title and select a category
3. Choose a color theme
4. Write your content using the rich text editor
5. Add images using the image button in the toolbar
6. Click **"Save"** to store your note

### Managing Notes
- **Pin Notes**: Click the pin icon to keep notes at the top
- **Search**: Use the search bar to find notes by title or content
- **Filter**: Click category buttons to filter notes
- **Sort**: Choose between recent or alphabetical sorting
- **View**: Click on a note card to view in full screen
- **Edit**: Click the title or "Edit" button to modify notes
- **Duplicate**: Create copies of existing notes
- **Delete**: Remove notes with confirmation

### Keyboard Shortcuts
- `Enter` in title field: Save note (when editing)
- `Ctrl/Cmd + S`: Save note (when editing)

## 🌟 Key Highlights

### 🚀 **Performance Optimized**
- Lazy loading and code splitting
- Efficient image compression
- Optimized bundle size
- Fast cold start times

### 🎨 **Beautiful Design**
- Modern, clean interface
- Consistent design language
- Smooth micro-interactions
- Accessible color schemes

### 💾 **Data Persistence**
- Automatic saving to localStorage
- No data loss on refresh
- Export/import capabilities (future feature)
- Cross-device sync ready (future feature)

### 🔒 **Privacy First**
- All data stored locally
- No external API calls
- No user tracking
- Complete privacy control

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation
- Ensure responsive design
- Test on multiple browsers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Quill** for the excellent rich text editor
- **Tailwind CSS** for the utility-first styling approach
- **Lucide** for the beautiful icon set
- **Vite** for the blazing fast development experience

## 📞 Support

If you have any questions or need help:

- Open an issue on GitHub
- Check the documentation
- Join our community discussions

---

**Made with ❤️ using React & Vite**