# Voice Based Billing Assistant App

A cross-platform (mobile + web) app for fast, easy, and smart billing using voice and manual input. Designed for shopkeepers, vendors, and anyone who wants to generate bills quickly in Hindi/English.

---

## 🚀 Features

- **Voice & Manual Billing:** Add items and prices by speaking or typing (supports Hindi/English/colloquial/numeric).
- **Robust Parsing:** Handles edge cases, quantities, and price words (e.g., "25 maggi 150", "maggi 25", "डेढ़ सौ").
- **Save, Update, and Copy Bills:** Save new bills, update existing ones, or save as a copy.
- **Saved Bills List:** View, search, sort, and delete saved bills.
- **Natural Sorting:** Numbers before letters (e.g., "12a" before "aman").
- **Real-Time Search:** Filter bills as you type.
- **Share on WhatsApp:** Instantly share your bill.
- **Measurement Screen:** Manual ready reckoner for quick conversions.
- **Cross-Platform:** Works on Android, iOS, and Web (Expo).

---

## 🛠️ Technologies Used

- React Native (Expo)
- JavaScript/TypeScript
- AsyncStorage (local storage)
- expo-router (navigation)
- WhatsApp Web API (sharing)
- React Hooks
- (Optional) Voice Recognition

---

## 📱 Screenshots

> _Add screenshots of Home, Billing, Saved Bills, and Measurement screens here._

---

## 🏗️ Project Structure

```
/app
  |-- billing.js
  |-- SavedBillsScreen.js
  |-- Measurement.js
  |-- index.js
/assets
/components
/constants
/hooks
```

---

## 📝 Usage Guide

1. **Home Screen:**  
   - Start Billing, Measurement, or view Saved Bills.

2. **Billing Screen:**  
   - Add items/prices by voice or typing.
   - Modify/delete entries.
   - Save, update, or copy bills.
   - Share bill on WhatsApp.

3. **Saved Bills Screen:**  
   - View all saved bills (S.No., name, date).
   - Search and sort bills.
   - Open, update, or delete any bill.

4. **Measurement Screen:**  
   - Use manual ready reckoner for conversions.

---

## 💡 How It Works

- **Data Storage:** Bills are saved locally using AsyncStorage.
- **Navigation:** expo-router for seamless navigation (mobile + web).
- **Voice Input:** (If supported) Speech-to-text for fast billing.
- **Natural Sorting & Search:** Bills are sorted and filtered in real-time.

---

## 🌱 Future Improvements

- Cloud sync & user authentication
- Export to PDF/Excel
- More languages & better voice support
- Analytics & insights
- UI/UX enhancements

---

## 📚 Learnings

- React Native & Expo for cross-platform apps
- State management with hooks
- Local storage with AsyncStorage
- Navigation for web & mobile
- Robust parsing and user-centric design
- Git & GitHub for version control

---

## 👩‍💻 Contributors

- [Your Name](https://github.com/Palak-Goyal27)

---

## 📄 License

This project is licensed under the MIT License.

---

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
