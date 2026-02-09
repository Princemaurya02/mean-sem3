
## 👥 USER ROLES & PERMISSIONS

### **ADMIN USERS**

✅ **Full Permissions:**
- Create new cases
- Edit existing cases
- Update case status
- Delete cases
- Schedule hearings
- Modify hearings
- Upload documents
- Generate reports
- View all data

### **STAFF USERS**

✅ **View-Only Access:**
- View cases (read-only)
- View hearings (read-only)
- View calendar (read-only)
- View reports (read-only)
## 🚀 QUICK START

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend-angular
npm install
```

### Step 2: Create Users

```bash
cd backend
node seed.js
```

**Users Created:**

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin 1 | admin@court.com | Admin@123 |
| 👑 Admin 2 | john.admin@court.com | Admin@123 |
| 👥 Staff 1 | sarah@court.com | Staff@123 |
| 👥 Staff 2 | michael@court.com | Staff@123 |
| 👥 Staff 3 | emily@court.com | Staff@123 |

### Step 3: Start Backend

```bash
cd backend
npm run dev
```

### Step 4: Start Frontend

```bash
cd frontend-angular
ng serve
```

### Step 5: Test

```
Open: http://localhost:4200
```

**Test as Admin:**
```
Login: admin@court.com / Admin@123
- See "+ New Case" button
- See "+ Schedule Hearing" button
- Can create/edit everything
```

**Test as Staff:**
```
Login: sarah@court.com / Staff@123
- No "+ New Case" button
- No "+ Schedule Hearing" button
- Can only view data
- Sees "View Only" indicators
```

---

## 🎨 UI ENHANCEMENTS

### **Professional Design System**

**Colors:**
- Primary: Dark Navy (#1a1f3a)
- Secondary: Court Blue (#2c5aa0)
- Accent: Gold (#d4af37)
- Success: Green (#0f9960)
- Danger: Red (#db3737)

**Typography:**
- System fonts for better performance
- Clear hierarchy
- Professional spacing
- Readable sizes

**Components:**
- Enhanced cards with hover effects
- Professional tables
- Status badges
- Clean modals
- Smooth animations
- Loading states

