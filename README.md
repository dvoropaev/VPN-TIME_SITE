# layout-vpn-time

## node

v24.12.0

## NVM


### Установка
```bash
nvm install node # Установить последнюю версию
```

```bash
nvm install --lts # Установить последнюю LTS-версию
```

```bash
nvm install 20.18.1 # Установить конкретную версию
```

## Удаление
```bash
nvm uninstall 20.18.1 # Удалить конкретную версию
```
```bash
nvm uninstall --lts # Удалить последнюю LTS-версию
```

### Список версий
```bash
nvm list # Список установленных версий
nvm ls
```
### Cписок доступных для установки версий Node.js
```bash
nvm list available
nvm list available # Список доступных для установки версий
```

### Выбор версии
```bash
nvm use 24.12.0  # Выбрать для использования конкретную версию
```


## inastall vite

```bash
npm create vite@latest
```

В package.json

```
...
"dev": "vite --open",
...
```

```bash 
npm i -D sass
```

## Настраиваем работу с графикой

```bash 
npm install vite-plugin-image-optimizer sharp svgo --save-dev
```

```
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      ViteImageOptimizer({
        jpg: {
          quality: 75
        },
        png: {
          quality: 75
        }
      }),
    ],
  };
});
```

## Готовим векторный спрайт

```bash
npm i vite-plugin-svg-spriter
```

