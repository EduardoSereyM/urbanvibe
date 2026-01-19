UrbanVibe API - Documentación para Frontend
Base URL
http://localhost:8000/api/v1
Autenticación
La API usa Bearer Token Authentication con JWT.

Headers Requeridos
Para endpoints protegidos, incluir:

Authorization: Bearer <access_token>
Content-Type: application/json
📍 Endpoints
🔐 Autenticación
POST /auth/login
Autentica un usuario y retorna un token JWT.

Request:

POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded
username=admin@urbanvibe.cl&password=password123
Response:

{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
Códigos de Estado:

200 - Login exitoso
401 - Credenciales inválidas
500 - Error del servidor
👤 Perfiles
GET /profiles/me
Obtiene el perfil del usuario autenticado incluyendo sus roles.

Headers:

Authorization: Bearer <token>
Response:

{
  "id": "03eba108-880b-409f-8a80-f75b6772533e",
  "reputation_score": 100,
  "points_current": 0,
  "roles": ["VENUE_OWNER", "SUPER_ADMIN"]
}
Roles Posibles:

SUPER_ADMIN - Administrador del sistema
VENUE_OWNER - Dueño de al menos un local
VENUE_MANAGER - Manager de un local
VENUE_STAFF - Staff de un local
APP_PREMIUM_USER - Usuario premium
APP_USER - Usuario normal (por defecto)
Códigos de Estado:

200 - Éxito
401 - No autenticado
404 - Usuario no encontrado
🏪 Venues (Públicos)
GET /venues/map
Lista de venues optimizada para mostrar en el mapa (vista liviana).

Query Parameters:

skip (int, opcional) - Offset para paginación. Default: 0
limit (int, opcional) - Límite de resultados. Default: 200
Response:

[
  {
    "id": "uuid",
    "name": "Nombre del Local",
    "is_verified": true,
    "trust_tier": "premium",
    "rating_average": 4.5,
    "review_count": 120,
    "price_tier": 2,
    "avg_price_min": 5000,
    "avg_price_max": 15000,
    "currency_code": "CLP",
    "address_display": "Av. Principal 123, Santiago",
    "location": {
      "lat": -33.4372,
      "lng": -70.6506
    }
  }
]
GET /venues/list
Lista de venues optimizada para la pantalla de lista (incluye más detalles visuales).

Query Parameters:

skip (int, opcional) - Offset para paginación. Default: 0
limit (int, opcional) - Límite de resultados. Default: 50
Response:

[
  {
    "id": "uuid",
    "name": "Nombre del Local",
    "slug": "nombre-del-local",
    "slogan": "El mejor lugar de la ciudad",
    "logo_url": "https://...",
    "operational_status": "open",
    "is_verified": true,
    "trust_tier": "premium",
    "rating_average": 4.5,
    "review_count": 120,
    "price_tier": 2,
    "avg_price_min": 5000,
    "avg_price_max": 15000,
    "currency_code": "CLP",
    "address_display": "Av. Principal 123, Santiago",
    "location": {
      "lat": -33.4372,
      "lng": -70.6506
    }
  }
]
Operational Status:

open - Abierto
closed - Cerrado
temporarily_closed - Cerrado temporalmente
GET /venues/{venue_id}/qr
Obtiene el código QR de un venue específico.

Headers:

Authorization: Bearer <token>
Response:

{
  "qr_content": "eyJhbGciOiJIUzI1NiIs..."
}
Códigos de Estado:

200 - Éxito
401 - No autenticado
404 - Venue no encontrado
✅ Check-ins
POST /checkins/
Crea un nuevo check-in en un venue.

Headers:

Authorization: Bearer <token>
Content-Type: application/json
Request:

{
  "token_id": "eyJhbGciOiJIUzI1NiIs...",
  "user_lat": -33.4372,
  "user_lng": -70.6506,
  "venue_id": "uuid-opcional"
}
Response:

{
  "id": "uuid",
  "user_id": "uuid",
  "venue_id": "uuid",
  "status": "approved",
  "geofence_passed": true,
  "created_at": "2025-11-27T10:30:00Z"
}
Status Posibles:

approved - Check-in aprobado
rejected - Check-in rechazado
pending - Pendiente de revisión
Códigos de Estado:

200 - Check-in exitoso
400 - Datos inválidos o fuera de geofence
401 - No autenticado
404 - Venue no encontrado
🏢 Venues Admin (B2B)
Nota: Estos endpoints requieren que el usuario tenga rol VENUE_OWNER o SUPER_ADMIN

GET /venues-admin/me/venues
Lista todos los venues donde el usuario actual tiene algún rol B2B.

Headers:

Authorization: Bearer <token>
Response:

{
  "venues": [
    {
      "id": "uuid",
      "name": "Mi Local",
      "role": "VENUE_OWNER",
      "is_verified": true,
      "operational_status": "open",
      "created_at": "2025-01-15T10:00:00Z"
    }
  ],
  "total": 1
}
Códigos de Estado:

200 - Éxito
401 - No autenticado
403 - Sin permisos
POST /venues-admin/venues
Crea un nuevo venue (casa matriz) para el usuario actual.

Headers:

Authorization: Bearer <token>
Content-Type: application/json
Request:

{
  "name": "Nombre del Local",
  "legal_name": "Razón Social S.A.",
  "address_street": "Av. Principal",
  "address_number": "123",
  "city": "Santiago",
  "region_state": "Región Metropolitana",
  "country_code": "CL",
  "latitude": -33.4372,
  "longitude": -70.6506
}
Response:

{
  "id": "uuid",
  "name": "Nombre del Local",
  "legal_name": "Razón Social S.A.",
  "owner_id": "uuid",
  "is_verified": false,
  "operational_status": "open",
  "created_at": "2025-11-27T10:30:00Z"
}
Códigos de Estado:

201 - Venue creado exitosamente
400 - Datos inválidos
401 - No autenticado
GET /venues-admin/venues/{venue_id}
Obtiene el detalle B2B de un venue específico.

Headers:

Authorization: Bearer <token>
Response:

{
  "id": "uuid",
  "name": "Nombre del Local",
  "legal_name": "Razón Social S.A.",
  "owner_id": "uuid",
  "is_verified": true,
  "operational_status": "open",
  "address_display": "Av. Principal 123, Santiago",
  "location": {
    "lat": -33.4372,
    "lng": -70.6506
  },
  "rating_average": 4.5,
  "review_count": 120,
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-11-27T10:30:00Z"
}
Códigos de Estado:

200 - Éxito
401 - No autenticado
403 - Sin permisos (no es owner ni miembro del equipo)
404 - Venue no encontrado
👑 Admin (SUPER_ADMIN)
Nota: Estos endpoints requieren rol SUPER_ADMIN

GET /admin/venues
Lista todos los venues del sistema con filtros y paginación.

Headers:

Authorization: Bearer <token>
Query Parameters:

search (string, opcional) - Buscar por nombre, razón social o dirección
city (string, opcional) - Filtrar por ciudad
verification_status (string, opcional) - pending, verified, rejected
operational_status (string, opcional) - open, closed, temporarily_closed
skip (int, opcional) - Offset para paginación. Default: 0
limit (int, opcional) - Items por página (max 100). Default: 20
sort_by (string, opcional) - Campo para ordenar: name, created_at, rating_average. Default: created_at
sort_order (string, opcional) - Orden: asc, desc. Default: desc
Ejemplo:

GET /api/v1/admin/venues?search=cafe&city=Santiago&limit=10&sort_by=name&sort_order=asc
Response:

{
  "venues": [
    {
      "id": "uuid",
      "name": "Café Central",
      "legal_name": "Café Central S.A.",
      "city": "Santiago",
      "is_verified": true,
      "operational_status": "open",
      "rating_average": 4.5,
      "review_count": 120,
      "created_at": "2025-01-15T10:00:00Z"
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 10
}
Códigos de Estado:

200 - Éxito
401 - No autenticado
403 - No es SUPER_ADMIN
GET /admin/venues/{venue_id}
Obtiene el detalle completo de un venue (vista administrativa).

Headers:

Authorization: Bearer <token>
Response:

{
  "id": "uuid",
  "name": "Nombre del Local",
  "legal_name": "Razón Social S.A.",
  "slug": "nombre-del-local",
  "slogan": "El mejor lugar",
  "logo_url": "https://...",
  "cover_image_urls": ["https://...", "https://..."],
  "overview": "Descripción completa del local...",
  
  "owner_id": "uuid",
  "is_verified": true,
  "trust_tier": "premium",
  "operational_status": "open",
  
  "address_street": "Av. Principal",
  "address_number": "123",
  "address_display": "Av. Principal 123, Santiago",
  "city": "Santiago",
  "region_state": "Región Metropolitana",
  "country_code": "CL",
  "timezone": "America/Santiago",
  "location": {
    "lat": -33.4372,
    "lng": -70.6506
  },
  
  "rating_average": 4.5,
  "review_count": 120,
  "price_tier": 2,
  "avg_price_min": 5000,
  "avg_price_max": 15000,
  "currency_code": "CLP",
  
  "opening_hours": {
    "monday": "09:00-22:00",
    "tuesday": "09:00-22:00"
  },
  "payment_methods": {
    "cash": true,
    "credit_card": true,
    "debit_card": true
  },
  "amenities": {
    "wifi": true,
    "parking": false,
    "outdoor_seating": true
  },
  "features_config": {
    "reservations_enabled": true,
    "delivery_enabled": false
  },
  
  "team": [
    {
      "user_id": "uuid",
      "role": "VENUE_OWNER",
      "full_name": "Juan Pérez"
    }
  ],
  
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-11-27T10:30:00Z"
}
Códigos de Estado:

200 - Éxito
401 - No autenticado
403 - No es SUPER_ADMIN
404 - Venue no encontrado
PATCH /admin/venues/{venue_id}
Actualiza la información de un venue.

Headers:

Authorization: Bearer <token>
Content-Type: application/json
Request:

{
  "name": "Nuevo Nombre",
  "verification_status": "verified",
  "is_operational": true,
  "address": {
    "address_display": "Nueva Dirección 123",
    "city": "Santiago",
    "latitude": -33.45,
    "longitude": -70.66
  }
}
Response: Retorna el objeto 

VenueAdminDetail
 actualizado (ver GET /admin/venues/{venue_id}).

Códigos de Estado:

200 - Éxito
400 - Datos inválidos
403 - No es SUPER_ADMIN
404 - Venue no encontrado
GET /admin/metrics
Obtiene métricas globales del sistema para el dashboard.

Query Parameters:

period (string, opcional) - 24h, 7d, 30d, 90d, 

all
. Default: 30d
Response:

{
  "totals": {
    "total_users": 1250,
    "total_venues": 45,
    "total_reviews": 3420,
    "total_verified_visits": 125000,
    "active_users_last_30d": 850
  },
  "venues": {
    "by_status": { "verified": 30, "pending": 10, "rejected": 5 },
    "by_operational_status": { "operational": 38, "inactive": 7 },
    "by_city": [ { "city": "Santiago", "count": 25 } ],
    "founder_venues": 8
  },
  "users": { ... },
  "activity": { ... },
  "top_venues": [ ... ]
}
GET /admin/users
Lista todos los usuarios del sistema.

Query Parameters:

search (string, opcional) - Email o nombre

role
 (string, opcional)
is_active (bool, opcional)
skip, limit, sort_by, sort_order
Response:

{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "display_name": "Juan Pérez",
      "roles": ["APP_USER", "VENUE_OWNER"],
      "is_active": true,
      "created_at": "..."
    }
  ],
  "total": 1250
}
GET /admin/users/{user_id}
Obtiene detalle completo de un usuario.

Response:

{
  "id": "uuid",
  "email": "user@example.com",
  "display_name": "Juan Pérez",
  "reputation_score": 100,
  "points_current": 500,
  "points_lifetime": 1200,
  "roles": [
    {
      "role_name": "VENUE_OWNER",
      "venue_name": "Bar La Junta",
      "is_active": true
    }
  ],
  "auth_info": { ... },
  "activity": { ... },
  "venues_owned": [ ... ]
}
PATCH /admin/users/{user_id}
Actualiza perfil de usuario.

Request:

{
  "display_name": "Nuevo Nombre",
  "reputation_score": 150,
  "points_current": 600
}
Response: Retorna el objeto 

UserAdminDetail
 actualizado.

🔒 Autenticación y Autorización
Flujo de Autenticación
Login:

const response = await fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: 'username=admin@urbanvibe.cl&password=password123'
});
const { access_token } = await response.json();
// Guardar token en AsyncStorage o SecureStore
Usar Token en Requests:

const response = await fetch('http://localhost:8000/api/v1/profiles/me', {
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  }
});
Verificar Roles:

const profile = await response.json();
const isSuperAdmin = profile.roles.includes('SUPER_ADMIN');
const isVenueOwner = profile.roles.includes('VENUE_OWNER');
📊 Códigos de Estado HTTP
Código	Significado
200	Éxito
201	Recurso creado exitosamente
400	Request inválido (datos incorrectos)
401	No autenticado (token inválido o faltante)
403	Sin permisos (autenticado pero sin autorización)
404	Recurso no encontrado
500	Error interno del servidor
🚀 Ejemplos de Uso (React Native)
Login y Guardar Token
import AsyncStorage from '@react-native-async-storage/async-storage';
async function login(email, password) {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);
  const response = await fetch('http://localhost:8000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString()
  });
  if (!response.ok) {
    throw new Error('Login failed');
  }
  const { access_token } = await response.json();
  await AsyncStorage.setItem('access_token', access_token);
  
  return access_token;
}
Obtener Perfil del Usuario
async function getProfile() {
  const token = await AsyncStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/api/v1/profiles/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  return await response.json();
}
Obtener Venues para Mapa
async function getVenuesForMap() {
  const response = await fetch('http://localhost:8000/api/v1/venues/map?limit=200');
  
  if (!response.ok) {
    throw new Error('Failed to fetch venues');
  }
  return await response.json();
}
Crear Check-in
async function createCheckin(qrToken, latitude, longitude) {
  const token = await AsyncStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/api/v1/checkins/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token_id: qrToken,
      user_lat: latitude,
      user_lng: longitude
    })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Check-in failed');
  }
  return await response.json();
}
🔄 Modo Demo vs Modo Real
El backend puede funcionar en dos modos:

Modo Demo (DEMO_MODE=1)
Login acepta cualquier email/password
Retorna token hardcodeado "demo"
Útil para desarrollo y pruebas
Modo Real (DEMO_MODE=0)
Login valida credenciales contra Supabase Auth
Retorna tokens JWT reales
Requiere usuarios existentes en la base de datos
Usuarios de Prueba Disponibles:

Email	Password	Rol

admin@urbanvibe.cl
password123	VENUE_OWNER

administradorapp@urbanvibe.cl
password123	SUPER_ADMIN

local@urbanvibe.cl
password123	VENUE_OWNER

usuario@urbanvibe.cl
password123	APP_USER
📝 Notas Importantes
CORS: El backend acepta requests desde http://localhost:19006 y http://localhost:8081 (Expo dev server)

Geolocalización: Los check-ins requieren coordenadas GPS precisas para validar el geofence

Paginación: Usa skip y limit para paginar resultados grandes

Tokens JWT: Los tokens expiran después de 8 días. Implementar refresh token si es necesario

Roles Dinámicos: Los roles se calculan dinámicamente basados en:

JWT claim app_role
Ownership de venues
Membresía en 

venue_team
Formato de Coordenadas:

Latitud: -90 a 90
Longitud: -180 a 180
Formato: { "lat": -33.4372, "lng": -70.6506 }