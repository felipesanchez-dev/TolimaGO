# 🔧 TolimaGO - Guía de Resolución de Problemas de Red

## ❌ Problema Identificado: ERR_NETWORK

### Síntomas:
- ✅ Backend funcionando correctamente en `http://localhost:3000`
- ✅ Endpoints accesibles desde curl en la máquina de desarrollo
- ❌ App React Native mostrando `ERR_NETWORK` / `Network request failed`
- ❌ No se pueden completar login/registro desde el dispositivo

### 🔍 Diagnóstico:

Los logs mostraron:
```
LOG  🌐 [HTTP] postPublic called: {"url": "http://localhost:3000/api/v1/auth/register", "data": {...}}
ERROR 💥 [HTTP] postPublic error: [AxiosError: Network Error]
ERROR Network request failed
```

### ⚡ Solución Aplicada:

**Problema**: En React Native, `localhost` se refiere al dispositivo/emulador, no a la máquina de desarrollo.

**Solución**: Cambiar la configuración de `localhost` a la IP de la máquina de desarrollo.

#### Cambios Realizados:

1. **Actualizado `services/http-client.ts`**:
   ```typescript
   const API_CONFIG = {
     BASE_URL: "http://192.168.1.8:3000/api/v1", // IP de la máquina de desarrollo
     // ... resto de configuración
   }
   ```

2. **Actualizado `app/auth/register.tsx`** (fetch directo):
   ```typescript
   const res = await fetch("http://192.168.1.8:3000/api/v1/auth/register", {
   ```

3. **Verificación**:
   ```bash
   curl -X POST http://192.168.1.8:3000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","password":"123456"}'
   ```
   ✅ **Resultado**: `{"success":true,"message":"User registered successfully",...}`

### 🔄 Cómo Encontrar tu IP de Desarrollo:

#### Windows:
```powershell
ipconfig | findstr "IPv4"
```

#### macOS/Linux:
```bash
ifconfig | grep inet
# o
ip addr show
```

#### Desde Expo:
La IP aparece en el QR code de Expo: `exp://192.168.1.8:8081`

### 🌐 Configuración de Red Requerida:

1. **Firewall**: Asegúrate de que el puerto 3000 esté abierto
2. **Backend**: Debe estar configurado para aceptar conexiones desde cualquier IP:
   ```javascript
   // Express.js ejemplo
   app.listen(3000, '0.0.0.0', () => {
     console.log('Server running on port 3000');
   });
   ```

### 📱 Casos Especiales:

#### Android Emulador:
- IP especial: `10.0.2.2` (mapea a localhost del host)

#### iOS Simulator:
- Puede usar `localhost` directamente

#### Dispositivo Físico:
- **DEBE** usar la IP real de la máquina de desarrollo
- Asegúrate de estar en la misma red WiFi

### ✅ Verificación Final:

1. **Backend accessible**: `curl http://TU_IP:3000/api/v1/auth/register`
2. **App funcionando**: Los logs deben mostrar respuestas exitosas
3. **Red correcta**: Dispositivo y desarrollo en la misma red

### 🚨 Troubleshooting Adicional:

#### Si sigues teniendo problemas:

1. **Verifica la IP actual**:
   ```bash
   ping 192.168.1.8  # Desde otro dispositivo en la red
   ```

2. **Prueba el puerto**:
   ```bash
   telnet 192.168.1.8 3000
   ```

3. **Revisa el firewall**:
   - Windows: Panel de Control > Sistema y Seguridad > Firewall de Windows
   - macOS: Preferencias del Sistema > Seguridad y privacidad > Firewall

4. **Backend CORS**:
   ```javascript
   // Asegúrate de permitir tu IP
   app.use(cors({
     origin: ['http://192.168.1.8:8081', 'exp://192.168.1.8:8081']
   }));
   ```

---

**Fecha de resolución**: 14 de septiembre de 2025  
**Estado**: ✅ RESUELTO - APIs funcionando correctamente  
**Próximo paso**: Probar login y registro en la aplicación