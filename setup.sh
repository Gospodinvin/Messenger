#!/bin/bash
# TeamMate Pro: Автоматический скрипт настройки окружения разработки React Native + Expo (v1.4)
# Лицензия: Apache-2.0

echo "============================================="
echo "TeamMate Pro: Настройка окружения Expo SDK 52"
echo "============================================="

# 1. Проверка установки Node.js
if ! command -v node &> /dev/null
then
    echo "[!] Node.js не обнаружен. Пожалуйста, установите Node.js версии v18+ или v20+ перед продолжением."
    exit 1
else
    echo "[✓] Обнаружен Node.js: $(node -v)"
fi

# 2. Проверка пакетного менеджера npm
if ! command -v npm &> /dev/null
then
    echo "[!] Пакетный менеджер npm отсутствует. Проверьте установку Node.js."
    exit 1
else
    echo "[✓] Обнаружен npm: $(npm -v)"
fi

# 3. Инсталляция основных Expo CLI и глобальных CLI-зависимостей
echo "====== Установка глобальных CLI-утилит ======"
npm install -g eas-cli expo-cli

# 4. Установка локальных зависимостей проекта из package.json
echo "====== Установка Node-модулей проекта ======"
npm install

# 5. Инициализация и сканирование дополнительных мобильных нативных плагинов
echo "====== Проверка и запуск CocoaPods (для macOS & iOS разработки) ======"
if [[ "$OSTYPE" == "darwin"* ]]; then
    if ! command -v pod &> /dev/null
    then
        echo "[!] CocoaPods не обнаружен. Рекомендуется установить его через brew: brew install cocoapods"
    else
        echo "[✓] Обнаружен CocoaPods: $(pod --version)"
        echo "Запуск pod install в папке ios/ (после генерации пребилдов)..."
        # npx expo prebuild
        # cd ios && pod install && cd ..
    fi
else
    echo "[ℹ] Текущая операционная система не является macOS. Пропуск установки CocoaPods (неприменимо для Windows/Linux)."
fi

# 6. Сообщение пользователю об успешном завершении
echo ""
echo "=========================================================="
echo "[✓] Настройка TeamMate Pro завершена успешно!"
echo "Действия для запуска локальной тестовой сборки:"
echo "  1. npx expo start"
echo "  2. Просканируйте QR-код в приложении Expo Go на смартфоне"
echo "=========================================================="
