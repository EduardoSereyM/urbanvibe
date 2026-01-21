# Documentación API Backend - UrbanVibe

**Proyecto:** UrbanVibe - Plataforma de descubrimiento urbano
**Backend:** FastAPI + PostgreSQL (Supabase)

Esta documentación detalla todos los endpoints disponibles en la API REST.

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

### [POST] `POST /`

**Función:** `create_checkin`

---

### [GET] `GET /me`

**Función:** `get_my_checkins`

---

### [POST] `POST /scan`

**Función:** `scan_qr`

---

## Contact

**Archivo:** `app/api/v1/endpoints/contact.py`

### [POST] `POST /`

**Función:** `send_contact_email`

---

## Friends

**Archivo:** `app/api/v1/endpoints/friends.py`

### [POST] `POST /invite-to-venue`

**Función:** `invite_friend_to_venue`

---

### [GET] `GET /list`

**Función:** `get_friends_list`

---

### [GET] `GET /profile/{user_id}`

**Función:** `get_public_profile`

---

### [POST] `POST /request/{friend_id}`

**Función:** `send_friend_request`

---

### [PATCH] `PATCH /requests/{friendship_id}/action`

**Función:** `handle_friend_request`

---

### [GET] `GET /search`

**Función:** `search_users`

---

### [GET] `GET /venue-invitations`

**Función:** `get_venue_invitations`

---

### [GET] `GET /venue-invitations/received`

**Función:** `get_received_venue_invitations`

---

### [GET] `GET /venue-invitations/sent`

**Función:** `get_sent_venue_invitations`

---

### [PATCH] `PATCH /venue-invitations/{invitation_id}/action`

**Función:** `handle_venue_invitation`

---

### [DELETE] `DELETE /{friendship_id}`

**Función:** `remove_friend`

---

## Gamification

**Archivo:** `app/api/v1/endpoints/gamification.py`

### [GET] `GET /my-history`

**Función:** `get_my_points_history`

---

### [GET] `GET /my-stats`

**Función:** `get_my_point_stats`

---

## Groups

**Archivo:** `app/api/v1/endpoints/groups.py`

### [POST] `POST /`

**Función:** `create_group`

---

### [GET] `GET /invitations/received`

**Función:** `get_received_group_invitations`

---

### [PATCH] `PATCH /invitations/{invitation_id}/action`

**Función:** `handle_group_invitation`

---

### [GET] `GET /my-groups`

**Función:** `get_my_groups`

---

### [GET] `GET /profile/{user_id}`

**Función:** `get_user_public_groups`

---

### [GET] `GET /{group_id}`

**Función:** `get_group_detail`

---

### [POST] `POST /{group_id}/invite`

**Función:** `invite_to_group`

---

### [GET] `GET /{group_id}/members`

**Función:** `get_group_members`

---

### [DELETE] `DELETE /{group_id}/members/{user_id}`

**Función:** `remove_group_member`

---

## Health

**Archivo:** `app/api/v1/endpoints/health.py`

### [GET] `GET /health`

**Función:** `health_check`

---

## Mobile

**Archivo:** `app/api/v1/endpoints/mobile.py`

### [GET] `GET /explore-context`

**Función:** `get_explore_context_bff`

---

### [GET] `GET /favorites`

**Función:** `get_user_hydrated_favorites`

---

### [GET] `GET /profile-context`

**Función:** `get_profile_context_bff`

---

### [GET] `GET /venue-details/{venue_id}`

**Función:** `get_venue_detail_bff`

---

### [GET] `GET /venues-list`

**Función:** `get_venues_list_bff`

---

## Notifications

**Archivo:** `app/api/v1/endpoints/notifications.py`

### [GET] `GET /`

**Función:** `get_my_notifications`

---

### [POST] `POST /device`

**Función:** `register_device`

---

### [GET] `GET /unread-count`

**Función:** `get_unread_count`

---

### [POST] `POST /user-created`

**Función:** `notify_user_created_event`

---

### [PATCH] `PATCH /{notification_id}/read`

**Función:** `mark_notification_read`

---

## Profiles

**Archivo:** `app/api/v1/endpoints/profiles.py`

### [GET] `GET /me`

**Función:** `read_me`

---

### [PATCH] `PATCH /me`

**Función:** `update_me`

---

### [GET] `GET /me/ambassador`

**Función:** `get_ambassador_status`

---

### [GET] `GET /me/favorites`

**Función:** `get_my_favorites`

---

### [DELETE] `DELETE /me/favorites/{venue_id}`

**Función:** `remove_favorite`

---

### [POST] `POST /me/favorites/{venue_id}`

**Función:** `add_favorite`

---

### [POST] `POST /me/referral/claim`

**Función:** `claim_referral`

---

## Promotions

**Archivo:** `app/api/v1/endpoints/promotions.py`

### [GET] `GET /me/wallet`

**Función:** `get_my_wallet`

---

### [POST] `POST /promotions/{promotion_id}/claim`

**Función:** `claim_promotion`

---

### [GET] `GET /venues/{venue_id}/promotions`

**Función:** `get_venue_promotions_user`

---

## Venue_Team

**Archivo:** `app/api/v1/endpoints/venue_team.py`

### [GET] `GET /{venue_id}/team`

**Función:** `list_team_members`

---

### [POST] `POST /{venue_id}/team`

**Función:** `add_team_member`

---

### [PATCH] `PATCH /{venue_id}/team/{member_id}`

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
