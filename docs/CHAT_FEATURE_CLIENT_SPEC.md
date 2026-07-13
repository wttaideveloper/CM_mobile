# InvigorateHealth — Live Chat Feature
**Client Document | User ↔ Enterprise / Service Provider**

---

## What We Are Building

A **Practo-style chat** where:

- **Mobile users** message clinics/enterprises about a **service** or **appointment**
- **Enterprise admin & service providers** reply from the **web dashboard**
- Messages are **live** (Socket.IO) with **history**, **read receipts**, and **push notifications**
- **Free preview chat** before booking; **full chat** after booking
- **Premium plans** limit how many messages can be sent per month

---

## 1. Where Chat Appears

### Mobile App (User)

| Screen | What user sees |
|--------|----------------|
| **Service page** | **Chat** button on each service |
| **Appointment page** | **Chat** button (enabled after booking) |
| **Chat screen** | Full conversation with clinic/provider |

### Web App (Enterprise)

| Who | Login | What they see |
|-----|-------|---------------|
| **Enterprise Admin** | Web dashboard | All patient chats for the clinic |
| **Service Provider / Doctor** | Staff login (created by admin) | Chats assigned to them only |

> Same chat on **service page** on mobile and web.

---

## 2. Chat Access Rules

### Step-by-step: When can user chat?

| Step | Stage | Can user send messages? | Limit |
|------|-------|-------------------------|-------|
| 1 | **Before booking** | Yes — preview only | **5 messages** + **24 hour** window |
| 2 | Limit reached | No | Show: *"Book this service to continue chatting"* |
| 3 | **After booking** | Yes — full chat | Based on **subscription plan** |
| 4 | **During appointment** | Yes — active | Plan limit applies |
| 5 | **After service done** | Read only | **48 hours**, then chat closes |
| 6 | **Want to chat again** | Must **book again** | New conversation rules apply |

### Premium / Subscription Message Limits

| Plan | Messages per month | When limit reached |
|------|-------------------|-------------------|
| **Free** | 50 | Alert: *"Upgrade to continue chatting"* |
| **Basic** | 500 | Alert: *"Upgrade to Premium"* |
| **Premium** | Unlimited | No limit |

> Backend counts every message sent. User and enterprise both see remaining count.

---

## 3. Complete Flow (Start → End)

### FLOW A — User opens chat from Service page (before booking)

```
STEP 1   User browses services in mobile app
STEP 2   User taps "Chat" on a service
STEP 3   App calls API → create/get conversation
STEP 4   App loads last 20 old messages (if any)
STEP 5   App connects Socket.IO → joins chat room
STEP 6   User types and sends message (live via Socket.IO)
STEP 7   Clinic/provider sees message on web inbox (live)
STEP 8   Provider replies → user sees instantly on mobile
STEP 9   User sends up to 5 preview messages
STEP 10  Limit reached → chat input disabled
         Banner: "Book this service to continue chatting"
STEP 11  User books appointment → full chat unlocks
```

---

### FLOW B — User chats after booking appointment

```
STEP 1   User completes appointment booking
STEP 2   "Chat" button appears on appointment screen
STEP 3   User taps Chat → conversation opens (full access)
STEP 4   App loads message history + connects Socket.IO
STEP 5   User and provider chat freely (text, images, files, voice)
STEP 6   Typing indicator shows when other person is typing
STEP 7   Read receipts show ✓ sent  ✓✓ seen
STEP 8   If user closes app → push notification on new reply
STEP 9   User reopens → history loads + Socket.IO reconnects
```

---

### FLOW C — Service completed (chat closing)

```
STEP 1   Provider marks appointment as completed
STEP 2   Chat enters "read-only" mode for 48 hours
STEP 3   User can read old messages but cannot send new ones
STEP 4   After 48 hours → chat fully closed
STEP 5   Message shown: "Book again to start a new chat"
```

---

### FLOW D — Provider replies from web

```
STEP 1   Provider logs into enterprise web dashboard
STEP 2   Opens Chat Inbox → sees patient messages
STEP 3   Clicks conversation → message history loads (REST API)
STEP 4   Socket.IO connects → joins same chat room as patient
STEP 5   Provider types reply → patient receives live on mobile
STEP 6   Patient reads message → provider sees ✓✓ seen
STEP 7   If patient offline → push notification sent to mobile
```

---

### FLOW E — Premium message limit reached

```
STEP 1   Enterprise sends messages throughout the month
STEP 2   Backend counts: 499 / 500 (Basic plan)
STEP 3   Next message attempt → blocked by server
STEP 4   Alert shown: "Monthly message limit reached. Upgrade plan."
STEP 5   Admin sees usage in dashboard
STEP 6   After plan upgrade → limit resets → chat continues
```

---

## 4. Technology

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Live messaging | **Socket.IO** | Send/receive, typing, seen, online status |
| History & files | **REST API** | Load old messages, upload images/docs |
| Offline alerts | **Push notifications** | Notify when app is closed |
| File storage | **S3 / Cloud** | Store images, PDFs, voice notes |

---

## 5. REST APIs Required (22 Total)

**Base URL:** `https://api.yourdomain.com`

| # | Method | API | Used when |
|---|--------|-----|-----------|
| 1 | POST | `/auth/login` | User / admin / provider login |
| 2 | POST | `/api/v1/devices/register` | Register mobile for push alerts |
| 3 | GET | `/api/v1/chat/unread-count` | Show total unread badge |
| 4 | GET | `/api/v1/chat/unread-counts` | Show unread on each Chat button |
| 5 | POST | `/api/v1/chat/conversations` | Start or open a chat |
| 6 | GET | `/api/v1/chat/conversations` | Load inbox (all chats) |
| 7 | GET | `/api/v1/chat/conversations/{id}` | Load chat details + access rules |
| 8 | GET | `/api/v1/chat/conversations/{id}/messages` | Load old messages (scroll up) |
| 9 | PATCH | `/api/v1/chat/conversations/{id}/read` | Mark messages as read |
| 10 | POST | `/api/v1/chat/upload` | Upload image / PDF / voice |
| 11 | PATCH | `/api/v1/chat/conversations/{id}/messages/{msg_id}` | Edit a message |
| 12 | DELETE | `/api/v1/chat/conversations/{id}/messages/{msg_id}` | Delete a message |
| 13 | GET | `/api/v1/chat/conversations/{id}/messages/search?q=` | Search inside one chat |
| 14 | GET | `/api/v1/chat/messages/search?q=` | Search all chats |
| 15 | GET | `/api/v1/chat/subscription/usage` | Show plan usage (e.g. 120/500) |
| 16 | POST | `/api/v1/chat/conversations/group` | Create group chat *(Phase 2)* |
| 17 | GET | `/api/v1/chat/conversations/{id}/members` | List group members *(Phase 2)* |
| 18 | POST | `/api/v1/chat/conversations/{id}/members` | Add group member *(Phase 2)* |
| 19 | DELETE | `/api/v1/chat/conversations/{id}/members/{user_id}` | Remove from group *(Phase 2)* |
| 20 | PATCH | `/api/v1/chat/conversations/{id}` | Update group name *(Phase 2)* |
| 21 | GET | `/api/v1/chat/staff` | Admin lists providers/staff |
| 22 | PATCH | `/api/v1/chat/conversations/{id}/assign` | Admin assigns chat to provider |

---

## 6. Socket.IO Events (Live Chat)

**Connection:** `https://api.yourdomain.com` with JWT token

### App sends → Server

| Event | When |
|-------|------|
| `join` | User/provider opens chat screen |
| `leave` | User/provider closes chat screen |
| `message:send` | Send a new message |
| `typing:start` | User starts typing |
| `typing:stop` | User stops typing |
| `message:read` | User reads messages |
| `message:edit` | Edit own message |
| `message:delete` | Delete own message |

### Server sends → App

| Event | When |
|-------|------|
| `message:ack` | Your message was saved ✓ |
| `message:new` | New message received |
| `message:delivered` | Message reached other device |
| `message:read_receipt` | Other person saw your message ✓✓ |
| `typing` | Other person is typing... |
| `message:edited` | Message was edited |
| `message:deleted` | Message was deleted |
| `unread:updated` | Unread badge count changed |
| `presence:online` | Other person came online |
| `presence:offline` | Other person went offline |
| `chat:limit_reached` | Preview or plan limit hit |

---

## 7. Mobile Packages to Install

```bash
npm install socket.io-client

npx expo install expo-image-picker
npx expo install expo-document-picker
npx expo install expo-av
npx expo install expo-notifications
npx expo install expo-file-system
```

| Package | Purpose | Cost |
|---------|---------|------|
| socket.io-client | Live chat connection | Free |
| expo-image-picker | Send photos | Free |
| expo-document-picker | Send PDF / documents | Free |
| expo-av | Voice record & play | Free |
| expo-notifications | Alert when app is closed | Free |
| expo-file-system | File handling | Free |

**Already in the app (no install needed):** axios, react-query, zustand

---

## 8. What Backend Must Build

| Item | Responsibility |
|------|---------------|
| 22 REST APIs | Listed in Section 5 |
| Socket.IO server | Live events in Section 6 |
| Database | Store conversations & messages |
| File storage (S3) | Store uploaded files |
| Push service | Notify offline users |
| Message counter | Track preview limit (5) + plan limit (50/500/unlimited) |
| Access rules | Enforce before/after booking states |
| Staff accounts | Provider login under enterprise |

---

## 9. Summary

| Item | Detail |
|------|--------|
| Chat entry (mobile) | Service page + Appointment page |
| Chat entry (web) | Enterprise dashboard inbox |
| Live technology | **Socket.IO** |
| REST APIs | **22** |
| Socket.IO events | **18** |
| Mobile packages | **6** (all free) |
| Preview before booking | **5 messages / 24 hours** |
| After service done | **Read-only 48 hours** |
| Free plan | **50 messages/month** |
| Basic plan | **500 messages/month** |
| Premium plan | **Unlimited** |

---

## 10. Decisions Needed from Client

Please confirm:

| # | Question | Our suggestion |
|---|----------|---------------|
| 1 | Preview message limit before booking | 5 messages |
| 2 | Preview time window | 24 hours |
| 3 | Read-only period after service | 48 hours |
| 4 | Free plan monthly limit | 50 messages |
| 5 | Basic plan monthly limit | 500 messages |
| 6 | Provider replies count against user preview limit? | No |
| 7 | Group chat in first release? | Phase 2 |

---

*InvigorateHealth — Chat Feature Specification v1.0*
