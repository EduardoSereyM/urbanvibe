# Documentación API Backend - UrbanVibe

**Proyecto:** UrbanVibe - Plataforma de descubrimiento urbano  
**Backend:** FastAPI + PostgreSQL (Supabase)  
**Versión:** V14 (Grupos y Gamificación)  
**Base URL (Producción):** `https://backenduv.onrender.com`

Esta documentación detalla todos los endpoints disponibles en la API REST.

## Convenciones

- 🔹 **GET** - Consulta de recursos
- 🟢 **POST** - Creación de recursos
- 🟡 **PUT** - Actualización completa
- 🟠 **PATCH** - Actualización parcial
- 🔴 **DELETE** - Eliminación de recursos

**Autenticación:** La mayoría de endpoints requieren un token JWT de Supabase en el header:  
`Authorization: Bearer <token>`

---

## Índice

- [Checkins](#checkins) (3 endpoints)
- [Contact](#contact) (1 endpoints)
- [Friends](#friends) (11 endpoints)
- [Gamification](#gamification) (2 endpoints)
- [Groups](#groups) (9 endpoints)
- [Health](#health) (1 endpoints)
- [Mobile](#mobile) (5 endpoints)
- [Notifications](#notifications) (5 endpoints)
- [Profiles](#profiles) (7 endpoints)
- [Promotions](#promotions) (3 endpoints)
- [Venue_Team](#venue-team) (3 endpoints)

---

## Checkins

**Archivo:** `app/api/v1/endpoints/checkins.py`

### 🟢 `POST /`

**Función:** `create_checkin`

---

### 🔹 `GET /me`

**Función:** `get_my_checkins`

---

### 🟢 `POST /scan`

**Función:** `scan_qr`

---

## Contact

**Archivo:** `app/api/v1/endpoints/contact.py`

### 🟢 `POST /`

**Función:** `send_contact_email`

---

## Friends

**Archivo:** `app/api/v1/endpoints/friends.py`

### 🟢 `POST /invite-to-venue`

**Función:** `invite_friend_to_venue`

---

### 🔹 `GET /list`

**Función:** `get_friends_list`

---

### 🔹 `GET /profile/{user_id}`

**Función:** `get_public_profile`

---

### 🟢 `POST /request/{friend_id}`

**Función:** `send_friend_request`

---

### 🟠 `PATCH /requests/{friendship_id}/action`

**Función:** `handle_friend_request`

---

### 🔹 `GET /search`

**Función:** `search_users`

---

### 🔹 `GET /venue-invitations`

**Función:** `get_venue_invitations`

---

### 🔹 `GET /venue-invitations/received`

**Función:** `get_received_venue_invitations`

---

### 🔹 `GET /venue-invitations/sent`

**Función:** `get_sent_venue_invitations`

---

### 🟠 `PATCH /venue-invitations/{invitation_id}/action`

**Función:** `handle_venue_invitation`

---

### 🔴 `DELETE /{friendship_id}`

**Función:** `remove_friend`

---

## Gamification

**Archivo:** `app/api/v1/endpoints/gamification.py`

### 🔹 `GET /my-history`

**Función:** `get_my_points_history`

---

### 🔹 `GET /my-stats`

**Función:** `get_my_point_stats`

---

## Groups

**Archivo:** `app/api/v1/endpoints/groups.py`

### 🟢 `POST /`

**Función:** `create_group`

---

### 🔹 `GET /invitations/received`

**Función:** `get_received_group_invitations`

---

### 🟠 `PATCH /invitations/{invitation_id}/action`

**Función:** `handle_group_invitation`

---

### 🔹 `GET /my-groups`

**Función:** `get_my_groups`

---

### 🔹 `GET /profile/{user_id}`

**Función:** `get_user_public_groups`

---

### 🔹 `GET /{group_id}`

**Función:** `get_group_detail`

---

### 🟢 `POST /{group_id}/invite`

**Función:** `invite_to_group`

---

### 🔹 `GET /{group_id}/members`

**Función:** `get_group_members`

---

### 🔴 `DELETE /{group_id}/members/{user_id}`

**Función:** `remove_group_member`

---

## Health

**Archivo:** `app/api/v1/endpoints/health.py`

### 🔹 `GET /health`

**Función:** `health_check`

---

## Mobile

**Archivo:** `app/api/v1/endpoints/mobile.py`

### 🔹 `GET /explore-context`

**Función:** `get_explore_context_bff`

---

### 🔹 `GET /favorites`

**Función:** `get_user_hydrated_favorites`

---

### 🔹 `GET /profile-context`

**Función:** `get_profile_context_bff`

---

### 🔹 `GET /venue-details/{venue_id}`

**Función:** `get_venue_detail_bff`

---

### 🔹 `GET /venues-list`

**Función:** `get_venues_list_bff`

---

## Notifications

**Archivo:** `app/api/v1/endpoints/notifications.py`

### 🔹 `GET /`

**Función:** `get_my_notifications`

---

### 🟢 `POST /device`

**Función:** `register_device`

---

### 🔹 `GET /unread-count`

**Función:** `get_unread_count`

---

### 🟢 `POST /user-created`

**Función:** `notify_user_created_event`

---

### 🟠 `PATCH /{notification_id}/read`

**Función:** `mark_notification_read`

---

## Profiles

**Archivo:** `app/api/v1/endpoints/profiles.py`

### 🔹 `GET /me`

**Función:** `read_me`

---

### 🟠 `PATCH /me`

**Función:** `update_me`

---

### 🔹 `GET /me/ambassador`

**Función:** `get_ambassador_status`

---

### 🔹 `GET /me/favorites`

**Función:** `get_my_favorites`

---

### 🔴 `DELETE /me/favorites/{venue_id}`

**Función:** `remove_favorite`

---

### 🟢 `POST /me/favorites/{venue_id}`

**Función:** `add_favorite`

---

### 🟢 `POST /me/referral/claim`

**Función:** `claim_referral`

---

## Promotions

**Archivo:** `app/api/v1/endpoints/promotions.py`

### 🔹 `GET /me/wallet`

**Función:** `get_my_wallet`

---

### 🟢 `POST /promotions/{promotion_id}/claim`

**Función:** `claim_promotion`

---

### 🔹 `GET /venues/{venue_id}/promotions`

**Función:** `get_venue_promotions_user`

---

## Venue_Team

**Archivo:** `app/api/v1/endpoints/venue_team.py`

### 🔹 `GET /{venue_id}/team`

**Función:** `list_team_members`

---

### 🟢 `POST /{venue_id}/team`

**Función:** `add_team_member`

---

### 🟠 `PATCH /{venue_id}/team/{member_id}`

**Función:** `update_team_member`

---

## Base de Datos

**Esquema completo:** Ver [esquemaddbb.md](./esquemaddbb.md)

### Tablas Principales

- `profiles` - Perfiles de usuario
- `venues` - Locales/Establecimientos
- `friendships` - Relaciones de amistad
- `groups` - Grupos de usuarios
- `group_members` - Miembros de grupos
- `group_invitations` - Invitaciones a grupos
- `venue_invitations` - Invitaciones a locales
- `gamification_logs` - Historial de puntos
- `badges` - Insignias disponibles
- `user_badges` - Insignias obtenidas por usuarios
- `challenges` - Retos activos
- `user_challenge_progress` - Progreso de retos

---

## Autenticación

**Método:** Bearer Token (JWT)
**Header:** `Authorization: Bearer <token>`

**Obtención del token:**
- Supabase Auth maneja la autenticación
- El token se valida mediante `get_current_user` dependency

---

**Documentación generada automáticamente** - Total de endpoints: 50
