# Task Connect
*Task Management + Service Marketplace + Scheduling System + Full Observability*

## 🎯 Platform Overview

**Core Business Model**: Connect service providers (freelancers, contractors, consultants) with customers while providing robust task and project management tools.

**Your Use Case**: Manage your own tasks, schedule, and projects while building a platform others can use.

**Infrastructure**: Ubuntu Server 16GB + Docker + Cloudflare Tunnel + Full Monitoring Stack

---

## 🏗️ System Architecture

### **Microservices Breakdown**

#### **1. Authentication & Authorization Service**
- **Keycloak**: OIDC/OAuth2 authentication, user management, SSO
- **Purpose**: Centralized auth, user profiles, role-based access control
- **Database**: PostgreSQL (Keycloak's backend)
- **Cache**: Redis (sessions, tokens, user preferences)

#### **2. Service Marketplace Service**
- **Purpose**: Service listings, categories, search
- **Database**: PostgreSQL (services, categories, reviews)
- **Cache**: Redis (popular services, search results)

#### **3. Task Management Service** ⭐
- **Purpose**: Personal task management, project organization
- **Database**: PostgreSQL (tasks, projects, time logs)
- **Features**: Task creation, scheduling, time tracking, progress monitoring

#### **4. Booking & Scheduling Service**
- **Purpose**: Appointment booking, calendar management
- **Database**: PostgreSQL (bookings, availability, calendar events)
- **Integration**: Google Calendar, Outlook

#### **5. Notes & Documentation Service** ⭐
- **Purpose**: Google Keep-like note management
- **Database**: PostgreSQL (notes, tags, attachments)
- **Features**: Rich text, file attachments, tagging, search

#### **6. Notification Service**
- **Purpose**: Email, SMS, push notifications
- **Message Queue**: RabbitMQ (email-queue, sms-queue, push-queue)
- **Integrations**: SendGrid, Twilio, Firebase

---

## 📊 Message Queue Architecture

### **RabbitMQ Queues & Workflows**

```
Task Created → task-created-queue → Update Statistics + Send Reminders
Booking Made → booking-confirmed-queue → Send Confirmation + Calendar Update
Service Completed → service-completed-queue → Payment Processing + Review Request
Daily Schedule → schedule-reminder-queue → Send Daily Agenda
Project Updated → project-updated-queue → Notify Team Members
```

### **Key Message Patterns**
- **Task Automation**: Auto-schedule recurring tasks
- **Smart Reminders**: Context-aware notifications
- **Work Logging**: Automatic time tracking integration
- **Project Analytics**: Real-time progress reporting

---

## 🐳 Local Development Setup

### **Database Infrastructure**
The local development environment uses Docker Compose to set up the following services:

1. **PostgreSQL Database**
   - Multiple databases for different services (users, tasks, notes, etc.)
   - Each database has its own user and password
   - Exposed on port 15432 for local development
   - Includes initialization scripts for database and user creation

2. **Keycloak Authentication**
   - Integrated with PostgreSQL for user management
   - Configured for local development with simplified security
   - Exposed on port 18080
   - Includes realm configuration for development

3. **Vault Secrets Management**
   - Stores database credentials securely
   - Manages service-to-service authentication
   - Exposed on port 18200
   - Includes automatic initialization and unsealing
   - Stores database credentials in a structured format:
     ```
     secret/data/databases/
     ├── users/
     ├── tasks/
     ├── notes/
     ├── notifications/
     ├── payments/
     └── bookings/
     ```

### **Local Development Workflow**
1. Start the database infrastructure:
   ```bash
   ./start-databases.sh
   ```
   This script:
   - Creates necessary directories and files
   - Starts PostgreSQL, Keycloak, and Vault
   - Initializes databases and users
   - Stores credentials in Vault

2. Access the services:
   - PostgreSQL: localhost:15432
   - Keycloak: localhost:18080
   - Vault: localhost:18200

3. Development services can connect using:
   - Database credentials from Vault
   - Keycloak for authentication
   - Environment variables for configuration

---

## 🔐 Security & Authentication

### **Authentication Flow**
```
User Login → Keycloak → JWT Token → API Gateway → Service Authorization
```

### **Secrets Management Flow**
```
Service Startup → Vault Authentication → Retrieve Secrets → Configure Service
```

### **Vault Configuration**

#### **Secrets Structure**
```
secret/
├── databases/
│   ├── users/
│   │   ├── host: localhost
│   │   ├── port: 15432
│   │   ├── database: users
│   │   ├── username: users_user
│   │   └── password: <encrypted>
│   ├── tasks/
│   │   ├── host: localhost
│   │   ├── port: 15432
│   │   ├── database: tasks
│   │   ├── username: tasks_user
│   │   └── password: <encrypted>
│   ├── notes/
│   │   ├── host: localhost
│   │   ├── port: 15432
│   │   ├── database: notes
│   │   ├── username: notes_user
│   │   └── password: <encrypted>
│   ├── notifications/
│   │   ├── host: localhost
│   │   ├── port: 15432
│   │   ├── database: notifications
│   │   ├── username: notifications_user
│   │   └── password: <encrypted>
│   ├── payments/
│   │   ├── host: localhost
│   │   ├── port: 15432
│   │   ├── database: payments
│   │   ├── username: payments_user
│   │   └── password: <encrypted>
│   └── bookings/
│       ├── host: localhost
│       ├── port: 15432
│       ├── database: bookings
│       ├── username: bookings_user
│       └── password: <encrypted>
├── external-apis/
│   ├── sendgrid-key
│   ├── twilio-credentials
│   └── stripe-keys
├── services/
│   ├── rabbitmq-connection
│   ├── redis-connection
│   └── keycloak-secrets
└── certificates/
    ├── ssl-certs
    └── signing-keys
```

Each database secret contains:
- **host**: Database server hostname
- **port**: Database server port
- **database**: Database name
- **username**: Database user
- **password**: Encrypted database password

Services can access their database credentials using the path: `secret/data/databases/<service-name>`

---

## 🐳 Docker Compose Configuration

### **Production-Ready Setup**


## 🚀 Deployment Strategies

### **Strategy 1: Single Server Deployment**
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Resource monitoring
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Health checks
curl http://localhost:8080/health
```

### **Strategy 2: Blue-Green Deployment**
```bash
# Deploy green environment
docker-compose -f docker-compose.green.yml up -d

# Test green environment
./scripts/health-check.sh green

# Switch traffic (update nginx config)
docker-compose exec nginx nginx -s reload

# Cleanup blue environment
docker-compose -f docker-compose.blue.yml down
```

### **Strategy 3: Rolling Updates**
```bash
# Update services one by one
docker-compose up -d --no-deps task-service
docker-compose up -d --no-deps booking-service
docker-compose up -d --no-deps notes-service
```

---

## 📋 Feature Implementation Roadmap

### **Phase 1: Core Platform (Weeks 1-2)**
- [ ] User authentication & profiles
- [ ] Basic task management (CRUD)
- [ ] Simple note-taking functionality
- [ ] PostgreSQL setup with Entity Framework
- [ ] Redis caching for user sessions

### **Phase 2: Service Marketplace (Weeks 3-4)**
- [ ] Service provider registration
- [ ] Service listings & categories
- [ ] Basic search functionality
- [ ] Review & rating system
- [ ] RabbitMQ integration for notifications

### **Phase 3: Advanced Task Management (Weeks 5-6)**
- [ ] Project organization & hierarchies
- [ ] Time tracking & work logging
- [ ] Recurring task automation
- [ ] Calendar integration
- [ ] Progress analytics & reporting

### **Phase 4: Scheduling & Booking (Weeks 7-8)**
- [ ] Availability management
- [ ] Booking system with conflicts detection
- [ ] Google Calendar sync
- [ ] Automated reminders
- [ ] Payment integration (Stripe)

### **Phase 5: Notes & Collaboration (Weeks 9-10)**
- [ ] Rich text editor
- [ ] File attachments & media
- [ ] Tagging & organization
- [ ] Full-text search
- [ ] Shared notes & collaboration

---

## 🎯 Your Personal Use Cases

### **Daily Workflow Integration**
1. **Morning**: Check daily schedule via API
2. **Work**: Log tasks, track time, take notes
3. **Bookings**: Manage client appointments
4. **Evening**: Review completed work, plan tomorrow

### **API Endpoints for Personal Use**
```
GET /api/tasks/today - Today's tasks
POST /api/work-logs - Log work session
GET /api/schedule/week - Weekly schedule
POST /api/notes - Quick note capture
GET /api/analytics/productivity - Personal productivity metrics
```

---

## 💡 Enterprise Learning Opportunities

- **Microservices Communication**: Service-to-service messaging
- **Event-Driven Architecture**: Task completion triggers multiple actions
- **CQRS Pattern**: Separate read/write models for analytics
- **Background Processing**: Scheduled tasks, notifications, file processing
- **Caching Strategies**: Redis for performance optimization
- **Database Design**: Multi-tenant architecture considerations
- **Security**: JWT authentication, API rate limiting
- **Monitoring**: Health checks, logging, metrics collection

---


## 🔧 .NET 8 Integration Code

### **Keycloak JWT Validation**

### **Vault Secrets Integration**

---

## 🔧 Updated Resource Allocation (16GB Server)

- **PostgreSQL**: 2.5GB (multiple databases: main, keycloak, vault)
- **Keycloak**: 1GB
- **Vault**: 512MB
- **Redis**: 768MB
- **RabbitMQ**: 512MB
- **API Services**: ~3.5GB (7 services × 512MB)
- **Background Services**: 512MB
- **Nginx + Monitoring**: 256MB
- **System Overhead**: ~2GB
- **Available for Growth**: ~4.5GB

This setup gives you **enterprise-grade security** with proper secrets management and authentication!
